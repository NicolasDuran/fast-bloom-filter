#define XXH_INLINE_ALL
#include "./xxhash.h"
#include <emscripten.h>

/*
 * Bloom filter core functions for WebAssembly.
 *
 * This implementation:
 *  - Uses XXH3_64bits as the base hash (with a fixed seed).
 *  - Derives k bit positions using "double hashing" (h1 + i*h2).
 *  - Maps each hash to [0, bitSetSize) using a mul+shift fastrange method.
 *  - Stores bits inside a uint32_t array (bitset32), acting as the bit array.
 *
 * IMPORTANT:
 *  - The bit array (bitset32) must be preallocated on the JS side.
 *  - bitSetSize = total number of addressable bits (NOT number of uint32 words).
 *  - k defines how many bit positions are set / checked per element.
 *
 * Bloom filter properties:
 *  - No false negatives: if bloom_has(...) returns 0, the key was never added.
 *  - Possible false positives: if returns 1, the key *may* be present.
 */

/* ============================================================================
 * Fast modulo / range mapping helpers
 * ==========================================================================*/

static inline uint32_t fastrange_u32(uint32_t x, uint32_t m) {
  return (uint32_t)(((uint64_t)x * (uint64_t)m) >> 32);
}

static inline uint32_t idx_from_h(uint32_t h, uint32_t bitCount) {
  return fastrange_u32(h, bitCount);
}

/* ============================================================================
 * Bit manipulation in uint32-based bit array
 * ==========================================================================*/

static inline void set_bit32(uint32_t *bitset32, uint32_t idx) {
  const uint32_t wi = idx >> 5;
  const uint32_t m  = 1u << (idx & 31);
  bitset32[wi] |= m;
}

static inline int test_bit32(const uint32_t *bitset32, uint32_t idx) {
  const uint32_t wi = idx >> 5;
  const uint32_t m  = 1u << (idx & 31);
  return (bitset32[wi] & m) != 0;
}

/* ============================================================================
 * Public API (exported to WebAssembly)
 * ==========================================================================*/

/**
 * @brief Insert a key into the Bloom filter.
 *
 * @param data_ptr    Pointer to the key bytes (must point to WASM linear memory).
 * @param len         Number of bytes in the key.
 * @param k           Number of hash rounds; defines how many bit positions are set.
 * @param bitSetSize  Total number of bits in the bit array
 * @param bitset32    Pointer to the uint32_t bit array (preallocated in WASM memory).
 */
EMSCRIPTEN_KEEPALIVE
void bloom_add(const uint8_t * __restrict data_ptr, uint32_t len,
               uint32_t k, uint32_t bitSetSize,
               uint32_t * __restrict bitset32) {

  // Compute base 64-bit hash and derive two 32-bit seeds
  const uint64_t h64 = XXH3_64bits_withSeed(data_ptr, (size_t)len, 0x1234567890ABCDEF);
  uint32_t h1 = (uint32_t)(h64 >> 32);
  uint32_t h2 = ((uint32_t)h64) | 1u;  // ensure odd stride

  const uint32_t idx = idx_from_h(h1, bitSetSize);
  set_bit32(bitset32, idx);

  for (uint32_t i = 1; i < k; ++i) {
    h1 += h2;
    const uint32_t idx = idx_from_h(h1, bitSetSize);
    set_bit32(bitset32, idx);
  }
}

/**
 * @brief Query membership for a key in the Bloom filter.
 *
 * @param data_ptr    Pointer to the key bytes (must point to WASM linear memory).
 * @param len         Number of bytes in the key.
 * @param k           Number of hash rounds originally used when inserting.
 * @param bitSetSize  Total number of bits in the bit array.
 * @param bitset32    Pointer to the uint32_t bit array containing the set bits.
 *
 * @return 1 => possibly present (all bits set), 0 => definitely not present.
 */
EMSCRIPTEN_KEEPALIVE
uint32_t bloom_has(const uint8_t * __restrict data_ptr, uint32_t len,
                   uint32_t k, uint32_t bitSetSize,
                   const uint32_t * __restrict bitset32) {

  const uint64_t h64 = XXH3_64bits_withSeed(data_ptr, (size_t)len, 0x1234567890ABCDEF);
  uint32_t h1 = (uint32_t)(h64 >> 32);
  uint32_t h2 = ((uint32_t)h64) | 1u;

  const uint32_t idx = idx_from_h(h1, bitSetSize);
  if (!test_bit32(bitset32, idx)) return 0;

  for (uint32_t i = 1; i < k; ++i) {
    h1 += h2;
    const uint32_t idx = idx_from_h(h1, bitSetSize);
    if (!test_bit32(bitset32, idx)) return 0;
  }
  return 1;
}