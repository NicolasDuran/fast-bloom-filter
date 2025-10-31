# FAST-BLOOM-FILTER
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)



> **The fastest Bloom Filter on npm.**  
> Powered by **WASM**, written in **TypeScript & C**.

---

## 💡 What is a Bloom Filter?
A Bloom filter is a memory-efficient probabilistic set that guarantees no false negatives but tolerates the occasional false positive. It stores everything in an `m`-bit array, so larger `m` directly lowers the error rate. With `n` items and `k` hash functions the false-positive probability is `P_fp ≈ (1 - e^{-kn/m})^k`; using the near-optimal `k ≈ (m/n) ln 2` yields `m ≈ -(n ln p)/(ln 2)^2` bits to hit a target rate `p` (≈9.6 bits per element for `p = 0.01`).



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

const bloomFilter = await FastBloomFilter.create(100, 4);

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
  
### strings N=3e6, M=2^26 (~64MB), K=12
  
  - **N:** 3,000,000  •  **Bits:** 67,108,864  •  **K:** 12  •  **Data:** strings
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate | RSS (MB) |
  |:--|--:|--:|--:|--:|--:|
  | FastFilterBloom | **20.52 Mops** <br><sub>100.0% of best</sub> | **22.03 Mops** <br><sub>100.0% of best</sub> | **20.13 Mops** <br><sub>100.0% of best</sub> | **0.00230%** <br><sub>100.0% of best</sub> | 4328.0 <br><sub>77.5% of best</sub> |
| bloomfilter | 9.224 Mops <br><sub>44.9% of best</sub> | 8.841 Mops <br><sub>40.1% of best</sub> | 9.106 Mops <br><sub>45.2% of best</sub> | 0.00257% <br><sub>89.6% of best</sub> | 4092.2 <br><sub>81.9% of best</sub> |
| @ably/bloomit | 1.083 Mops <br><sub>5.3% of best</sub> | 1.092 Mops <br><sub>5.0% of best</sub> | 1.581 Mops <br><sub>7.9% of best</sub> | 0.00250% <br><sub>92.0% of best</sub> | 4546.4 <br><sub>73.8% of best</sub> |
| blumea | 440.1 Kops <br><sub>2.1% of best</sub> | 387.8 Kops <br><sub>1.8% of best</sub> | 1.307 Mops <br><sub>6.5% of best</sub> | 1.00% <br><sub>0.2% of best</sub> | 6420.2 <br><sub>52.2% of best</sub> |
| bloom-filters | 260.5 Kops <br><sub>1.3% of best</sub> | 293.4 Kops <br><sub>1.3% of best</sub> | 324.1 Kops <br><sub>1.6% of best</sub> | 0.00280% <br><sub>82.1% of best</sub> | **3353.3** <br><sub>100.0% of best</sub> |
