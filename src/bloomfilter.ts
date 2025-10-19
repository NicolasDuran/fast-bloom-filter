import * as fs from "node:fs";
import { fileURLToPath } from "node:url";

type FastBloomFilter = {
	addString(text: string): void; // Insert a UTF-8 string into the filter
	hasString(text: string): boolean; // Check a UTF-8 string
	add(buffer: Uint8Array): void; // Insert a raw byte buffer
	has(buffer: Uint8Array): boolean; // Check a raw byte buffer
	bitCount: number; // Total number of bits in the bit array
	hashCount: number; // Number of hash functions (k)
	dispose(): void; // Free all WASM-allocated memory
};

/**
 * Create a Bloom filter backed by a WebAssembly implementation.
 *
 * This function loads and instantiates `bloomfilter.wasm`, allocates the
 * underlying bitset inside the WASM linear memory, and returns a lightweight
 * runtime wrapper exposing convenient methods.
 *
 * Memory layout:
 * - A persistent bitset is allocated once via `malloc`, sized according to
 *   `bitCount` (rounded up to the next 32-bit boundary).
 * - A temporary input buffer (`bufferPtr`) is allocated and dynamically resized
 *   when strings or byte arrays are added / queried.
 *
 * HOW IT WORKS:
 * - Strings are UTF-8 encoded on the JS side and copied into WASM memory.
 *   The WASM function `bloom_add(...)` then reads the raw bytes, hashes them
 *   using `XXH3`, and sets multiple bits in the bitset.
 * - `has(...)` performs the same hashing logic and checks whether all probed
 *   bit positions are set.
 * - This is a **classic Bloom filter**: it offers *no false negatives* but may
 *   return *false positives* depending on `k` (hashCount) and bit density.
 *
 * Performance notes:
 * - Reuses a single scratch buffer to avoid allocating / freeing every call.
 *
 * @param bitCount   Desired number of bits in the filter. This value will be
 *                   rounded up to the nearest multiple of 32.
 *                   Example: passing 1,000,001 will internally become 1,000,032.
 *
 * @param hashCount  Number of hash rounds (k). More rounds reduce false
 *                   positives but increase CPU cost. Typical values are 4–12.
 *
 * @returns A `BloomFilter` object with:
 *   - `addString(str)`  → inserts a UTF-8 string
 *   - `hasString(str)`  → checks membership of a string
 *   - `add(buffer)`     → inserts binary data (Uint8Array)
 *   - `has(buffer)`     → checks membership of binary data
 *   - `bitCount` / `hashCount`
 *   - `dispose()`       → frees all WASM-allocated memory
 *
 * @example
 * ```ts
 * const filter = await FastFilterBloom(1_000_000, 7);
 * filter.addString("hello");
 * console.log(filter.hasString("hello")); // true
 * console.log(filter.hasString("world")); // maybe false
 * filter.dispose();
 * ```
 */
export default async function FastBloomFilter(
	bitCount: number, // Requested number of bits in the filter (may get rounded)
	hashCount: number, // Number of hash functions (k)
): Promise<FastBloomFilter> {
	const wasmUrl = new URL("./wasm/bloomfilter.wasm", import.meta.url);
	const wasmPath = fileURLToPath(wasmUrl);

	const encoder = new TextEncoder();
	// Align bitCount to next multiple of 32 bits (round up to word boundary)
	// SUGGESTION: You may want to log a warning if bitCount was not already aligned.
	const m = Math.ceil(bitCount >> 5) << 5;

	// Ensure k is an integer
	const k = hashCount | 0;

	// Load and instantiate the WASM binary
	type WasmExports = {
		memory: WebAssembly.Memory;
		malloc: (size: number) => number;
		free: (ptr: number) => void;
		bloom_add: (
			dataPtr: number,
			len: number,
			k: number,
			bitCount: number,
			bitset32Ptr: number,
		) => void;
		bloom_has: (
			dataPtr: number,
			len: number,
			k: number,
			bitCount: number,
			bitset32Ptr: number,
		) => number;
	};
	const wasmBuffer = fs.readFileSync(wasmPath);
	const { instance } = await WebAssembly.instantiate(wasmBuffer);
	const ex = instance.exports as unknown as WasmExports;

	const _wasm_bloom_add = ex.bloom_add;
	const _wasm_bloom_has = ex.bloom_has;

	// Temporary input buffer (used for adding/checking strings/buffers)
	let bufferPtr = 0;
	let bufferSize = 0;

	// TypedArray view on the temp buffer — will be reassigned as buffer grows
	let u8View = new Uint8Array(ex.memory.buffer, 0, 0);

	// Allocate bitset for the filter itself (persistent for lifetime of filter)
	const bitWords = (m + 31) >>> 5; // How many 32-bit words are needed
	const bitBytes = bitWords << 2; // Convert word count to bytes
	const bitsetPtr = ex.malloc(bitBytes);

	// Ensure the temp input buffer is large enough; if not, free and reallocate
	function ensureCapacity(utf8Len: number) {
		if (utf8Len <= bufferSize) return;
		let newSize = bufferSize ? bufferSize : 256;
		while (newSize < utf8Len) newSize <<= 1;
		if (bufferPtr) ex.free(bufferPtr);
		bufferPtr = ex.malloc(newSize);
		bufferSize = newSize;
		u8View = new Uint8Array(ex.memory.buffer, bufferPtr, bufferSize);
	}

	// ---- String-based API ----

	function addString(text: string) {
		ensureCapacity(text.length << 2); // Overprovision worst-case UTF-8 expansion
		const { written } = encoder.encodeInto(text, u8View);
		_wasm_bloom_add(bufferPtr, written, k, m, bitsetPtr);
	}

	function hasString(text: string): boolean {
		ensureCapacity(text.length << 2);
		const { written } = encoder.encodeInto(text, u8View);
		return _wasm_bloom_has(bufferPtr, written, k, m, bitsetPtr) === 1;
	}

	// ---- Raw buffer API ----

	function add(buffer: Uint8Array) {
		ensureCapacity(buffer.length);
		u8View.set(buffer);
		_wasm_bloom_add(bufferPtr, buffer.length, k, m, bitsetPtr);
	}

	function has(buffer: Uint8Array): boolean {
		ensureCapacity(buffer.length);
		u8View.set(buffer);
		return _wasm_bloom_has(bufferPtr, buffer.length, k, m, bitsetPtr) === 1;
	}

	// ---- Cleanup ----

	function dispose() {
		if (bufferPtr) {
			ex.free(bufferPtr);
			bufferPtr = 0;
			bufferSize = 0;
		}
		if (bitsetPtr) ex.free(bitsetPtr);
	}

	return { addString, hasString, add, has, bitCount: m, hashCount: k, dispose };
}
