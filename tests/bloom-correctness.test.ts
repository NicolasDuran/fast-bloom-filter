import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import FastBloomFilter from "../src/bloomfilter.js";

let filter: FastBloomFilter;

describe("Correctness", () => {
	// Initialize once before tests in this block
	before(async () => {
		const totalBitCount = 10000;
		const hashCount = 4;
		filter = await FastBloomFilter.create(totalBitCount, hashCount);
	});
	after(async () => {
		filter.dispose();
	});

	test("should add and find an element", () => {
		const element = "test-element-1";
		assert.strictEqual(
			filter.hasString(element),
			false,
			"Element should not exist before being added",
		);
		filter.addString(element);
		assert.strictEqual(
			filter.hasString(element),
			true,
			"Element should exist after being added",
		);
	});

	test("should not find an element that was never added", () => {
		const element = "non-existent-element";
		assert.strictEqual(filter.hasString(element), false);
	});

	test("should preserve membership across separate has/add calls", () => {
		const element = "test-element-2";
		assert.strictEqual(
			filter.hasString(element),
			false,
			"Should return false for a new element",
		);
		filter.addString(element);
		assert.strictEqual(
			filter.hasString(element),
			true,
			"Should return true for an existing element",
		);
	});

	test("should handle different elements independently", () => {
		const elem1 = "independent-a";
		const elem2 = "independent-b";

		filter.addString(elem1);

		assert.strictEqual(filter.hasString(elem1), true, "Should find elem1");
		assert.strictEqual(filter.hasString(elem2), false, "Should not find elem2");
	});

	test("should support raw byte buffers", () => {
		const present = Uint8Array.from([0x00, 0x01, 0xfe, 0xff]);
		const absent = Uint8Array.from([0x00, 0x01, 0xfe, 0x7f]);

		assert.strictEqual(filter.has(present), false);
		filter.add(present);
		assert.strictEqual(filter.has(present), true);
		assert.strictEqual(filter.has(absent), false);
	});

	test("should support UTF-8 and empty-string keys", () => {
		const unicode = "héllø-世界";
		assert.strictEqual(filter.hasString(unicode), false);
		filter.addString(unicode);
		assert.strictEqual(filter.hasString(unicode), true);

		assert.strictEqual(filter.hasString(""), false);
		filter.addString("");
		assert.strictEqual(filter.hasString(""), true);
	});

	test("should reject operations after disposal", async () => {
		const disposed = await FastBloomFilter.create(128, 3);
		disposed.dispose();
		disposed.dispose();
		assert.throws(
			() => disposed.addString("after-dispose"),
			/Bloom filter has been disposed/,
		);
		assert.throws(
			() => disposed.hasString("after-dispose"),
			/Bloom filter has been disposed/,
		);
		assert.throws(() => disposed.export(), /Bloom filter has been disposed/);
	});
});
