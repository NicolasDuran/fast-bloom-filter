import assert from "node:assert/strict";
import { describe, test } from "node:test";
import FastBloomFilter from "../src/bloomfilter.js";

describe("Bloom Filter create", () => {
	test("should create a bloom filter with the specified parameters, rounded", async () => {
		const filter = await FastBloomFilter.create(100, 4);
		assert.equal(filter.bitCount, 128);
		assert.equal(filter.hashCount, 4);
	});

	test("should throw an error if the bit count is less than 0", async () => {
		await assert.rejects(
			() => FastBloomFilter.create(0, 4),
			/bitCount must be > 0/,
		);
	});

	test("should throw an error if the hash count is less than 0", async () => {
		await assert.rejects(
			() => FastBloomFilter.create(100, 0),
			/hashCount must be > 0/,
		);
	});

	test("should reject non-integer or overflowing parameters", async () => {
		await assert.rejects(
			() => FastBloomFilter.create(Number.NaN, 4),
			/bitCount must be a positive safe integer/,
		);
		await assert.rejects(
			() => FastBloomFilter.create(100.5, 4),
			/bitCount must be a positive safe integer/,
		);
		await assert.rejects(
			() => FastBloomFilter.create(2 ** 32, 4),
			/bitCount must be <=/,
		);
		await assert.rejects(
			() => FastBloomFilter.create(100, Number.NaN),
			/hashCount must be a positive safe integer/,
		);
	});
});

describe("Bloom Filter createOptimal", () => {
	test("should create a bloom filter with the optimal parameters", async () => {
		const filter = await FastBloomFilter.createOptimal(100, 0.01);
		assert.equal(filter.bitCount, 960);
		assert.equal(filter.hashCount, 7);
	});

	test("should create a bloom filter with the optimal parameters 2", async () => {
		const filter = await FastBloomFilter.createOptimal(25000, 0.0001);
		assert.equal(filter.bitCount, 479264);
		assert.equal(filter.hashCount, 13);
	});

	test("should throw an error if the expected items is less than 0", async () => {
		await assert.rejects(
			() => FastBloomFilter.createOptimal(0, 0.01),
			/expectedItems must be > 0/,
		);
	});

	test("should throw an error if the false positive rate is less than 0 or greater than 1", async () => {
		await assert.rejects(
			() => FastBloomFilter.createOptimal(100, 0),
			/falsePositiveRate must be between 0 and 1/,
		);
		await assert.rejects(
			() => FastBloomFilter.createOptimal(100, 1),
			/falsePositiveRate must be between 0 and 1/,
		);
	});

	test("should reject invalid optimal-filter inputs", async () => {
		await assert.rejects(
			() => FastBloomFilter.createOptimal(Number.NaN, 0.01),
			/expectedItems must be a positive safe integer/,
		);
		await assert.rejects(
			() => FastBloomFilter.createOptimal(100, Number.NaN),
			/falsePositiveRate must be between 0 and 1/,
		);
	});
});
