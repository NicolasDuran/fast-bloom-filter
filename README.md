# FAST-BLOOM-FILTER
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)



> **The fastest Bloom Filter on npm.**  
> Powered by **WASM**, written in **TypeScript & C**.

---

## 💡 What is a Bloom Filter?
A Bloom filter is a probabilistic set that guarantees no false negatives but tolerates unlikely false positives. 

With `n` items, `m` bits and `k` hash functions the false-positive probability is `P_fp ≈ (1 - e^{-kn/m})^k`; using the near-optimal `k ≈ (m/n) ln 2` yields `m ≈ -(n ln p)/(ln 2)^2` bits to hit a target rate `p` (≈9.6 bits per element for `p = 0.01`).



## 🚀 Install

```bash
npm install fast-bloom-filter
# or
pnpm add fast-bloom-filter
# or
bun add fast-bloom-filter
```
## 🛠️ Usage

```TypeScript
import FastBloomFilter from "fast-bloom-filter";

// Create a bloom filter for 100 elements with an expected false positive rate of 0.01
const bloomFilter = await FastBloomFilter.createOptimal(100, 0.01);
// Create a bloom filter of 100 bits with 4 hash rounds
//const bloomFilter = await FastBloomFilter.create(100, 4);

bloomFilter.addString("hello");
bloomFilter.add(Buffer.from([0x01, 0x02, 0x03]));

bloomFilter.hasString("hello"); // true
bloomFilter.has(Buffer.from([0x01, 0x02, 0x03])); // true
bloomFilter.hasString("foo"); // likely false
bloomFilter.has(Buffer.from([0x01, 0x02, 0x03, 0x04])); // likely false

const snapshot = bloomFilter.export();
bloomFilter.dispose();

const restored = await FastBloomFilter.import(snapshot);
restored.hasString("hello"); // true
restored.has(Buffer.from([0x01, 0x02, 0x03])); // true
restored.hasString("foo"); // likely false
restored.has(Buffer.from([0x01, 0x02, 0x03, 0x04])); // likely false
restored.dispose();
```

## 📐 Theory

📄 Burton H. Bloom (1970)<br>
[_Space/time trade-offs in hash coding with allowable errors_](https://dl.acm.org/doi/10.1145/362686.362692)

📄 Kirsch and Mitzenmacher (2006)<br>
[_Less Hashing, Same Performance: Building a Better Bloom Filter_](https://www.eecs.harvard.edu/~michaelm/postscripts/rsa2008.pdf)


## 📊 Benchmarks

[Complete benchmark results](benchmark/report.md)

*Timings are medians of 3 runs with GC before/after each run. For adapters without Buffer support, buffer datasets are base64-encoded strings.*
  
### strings N=1e5, M=2^21 (~2MB), K=10
  
  - **N:** 100,000  •  **Bits:** 2,097,152  •  **K:** 10  •  **Data:** strings
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate |
  |:--|--:|--:|--:|--:|
  | FastBloomFilter | **24.28 Mops** <br><sub>100.0% of best</sub> | **24.33 Mops** <br><sub>100.0% of best</sub> | **22.25 Mops** <br><sub>100.0% of best</sub> | 0.00500% <br><sub>80.0% of best</sub> |
| bloomfilter | 11.00 Mops <br><sub>45.3% of best</sub> | 10.25 Mops <br><sub>42.1% of best</sub> | 10.88 Mops <br><sub>48.9% of best</sub> | 0.00600% <br><sub>66.7% of best</sub> |
| @ably/bloomit | 1.348 Mops <br><sub>5.6% of best</sub> | 1.399 Mops <br><sub>5.7% of best</sub> | 1.834 Mops <br><sub>8.2% of best</sub> | 0.00700% <br><sub>57.1% of best</sub> |
| blumea | 567.1 Kops <br><sub>2.3% of best</sub> | 492.8 Kops <br><sub>2.0% of best</sub> | 1.444 Mops <br><sub>6.5% of best</sub> | 0.964% <br><sub>0.4% of best</sub> |
| bloom-filters | 339.4 Kops <br><sub>1.4% of best</sub> | 345.4 Kops <br><sub>1.4% of best</sub> | 360.1 Kops <br><sub>1.6% of best</sub> | **0.00400%** <br><sub>100.0% of best</sub> |
| bloom-filter | 215.5 Kops <br><sub>0.9% of best</sub> | 219.2 Kops <br><sub>0.9% of best</sub> | 1.272 Mops <br><sub>5.7% of best</sub> | 0.00600% <br><sub>66.7% of best</sub> |

## 🧪 Development

The checked-in WASM artifact lets a fresh clone run the TypeScript tests and build the distributable package without requiring Emscripten locally.

```bash
pnpm install
pnpm test
pnpm build
```

If you change the C sources under `src/wasm/`, rebuild the artifact with Emscripten before publishing:

```bash
pnpm build:wasm
pnpm build:full
```
