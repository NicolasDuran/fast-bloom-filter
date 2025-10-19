# FAST-BLOOM-FILTER
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)



> **The fastest Bloom Filter on npm.**  
> Powered by **WASM**, written in **TypeScript & C**.

---


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

const bloomFilter = await FastBloomFilter(100, 4);

bloomFilter.addString("hello");
bloomFilter.add(Buffer.from([0x01, 0x02, 0x03]));

bloomFilter.hasString("hello"); // true
bloomFilter.has(Buffer.from([0x01, 0x02, 0x03])); // true
bloomFilter.hasString("foo"); // likely false
bloomFilter.has(Buffer.from([0x01, 0x02, 0x03, 0x04])); // likely false
bloomFilter.dispose();
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
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate | RSS (MB) |
  |:--|--:|--:|--:|--:|--:|
  | FastFilterBloom | **21.19 Mops** <br><sub>100.0% of best</sub> | **23.28 Mops** <br><sub>100.0% of best</sub> | **20.18 Mops** <br><sub>100.0% of best</sub> | 0.00500% <br><sub>80.0% of best</sub> | **163.9** <br><sub>100.0% of best</sub> |
| bloomfilter | 10.54 Mops <br><sub>49.7% of best</sub> | 10.25 Mops <br><sub>44.0% of best</sub> | 10.17 Mops <br><sub>50.4% of best</sub> | 0.00600% <br><sub>66.7% of best</sub> | 171.7 <br><sub>95.4% of best</sub> |
| @ably/bloomit | 1.329 Mops <br><sub>6.3% of best</sub> | 1.347 Mops <br><sub>5.8% of best</sub> | 1.866 Mops <br><sub>9.2% of best</sub> | 0.00700% <br><sub>57.1% of best</sub> | 383.7 <br><sub>42.7% of best</sub> |
| blumea | 550.0 Kops <br><sub>2.6% of best</sub> | 491.1 Kops <br><sub>2.1% of best</sub> | 1.608 Mops <br><sub>8.0% of best</sub> | 0.964% <br><sub>0.4% of best</sub> | 515.8 <br><sub>31.8% of best</sub> |
| bloom-filters | 323.8 Kops <br><sub>1.5% of best</sub> | 322.3 Kops <br><sub>1.4% of best</sub> | 340.7 Kops <br><sub>1.7% of best</sub> | **0.00400%** <br><sub>100.0% of best</sub> | 372.4 <br><sub>44.0% of best</sub> |
| bloom-filter | 218.6 Kops <br><sub>1.0% of best</sub> | 217.1 Kops <br><sub>0.9% of best</sub> | 1.285 Mops <br><sub>6.4% of best</sub> | 0.00600% <br><sub>66.7% of best</sub> | 375.0 <br><sub>43.7% of best</sub> |