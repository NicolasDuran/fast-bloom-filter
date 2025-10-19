# Bloom Filter Bench — Comparative Report
  
  **Date:** 2025-10-19T22:26:18.509Z
  
  **Adapters:** FastFilterBloom, bloomfilter, bloom-filters, bloom-filter, @ably/bloomit, blumea  
  **Scenarios:** 5
  
  *Tables rank adapters within the same scenario. Primary values use **adaptive throughput units** (Ops/Kops/Mops/Gops). Sub-labels show percentage relative to the best in that metric (higher is better for throughput; lower is better for FP rate and RSS). Timings are medians of 3 runs with GC before/after each run. For adapters without Buffer support, buffer datasets are base64-encoded strings.*
  
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
  

  ### strings N=1e6, M=2^24 (~16MB), K=10
  
  - **N:** 1,000,000  •  **Bits:** 16,777,216  •  **K:** 10  •  **Data:** strings
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate | RSS (MB) |
  |:--|--:|--:|--:|--:|--:|
  | FastFilterBloom | **19.43 Mops** <br><sub>100.0% of best</sub> | **21.55 Mops** <br><sub>100.0% of best</sub> | **17.30 Mops** <br><sub>100.0% of best</sub> | **0.0318%** <br><sub>100.0% of best</sub> | **1216.8** <br><sub>100.0% of best</sub> |
| bloomfilter | 10.29 Mops <br><sub>53.0% of best</sub> | 10.12 Mops <br><sub>47.0% of best</sub> | 9.705 Mops <br><sub>56.1% of best</sub> | 0.0352% <br><sub>90.3% of best</sub> | 1233.7 <br><sub>98.6% of best</sub> |
| @ably/bloomit | 1.230 Mops <br><sub>6.3% of best</sub> | 1.236 Mops <br><sub>5.7% of best</sub> | 1.731 Mops <br><sub>10.0% of best</sub> | 0.0350% <br><sub>90.9% of best</sub> | 2696.0 <br><sub>45.1% of best</sub> |
| blumea | 466.4 Kops <br><sub>2.4% of best</sub> | 421.6 Kops <br><sub>2.0% of best</sub> | 1.372 Mops <br><sub>7.9% of best</sub> | 1.02% <br><sub>3.1% of best</sub> | 3711.7 <br><sub>32.8% of best</sub> |
| bloom-filters | 316.3 Kops <br><sub>1.6% of best</sub> | 317.5 Kops <br><sub>1.5% of best</sub> | 332.0 Kops <br><sub>1.9% of best</sub> | 0.0319% <br><sub>99.7% of best</sub> | 2303.1 <br><sub>52.8% of best</sub> |
  

  ### strings N=3e6, M=2^26 (~64MB), K=12
  
  - **N:** 3,000,000  •  **Bits:** 67,108,864  •  **K:** 12  •  **Data:** strings
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate | RSS (MB) |
  |:--|--:|--:|--:|--:|--:|
  | FastFilterBloom | **20.69 Mops** <br><sub>100.0% of best</sub> | **21.30 Mops** <br><sub>100.0% of best</sub> | **16.06 Mops** <br><sub>100.0% of best</sub> | **0.00230%** <br><sub>100.0% of best</sub> | **4615.5** <br><sub>100.0% of best</sub> |
| bloomfilter | 9.141 Mops <br><sub>44.2% of best</sub> | 8.708 Mops <br><sub>40.9% of best</sub> | 8.170 Mops <br><sub>50.9% of best</sub> | 0.00257% <br><sub>89.6% of best</sub> | 4679.8 <br><sub>98.6% of best</sub> |
| @ably/bloomit | 1.040 Mops <br><sub>5.0% of best</sub> | 1.052 Mops <br><sub>4.9% of best</sub> | 1.578 Mops <br><sub>9.8% of best</sub> | 0.00250% <br><sub>92.0% of best</sub> | 6193.2 <br><sub>74.5% of best</sub> |
| blumea | 433.2 Kops <br><sub>2.1% of best</sub> | 353.0 Kops <br><sub>1.7% of best</sub> | 1.236 Mops <br><sub>7.7% of best</sub> | 1.00% <br><sub>0.2% of best</sub> | 4819.9 <br><sub>95.8% of best</sub> |
| bloom-filters | 278.8 Kops <br><sub>1.3% of best</sub> | 285.2 Kops <br><sub>1.3% of best</sub> | 320.2 Kops <br><sub>2.0% of best</sub> | 0.00280% <br><sub>82.1% of best</sub> | 5630.6 <br><sub>82.0% of best</sub> |
  

  ### buf128k N=5k, M=2^20 (~64MB), K=12
  
  - **N:** 500  •  **Bits:** 8,192  •  **K:** 12  •  **Data:** buffer128k
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate | RSS (MB) |
  |:--|--:|--:|--:|--:|--:|
  | FastFilterBloom | **105.5 Kops** <br><sub>100.0% of best</sub> | **104.5 Kops** <br><sub>100.0% of best</sub> | **103.4 Kops** <br><sub>100.0% of best</sub> | **0.00%** <br><sub>–</sub> | **5001.3** <br><sub>100.0% of best</sub> |
| @ably/bloomit | 60.41 Kops <br><sub>57.2% of best</sub> | 59.67 Kops <br><sub>57.1% of best</sub> | 61.32 Kops <br><sub>59.3% of best</sub> | **0.00%** <br><sub>–</sub> | 5245.3 <br><sub>95.3% of best</sub> |
| bloomfilter | 2.889 Kops <br><sub>2.7% of best</sub> | 2.883 Kops <br><sub>2.8% of best</sub> | 2.776 Kops <br><sub>2.7% of best</sub> | **0.00%** <br><sub>–</sub> | 5175.0 <br><sub>96.6% of best</sub> |
| blumea | 765.6 ops <br><sub>0.7% of best</sub> | 760.0 ops <br><sub>0.7% of best</sub> | 2.556 Kops <br><sub>2.5% of best</sub> | 1.60% <br><sub>0.0% of best</sub> | 5946.8 <br><sub>84.1% of best</sub> |
| bloom-filter | 309.1 ops <br><sub>0.3% of best</sub> | 312.3 ops <br><sub>0.3% of best</sub> | 1.771 Kops <br><sub>1.7% of best</sub> | **0.00%** <br><sub>–</sub> | 5244.6 <br><sub>95.4% of best</sub> |
| bloom-filters | 287.5 ops <br><sub>0.3% of best</sub> | 288.3 ops <br><sub>0.3% of best</sub> | 286.7 ops <br><sub>0.3% of best</sub> | **0.00%** <br><sub>–</sub> | 5193.5 <br><sub>96.3% of best</sub> |
  

  ### buf2m   N=500, M=2^27 (~128MB), K=12
  
  - **N:** 500  •  **Bits:** 134,217,728  •  **K:** 12  •  **Data:** buffer2m
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate | RSS (MB) |
  |:--|--:|--:|--:|--:|--:|
  | FastFilterBloom | **11.89 Kops** <br><sub>100.0% of best</sub> | **11.92 Kops** <br><sub>100.0% of best</sub> | **11.98 Kops** <br><sub>100.0% of best</sub> | **0.00%** <br><sub>–</sub> | 8008.5 <br><sub>47.7% of best</sub> |
| @ably/bloomit | 2.455 Kops <br><sub>20.6% of best</sub> | 2.638 Kops <br><sub>22.1% of best</sub> | 2.379 Kops <br><sub>19.9% of best</sub> | **0.00%** <br><sub>–</sub> | 7748.2 <br><sub>49.3% of best</sub> |
| bloomfilter | 178.5 ops <br><sub>1.5% of best</sub> | 179.3 ops <br><sub>1.5% of best</sub> | 178.7 ops <br><sub>1.5% of best</sub> | **0.00%** <br><sub>–</sub> | 4656.9 <br><sub>82.0% of best</sub> |
| blumea | 47.66 ops <br><sub>0.4% of best</sub> | 45.10 ops <br><sub>0.4% of best</sub> | 168.0 ops <br><sub>1.4% of best</sub> | 1.00% <br><sub>0.0% of best</sub> | 12095.3 <br><sub>31.6% of best</sub> |
| bloom-filters | 15.99 ops <br><sub>0.1% of best</sub> | 16.34 ops <br><sub>0.1% of best</sub> | 15.55 ops <br><sub>0.1% of best</sub> | **0.00%** <br><sub>–</sub> | **3817.4** <br><sub>100.0% of best</sub> |
  