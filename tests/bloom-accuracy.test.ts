import assert from "node:assert/strict";
import test, { describe } from "node:test";
import FastBloomFilter from "../src/bloomfilter.js";

/**
 * Estimate cumulative false positives during insertion of `n` elements
 * into a Bloom filter of `m` bits with `k` hash functions.
 * @param {number} elements Number of inserted elements.
 * @param {number} size Number of bits in the Bloom filter.
 * @param {number} hashCount Number of hash functions.
 * @returns {number} Cumulative false positives (rounded).
 */
function cumulativeInsertionFalsePositives(elements, size, hashCount) {
	let totalFP = 0;
	for (let i = 1; i <= elements; i += 1000) {
		const p = (1 - Math.exp((-hashCount * i) / size)) ** hashCount;
		totalFP += p * 1000;
	}
	return Math.round(totalFP);
}

function makeRng(seed = 0xdeadbeef >>> 0) {
	let x = seed >>> 0;
	return () => {
		x ^= x << 13;
		x >>>= 0;
		x ^= x >> 17;
		x >>>= 0;
		x ^= x << 5;
		x >>>= 0;
		return x;
	};
}

function generateDeterministicString(length, rng) {
	const chars =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += chars[rng() % chars.length];
	}
	return result;
}

function generateManyStrings(count, length, seed = 1234) {
	const rng = makeRng(seed);
	const result = new Array(count);
	for (let i = 0; i < count; i++) {
		result[i] = generateDeterministicString(length, rng);
	}
	return result;
}

// Generate once for the whole file
const deterministicStrings = generateManyStrings(1_000_000, 8);
const accuracyBound = 0.05; // ±5%

/** @param {number} actual @param {number} expected @param {number} bound */
function assertWithinRelativeBound(actual, expected, bound, label) {
	const min = expected * (1 - bound);
	const max = expected * (1 + bound);
	assert.ok(
		actual >= min && actual <= max,
		`${label}: got ${actual}, expected in [${Math.round(min)}, ${Math.round(max)}] around ${expected} (±${Math.round(bound * 100)}%)`,
	);
}

describe("Accuracy - 10^6 elements", () => {
	test("12MB, 4 hashes", { timeout: 120_000 }, async () => {
		const totalBitCount = 12 * 8 * 1024 * 1024;
		const hashCount = 4;
		const filter = await FastBloomFilter.create(totalBitCount, hashCount);

		let duplicates = 0;
		for (const element of deterministicStrings) {
			const exist = filter.hasString(element);
			if (exist) duplicates++;
			else filter.addString(element);
		}
		filter.dispose();
		// With a big filter we expect ~0–2 accidental hits here
		assert.ok(
			duplicates >= 0 && duplicates <= 2,
			`duplicates=${duplicates} not in [0,2]`,
		);
	});

	test("1MB, 4 hashes", { timeout: 120_000 }, async () => {
		const totalBitCount = 1 * 8 * 1024 * 1024;
		const hashCount = 4;
		const filter = await FastBloomFilter.create(totalBitCount, hashCount);

		let duplicates = 0;
		for (const element of deterministicStrings) {
			const exist = filter.hasString(element);
			if (exist) duplicates++;
			else filter.addString(element);
		}
		filter.dispose();
		const expectedFalsePositives = cumulativeInsertionFalsePositives(
			deterministicStrings.length,
			totalBitCount,
			hashCount,
		);

		assertWithinRelativeBound(
			duplicates,
			expectedFalsePositives,
			accuracyBound,
			"1MB/4h",
		);
	});

	test("512KB, 4 hashes", { timeout: 120_000 }, async () => {
		const totalBitCount = 512 * 8 * 1024;
		const hashCount = 4;
		const filter = await FastBloomFilter.create(totalBitCount, hashCount);

		let duplicates = 0;
		for (const element of deterministicStrings) {
			const exist = filter.hasString(element);
			if (exist) duplicates++;
			else filter.addString(element);
		}
		filter.dispose();
		const expectedFalsePositives = cumulativeInsertionFalsePositives(
			deterministicStrings.length,
			totalBitCount,
			hashCount,
		);

		assertWithinRelativeBound(
			duplicates,
			expectedFalsePositives,
			accuracyBound,
			"512KB/4h",
		);
	});

	test("256KB, 4 hashes, 10^6 elements", { timeout: 120_000 }, async () => {
		const totalBitCount = 256 * 8 * 1024;
		const hashCount = 4;
		const filter = await FastBloomFilter.create(totalBitCount, hashCount);

		let duplicates = 0;
		for (const element of deterministicStrings) {
			const exist = filter.hasString(element);
			if (exist) duplicates++;
			else filter.addString(element);
		}

		const expectedFalsePositives = cumulativeInsertionFalsePositives(
			deterministicStrings.length,
			totalBitCount,
			hashCount,
		);
		filter.dispose();
		assertWithinRelativeBound(
			duplicates,
			expectedFalsePositives,
			accuracyBound,
			"256KB/4h",
		);
	});
});
