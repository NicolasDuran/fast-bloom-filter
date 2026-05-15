# Bloom Filter Bench — Comparative Report
  
  **Date:** 2026-05-15T23:37:36.420Z
  **Runtime:** Node v25.2.1 (darwin/arm64)
  
  **Adapters:** FastBloomFilter, bloomfilter, bloom-filters, bloom-filter, @ably/bloomit  
  **Scenarios:** 4
  
  *Tables rank adapters within the same fixed bit-count/hash-count scenario. Primary values use **adaptive throughput units** (Ops/Kops/Mops/Gops). Sub-labels show percentage relative to the best in that metric (higher is better for throughput; lower is better for FP rate). Timings are medians of 3 runs with GC before/after each run. Buffer scenarios include only adapters with native Buffer support.*
  
  ### strings N=1e5, M=2^21 (~256KiB), K=10
  
  - **N:** 100,000  •  **Bits:** 2,097,152  •  **K:** 10  •  **Data:** strings
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate |
  |:--|--:|--:|--:|--:|
  | FastBloomFilter | **15.04 Mops** <br><sub>100.0% of best</sub> | **14.91 Mops** <br><sub>100.0% of best</sub> | **14.32 Mops** <br><sub>100.0% of best</sub> | 0.00500% <br><sub>80.0% of best</sub> |
| bloomfilter | 8.410 Mops <br><sub>55.9% of best</sub> | 11.15 Mops <br><sub>74.8% of best</sub> | 6.935 Mops <br><sub>48.4% of best</sub> | 0.00600% <br><sub>66.7% of best</sub> |
| @ably/bloomit | 1.459 Mops <br><sub>9.7% of best</sub> | 1.453 Mops <br><sub>9.7% of best</sub> | 2.157 Mops <br><sub>15.1% of best</sub> | 0.00700% <br><sub>57.1% of best</sub> |
| bloom-filter | 220.0 Kops <br><sub>1.5% of best</sub> | 216.3 Kops <br><sub>1.5% of best</sub> | 1.220 Mops <br><sub>8.5% of best</sub> | 0.00600% <br><sub>66.7% of best</sub> |
| bloom-filters | 171.1 Kops <br><sub>1.1% of best</sub> | 174.4 Kops <br><sub>1.2% of best</sub> | 167.3 Kops <br><sub>1.2% of best</sub> | **0.00400%** <br><sub>100.0% of best</sub> |
  

  ### strings N=1e6, M=2^24 (~2MiB), K=10
  
  - **N:** 1,000,000  •  **Bits:** 16,777,216  •  **K:** 10  •  **Data:** strings
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate |
  |:--|--:|--:|--:|--:|
  | FastBloomFilter | **14.49 Mops** <br><sub>100.0% of best</sub> | **14.09 Mops** <br><sub>100.0% of best</sub> | **13.42 Mops** <br><sub>100.0% of best</sub> | **0.0318%** <br><sub>100.0% of best</sub> |
| bloomfilter | 11.46 Mops <br><sub>79.1% of best</sub> | 11.72 Mops <br><sub>83.2% of best</sub> | 11.01 Mops <br><sub>82.1% of best</sub> | 0.0352% <br><sub>90.3% of best</sub> |
| @ably/bloomit | 1.451 Mops <br><sub>10.0% of best</sub> | 1.452 Mops <br><sub>10.3% of best</sub> | 2.174 Mops <br><sub>16.2% of best</sub> | 0.0350% <br><sub>90.9% of best</sub> |
| bloom-filters | 173.0 Kops <br><sub>1.2% of best</sub> | 176.7 Kops <br><sub>1.3% of best</sub> | 172.3 Kops <br><sub>1.3% of best</sub> | 0.0319% <br><sub>99.7% of best</sub> |
  

  ### buf128k N=500, M=2^13 (~1KiB), K=12
  
  - **N:** 500  •  **Bits:** 8,192  •  **K:** 12  •  **Data:** buffer128k
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate |
  |:--|--:|--:|--:|--:|
  | FastBloomFilter | **113.0 Kops** <br><sub>100.0% of best</sub> | **117.8 Kops** <br><sub>100.0% of best</sub> | **111.1 Kops** <br><sub>100.0% of best</sub> | **0.00%** <br><sub>–</sub> |
| bloom-filter | 105.1 ops <br><sub>0.1% of best</sub> | 105.3 ops <br><sub>0.1% of best</sub> | 602.4 ops <br><sub>0.5% of best</sub> | **0.00%** <br><sub>–</sub> |
  

  ### buf2m   N=20, M=2^18 (~32KiB), K=12
  
  - **N:** 20  •  **Bits:** 262,144  •  **K:** 12  •  **Data:** buffer2m
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate |
  |:--|--:|--:|--:|--:|
  | FastBloomFilter | **11.80 Kops** <br><sub>100.0% of best</sub> | **12.04 Kops** <br><sub>100.0% of best</sub> | **12.05 Kops** <br><sub>100.0% of best</sub> | **0.00%** <br><sub>–</sub> |
| bloom-filter | 6.643 ops <br><sub>0.1% of best</sub> | 6.702 ops <br><sub>0.1% of best</sub> | 79.26 ops <br><sub>0.7% of best</sub> | **0.00%** <br><sub>–</sub> |
  