import * as fs from "node:fs";
import { fileURLToPath } from "node:url";

// type FastBloomFilter = {
// 	addString(text: string): void; // Insert a UTF-8 string into the filter
// 	hasString(text: string): boolean; // Check a UTF-8 string
// 	add(buffer: Uint8Array): void; // Insert a raw byte buffer
// 	has(buffer: Uint8Array): boolean; // Check a raw byte buffer
// 	bitCount: number; // Total number of bits in the bit array
// 	hashCount: number; // Number of hash functions (k)
// 	dispose(): void; // Free all WASM-allocated memory
// };

/**
 * WebAssembly-backed Bloom filter.
 *
 * Use `FastBloomFilter.create(bitCount, hashCount)` to asynchronously load the
 * WASM module, allocate the underlying bitset, and receive a runtime wrapper
 * with convenience methods (`addString`, `has`, etc.).
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
 * Example usage:
 * ```ts
 * const filter = await FastBloomFilter.create(1_000_000, 7);
 * filter.addString("hello");
 * console.log(filter.hasString("hello")); // true
 * console.log(filter.hasString("world")); // maybe false
 * filter.dispose();
 * ```
 */
export type BloomFilterExport = Uint8Array;

export default class FastBloomFilter {
  private static readonly MAGIC :Uint8Array = new Uint8Array([0x46, 0x42, 0x46, 0x32]); // "FBF2"

  private readonly bitCount: number;
  private readonly byteCount: number;

  private readonly hashCount: number;

  private readonly bitsetPtr: number;
  
  private readonly ex: WasmExports;

  private readonly encoder: TextEncoder;

  private bufferPtr: number;
  private bufferSize: number;
  private bufferU8View: Uint8Array;

  private constructor(bitCount: number, hashCount: number, ex: WasmExports, data?: Uint8Array) {
    // round up to the next multiple of 32
    this.bitCount = (bitCount + 31) & ~31;
    this.byteCount = this.bitCount >>> 3;
    this.bitsetPtr = ex.malloc(this.byteCount);
    if (data) {
      const bitsetU8View = new Uint8Array(ex.memory.buffer, this.bitsetPtr, this.byteCount);
      bitsetU8View.set(data);
    }

    this.hashCount = hashCount | 0;
    this.encoder = new TextEncoder();
    this.bufferPtr = 0;
    this.bufferSize = 0;
    this.bufferU8View = new Uint8Array(ex.memory.buffer, 0, 0);

    this.ex = ex;
  }

  /**
   * Load the WASM module and return a ready-to-use Bloom filter.
   *
   * @param bitCount Desired number of bits. Rounded up to the nearest multiple of 32.
   * @param hashCount Number of hash rounds (k). More rounds reduce false positives.
   */
  static async create(bitCount: number, hashCount: number): Promise<FastBloomFilter> {
    const ex = await this.instantiateWasm();
    return new FastBloomFilter(bitCount, hashCount, ex);
  }

  private static async instantiateWasm(): Promise<WasmExports> {
    const wasmUrl = new URL("./wasm/bloomfilter.wasm", import.meta.url);
    const wasmPath = fileURLToPath(wasmUrl);
    const wasmBuffer = fs.readFileSync(wasmPath);
    const { instance } = await WebAssembly.instantiate(wasmBuffer);
    return instance.exports as unknown as WasmExports;
  }

  // Ensure the temp input buffer is large enough; if not, free and reallocate
  ensureCapacity(utf8Len: number) {
    if (utf8Len <= this.bufferSize) return;
    let newSize = this.bufferSize ? this.bufferSize : 256;
    while (newSize < utf8Len) newSize <<= 1;
    if (this.bufferPtr) this.ex.free(this.bufferPtr);
    this.bufferPtr = this.ex.malloc(newSize);
    this.bufferSize = newSize;
    this.bufferU8View = new Uint8Array(
      this.ex.memory.buffer,
      this.bufferPtr,
      this.bufferSize
    );
  }

  // ---- String-based API ----

  addString(text: string) {
    this.ensureCapacity(text.length << 2); // Overprovision worst-case UTF-8 expansion
    const { written } = this.encoder.encodeInto(text, this.bufferU8View);
    this.ex.bloom_add(
      this.bufferPtr,
      written,
      this.hashCount,
      this.bitCount,
      this.bitsetPtr
    );
  }

  hasString(text: string): boolean {
    this.ensureCapacity(text.length << 2);
    const { written } = this.encoder.encodeInto(text, this.bufferU8View);
    return (
      this.ex.bloom_has(
        this.bufferPtr,
        written,
        this.hashCount,
        this.bitCount,
        this.bitsetPtr
      ) === 1
    );
  }

  // ---- Raw buffer API ----

  add(buffer: Uint8Array) {
    this.ensureCapacity(buffer.length);
    this.bufferU8View.set(buffer);
    this.ex.bloom_add(
      this.bufferPtr,
      buffer.length,
      this.hashCount,
      this.bitCount,
      this.bitsetPtr
    );
  }

  has(buffer: Uint8Array): boolean {
    this.ensureCapacity(buffer.length);
    this.bufferU8View.set(buffer);
    return (
      this.ex.bloom_has(
        this.bufferPtr,
        buffer.length,
        this.hashCount,
        this.bitCount,
        this.bitsetPtr
      ) === 1
    );
  }

  export(): Uint8Array {
    const bitsetU8View = new Uint8Array(this.ex.memory.buffer, this.bitsetPtr, this.byteCount);
    const headerLength = FastBloomFilter.MAGIC.length + 8;
    const exportBuffer = new ArrayBuffer(headerLength + bitsetU8View.length);
    const exportView8 = new Uint8Array(exportBuffer);
    exportView8.set(FastBloomFilter.MAGIC, 0);
    const headerView = new DataView(exportBuffer, FastBloomFilter.MAGIC.length, 8);
    headerView.setUint32(0, this.bitCount, true);
    headerView.setUint32(4, this.hashCount, true);
    exportView8.set(bitsetU8View, headerLength);
    return exportView8;
  }

  static async import(exportedBloomFilter: Uint8Array): Promise<FastBloomFilter> {
    const headerLength = FastBloomFilter.MAGIC.length + 8;

    const { buffer, byteOffset, byteLength } = exportedBloomFilter;
    const magicView = new Uint8Array(buffer, byteOffset, FastBloomFilter.MAGIC.length);
    for (let i = 0; i < FastBloomFilter.MAGIC.length; i += 1) {
      if (magicView[i] !== FastBloomFilter.MAGIC[i]) {
        throw new Error("Invalid magic number");
      }
    }

    const headerView = new DataView(buffer, byteOffset + FastBloomFilter.MAGIC.length, 8);
    const bitCount = headerView.getUint32(0, true);
    const hashCount = headerView.getUint32(4, true);

    const expectedByteCount = ((bitCount + 31) & ~31) >>> 3;
    const payloadLength = byteLength - headerLength;
    if (payloadLength !== expectedByteCount) {
      throw new Error("Bloom filter payload has unexpected length");
    }

    const data = new Uint8Array(buffer, byteOffset + headerLength, payloadLength);
    const ex = await FastBloomFilter.instantiateWasm();

    return new FastBloomFilter(bitCount, hashCount, ex, data);
  }

  // ---- Cleanup ----

  dispose() {
    if (this.bufferPtr) {
      this.ex.free(this.bufferPtr);
      this.bufferPtr = 0;
      this.bufferSize = 0;
    }
    if (this.bitsetPtr) this.ex.free(this.bitsetPtr);
  }
}

type WasmExports = {
  memory: WebAssembly.Memory;
  malloc: (size: number) => number;
  free: (ptr: number) => void;
  bloom_add: (
    dataPtr: number,
    len: number,
    k: number,
    bitCount: number,
    bitset32Ptr: number
  ) => void;
  bloom_has: (
    dataPtr: number,
    len: number,
    k: number,
    bitCount: number,
    bitset32Ptr: number
  ) => number;
};
