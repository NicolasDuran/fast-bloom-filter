# Bloom Filter Bench — Comparative Report
  
  **Date:** 2025-11-01T09:26:00.681Z
  
  **Adapters:** FastBloomFilter, bloomfilter, bloom-filters, bloom-filter, @ably/bloomit, blumea  
  **Scenarios:** 5
  
  *Tables rank adapters within the same scenario. Primary values use **adaptive throughput units** (Ops/Kops/Mops/Gops). Sub-labels show percentage relative to the best in that metric (higher is better for throughput; lower is better for FP rate and RSS). Timings are medians of 3 runs with GC before/after each run. For adapters without Buffer support, buffer datasets are base64-encoded strings.*
  
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
  

  ### strings N=1e6, M=2^24 (~16MB), K=10
  
  - **N:** 1,000,000  •  **Bits:** 16,777,216  •  **K:** 10  •  **Data:** strings
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate |
  |:--|--:|--:|--:|--:|
  | FastBloomFilter | **21.27 Mops** <br><sub>100.0% of best</sub> | **23.98 Mops** <br><sub>100.0% of best</sub> | **17.66 Mops** <br><sub>100.0% of best</sub> | **0.0318%** <br><sub>100.0% of best</sub> |
| bloomfilter | 10.31 Mops <br><sub>48.5% of best</sub> | 10.13 Mops <br><sub>42.3% of best</sub> | 9.927 Mops <br><sub>56.2% of best</sub> | 0.0352% <br><sub>90.3% of best</sub> |
| @ably/bloomit | 1.267 Mops <br><sub>6.0% of best</sub> | 1.268 Mops <br><sub>5.3% of best</sub> | 1.804 Mops <br><sub>10.2% of best</sub> | 0.0350% <br><sub>90.9% of best</sub> |
| blumea | 467.1 Kops <br><sub>2.2% of best</sub> | 420.7 Kops <br><sub>1.8% of best</sub> | 1.379 Mops <br><sub>7.8% of best</sub> | 1.02% <br><sub>3.1% of best</sub> |
| bloom-filters | 330.8 Kops <br><sub>1.6% of best</sub> | 331.1 Kops <br><sub>1.4% of best</sub> | 353.2 Kops <br><sub>2.0% of best</sub> | 0.0319% <br><sub>99.7% of best</sub> |
  

  ### strings N=3e6, M=2^26 (~64MB), K=12
  
  - **N:** 3,000,000  •  **Bits:** 67,108,864  •  **K:** 12  •  **Data:** strings
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate |
  |:--|--:|--:|--:|--:|
  | FastBloomFilter | **23.20 Mops** <br><sub>100.0% of best</sub> | **22.51 Mops** <br><sub>100.0% of best</sub> | **18.12 Mops** <br><sub>100.0% of best</sub> | **0.00230%** <br><sub>100.0% of best</sub> |
| bloomfilter | 9.235 Mops <br><sub>39.8% of best</sub> | 8.962 Mops <br><sub>39.8% of best</sub> | 6.954 Mops <br><sub>38.4% of best</sub> | 0.00257% <br><sub>89.6% of best</sub> |
| @ably/bloomit | 1.079 Mops <br><sub>4.7% of best</sub> | 998.8 Kops <br><sub>4.4% of best</sub> | 1.468 Mops <br><sub>8.1% of best</sub> | 0.00250% <br><sub>92.0% of best</sub> |
| blumea | 434.6 Kops <br><sub>1.9% of best</sub> | 392.3 Kops <br><sub>1.7% of best</sub> | 1.303 Mops <br><sub>7.2% of best</sub> | 1.00% <br><sub>0.2% of best</sub> |
| bloom-filters | 286.7 Kops <br><sub>1.2% of best</sub> | 298.2 Kops <br><sub>1.3% of best</sub> | 323.4 Kops <br><sub>1.8% of best</sub> | 0.00280% <br><sub>82.1% of best</sub> |
  

  ### buf128k N=5k, M=2^20 (~64MB), K=12
  
  - **N:** 500  •  **Bits:** 8,192  •  **K:** 12  •  **Data:** buffer128k
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate |
  |:--|--:|--:|--:|--:|
  | FastBloomFilter | **100.6 Kops** <br><sub>100.0% of best</sub> | **100.1 Kops** <br><sub>100.0% of best</sub> | **100.6 Kops** <br><sub>100.0% of best</sub> | **0.00%** <br><sub>–</sub> |
| @ably/bloomit | 62.84 Kops <br><sub>62.5% of best</sub> | 63.46 Kops <br><sub>63.4% of best</sub> | 63.25 Kops <br><sub>62.9% of best</sub> | **0.00%** <br><sub>–</sub> |
| bloomfilter | 2.887 Kops <br><sub>2.9% of best</sub> | 2.909 Kops <br><sub>2.9% of best</sub> | 2.921 Kops <br><sub>2.9% of best</sub> | **0.00%** <br><sub>–</sub> |
| blumea | 761.5 ops <br><sub>0.8% of best</sub> | 767.8 ops <br><sub>0.8% of best</sub> | 2.638 Kops <br><sub>2.6% of best</sub> | 1.60% <br><sub>0.0% of best</sub> |
| bloom-filter | 309.5 ops <br><sub>0.3% of best</sub> | 310.8 ops <br><sub>0.3% of best</sub> | 1.763 Kops <br><sub>1.8% of best</sub> | **0.00%** <br><sub>–</sub> |
| bloom-filters | 297.7 ops <br><sub>0.3% of best</sub> | 296.6 ops <br><sub>0.3% of best</sub> | 296.1 ops <br><sub>0.3% of best</sub> | **0.00%** <br><sub>–</sub> |
  

  ### buf2m   N=500, M=2^27 (~128MB), K=12
  
  - **N:** 500  •  **Bits:** 134,217,728  •  **K:** 12  •  **Data:** buffer2m
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate |
  |:--|--:|--:|--:|--:|
  | FastBloomFilter | **11.73 Kops** <br><sub>100.0% of best</sub> | **11.83 Kops** <br><sub>100.0% of best</sub> | **11.87 Kops** <br><sub>100.0% of best</sub> | **0.00%** <br><sub>–</sub> |
| @ably/bloomit | 2.717 Kops <br><sub>23.2% of best</sub> | 2.822 Kops <br><sub>23.9% of best</sub> | 2.779 Kops <br><sub>23.4% of best</sub> | **0.00%** <br><sub>–</sub> |
| bloomfilter | 180.7 ops <br><sub>1.5% of best</sub> | 180.4 ops <br><sub>1.5% of best</sub> | 178.1 ops <br><sub>1.5% of best</sub> | **0.00%** <br><sub>–</sub> |
| blumea | 43.84 ops <br><sub>0.4% of best</sub> | 43.19 ops <br><sub>0.4% of best</sub> | 157.7 ops <br><sub>1.3% of best</sub> | 1.00% <br><sub>0.0% of best</sub> |
| bloom-filters | 14.82 ops <br><sub>0.1% of best</sub> | 14.24 ops <br><sub>0.1% of best</sub> | 13.90 ops <br><sub>0.1% of best</sub> | **0.00%** <br><sub>–</sub> |
  