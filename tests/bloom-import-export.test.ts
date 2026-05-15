import assert from "node:assert/strict";
import { describe, test } from "node:test";
import FastBloomFilter from "../src/bloomfilter.js";

describe("Import/export", () => {
	test("round-trips filter state", async () => {
		const original = await FastBloomFilter.create(4096, 5);
		const members = ["alpha", "beta", "gamma"];
		for (const value of members) {
			original.addString(value);
		}
		const snapshot = original.export();
		original.dispose();

		const restored = await FastBloomFilter.import(snapshot);
		for (const value of members) {
			assert.strictEqual(
				restored.hasString(value),
				true,
				`Missing ${value} after import`,
			);
		}
		assert.strictEqual(
			restored.hasString("delta"),
			false,
			"Unexpected element detected after import",
		);
		restored.dispose();
	});

	test("import fails on invalid magic number", async () => {
		const invalidMagic = new Uint8Array(12);
		invalidMagic.set([0x46, 0x42, 0x46, 0x31]); // "FBF1" instead of "FBF2"
		await assert.rejects(
			() => FastBloomFilter.import(invalidMagic),
			/Invalid magic number/,
			"Import should fail when magic number is invalid",
		);
	});

	test("accepts snapshot views with offsets", async () => {
		const source = await FastBloomFilter.create(2048, 4);
		source.addString("offset-case");
		const snapshot = source.export();
		source.dispose();

		const padded = new Uint8Array(snapshot.length + 8);
		padded.set(snapshot, 3);
		const slice = padded.subarray(3, 3 + snapshot.length);

		const restored = await FastBloomFilter.import(slice);
		assert.strictEqual(
			restored.hasString("offset-case"),
			true,
			"Import should work with Uint8Array views that start at a non-zero offset",
		);
		restored.dispose();
	});

	test("rejects truncated exports", async () => {
		const filter = await FastBloomFilter.create(1024, 3);
		filter.addString("truncate-me");
		const snapshot = filter.export();
		filter.dispose();

		const truncated = snapshot.subarray(0, snapshot.length - 1);
		await assert.rejects(
			() => FastBloomFilter.import(truncated),
			/unexpected length/,
			"Import should fail when payload length does not match bitset size",
		);
	});

	test("rejects headers shorter than the serialized format", async () => {
		await assert.rejects(
			() => FastBloomFilter.import(new Uint8Array([0x46, 0x42, 0x46, 0x32])),
			/Bloom filter export is truncated/,
		);
	});

	test("rejects zero-valued serialized parameters", async () => {
		const invalid = new Uint8Array(12);
		invalid.set([0x46, 0x42, 0x46, 0x32]);
		await assert.rejects(
			() => FastBloomFilter.import(invalid),
			/bitCount must be > 0/,
		);
	});
});
