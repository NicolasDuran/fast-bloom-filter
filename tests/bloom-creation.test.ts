import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import FastBloomFilter from '../src/bloomfilter.js'

describe('Bloom Filter create', () => {
  test('should create a bloom filter with the specified parameters, rounded', async (t) => {
    const filter = await FastBloomFilter.create(100, 4)
    assert.equal(filter.bitCount, 128);
    assert.equal(filter.hashCount, 4);
  })

  test('should throw an error if the bit count is less than 0', () => {
    assert.rejects(() => FastBloomFilter.create(0, 4), /bitCount must be > 0/)
  })

  test('should throw an error if the hash count is less than 0', () => {
    assert.rejects(() => FastBloomFilter.create(100, 0), /hashCount must be > 0/)
  })
})

describe('Bloom Filter createOptimal', () => {
  test('should create a bloom filter with the optimal parameters', async (t) => {
    const filter = await FastBloomFilter.createOptimal(100, 0.01)
    assert.equal(filter.bitCount, 960)
    assert.equal(filter.hashCount, 7)
  })

  test('should create a bloom filter with the optimal parameters 2', async (t) => {
    const filter = await FastBloomFilter.createOptimal(25000, 0.0001)
    assert.equal(filter.bitCount, 479264)
    assert.equal(filter.hashCount, 13)
  })

  test('should throw an error if the expected items is less than 0', () => {
    assert.rejects(() => FastBloomFilter.createOptimal(0, 0.01), /expectedItems must be > 0/)
  })

  test('should throw an error if the false positive rate is less than 0 or greater than 1', () => {
    assert.rejects(() => FastBloomFilter.createOptimal(100, 0), /falsePositiveRate must be between 0 and 1/)
    assert.rejects(() => FastBloomFilter.createOptimal(100, 1), /falsePositiveRate must be between 0 and 1/)
  })

})