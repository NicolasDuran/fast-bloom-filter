# Bloom Filter Bench — Comparative Report
  
  **Date:** 2025-10-31T23:22:41.460Z
  
  **Adapters:** FastFilterBloom, bloomfilter, bloom-filters, bloom-filter, @ably/bloomit, blumea  
  **Scenarios:** 5
  
  *Tables rank adapters within the same scenario. Primary values use **adaptive throughput units** (Ops/Kops/Mops/Gops). Sub-labels show percentage relative to the best in that metric (higher is better for throughput; lower is better for FP rate and RSS). Timings are medians of 3 runs with GC before/after each run. For adapters without Buffer support, buffer datasets are base64-encoded strings.*
  
  ### strings N=1e5, M=2^21 (~2MB), K=10
  
  - **N:** 100,000  •  **Bits:** 2,097,152  •  **K:** 10  •  **Data:** strings
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate | RSS (MB) |
  |:--|--:|--:|--:|--:|--:|
  | FastFilterBloom | **25.55 Mops** <br><sub>100.0% of best</sub> | **24.83 Mops** <br><sub>100.0% of best</sub> | **18.86 Mops** <br><sub>100.0% of best</sub> | 0.00500% <br><sub>80.0% of best</sub> | **163.4** <br><sub>100.0% of best</sub> |
| bloomfilter | 6.605 Mops <br><sub>25.9% of best</sub> | 9.883 Mops <br><sub>39.8% of best</sub> | 10.15 Mops <br><sub>53.8% of best</sub> | 0.00600% <br><sub>66.7% of best</sub> | 170.4 <br><sub>95.9% of best</sub> |
| @ably/bloomit | 1.397 Mops <br><sub>5.5% of best</sub> | 1.343 Mops <br><sub>5.4% of best</sub> | 1.966 Mops <br><sub>10.4% of best</sub> | 0.00700% <br><sub>57.1% of best</sub> | 382.8 <br><sub>42.7% of best</sub> |
| blumea | 619.1 Kops <br><sub>2.4% of best</sub> | 566.4 Kops <br><sub>2.3% of best</sub> | 1.911 Mops <br><sub>10.1% of best</sub> | 0.964% <br><sub>0.4% of best</sub> | 512.4 <br><sub>31.9% of best</sub> |
| bloom-filters | 338.2 Kops <br><sub>1.3% of best</sub> | 351.1 Kops <br><sub>1.4% of best</sub> | 350.9 Kops <br><sub>1.9% of best</sub> | **0.00400%** <br><sub>100.0% of best</sub> | 371.5 <br><sub>44.0% of best</sub> |
| bloom-filter | 225.2 Kops <br><sub>0.9% of best</sub> | 224.1 Kops <br><sub>0.9% of best</sub> | 1.310 Mops <br><sub>6.9% of best</sub> | 0.00600% <br><sub>66.7% of best</sub> | 374.0 <br><sub>43.7% of best</sub> |
  

  ### strings N=1e6, M=2^24 (~16MB), K=10
  
  - **N:** 1,000,000  •  **Bits:** 16,777,216  •  **K:** 10  •  **Data:** strings
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate | RSS (MB) |
  |:--|--:|--:|--:|--:|--:|
  | FastFilterBloom | **23.08 Mops** <br><sub>100.0% of best</sub> | **24.20 Mops** <br><sub>100.0% of best</sub> | **18.42 Mops** <br><sub>100.0% of best</sub> | **0.0318%** <br><sub>100.0% of best</sub> | **1212.2** <br><sub>100.0% of best</sub> |
| bloomfilter | 10.61 Mops <br><sub>46.0% of best</sub> | 10.85 Mops <br><sub>44.9% of best</sub> | 9.753 Mops <br><sub>52.9% of best</sub> | 0.0352% <br><sub>90.3% of best</sub> | 1229.3 <br><sub>98.6% of best</sub> |
| @ably/bloomit | 1.300 Mops <br><sub>5.6% of best</sub> | 1.291 Mops <br><sub>5.3% of best</sub> | 1.677 Mops <br><sub>9.1% of best</sub> | 0.0350% <br><sub>90.9% of best</sub> | 2210.3 <br><sub>54.8% of best</sub> |
| blumea | 468.1 Kops <br><sub>2.0% of best</sub> | 439.3 Kops <br><sub>1.8% of best</sub> | 1.390 Mops <br><sub>7.5% of best</sub> | 1.02% <br><sub>3.1% of best</sub> | 2795.4 <br><sub>43.4% of best</sub> |
| bloom-filters | 319.8 Kops <br><sub>1.4% of best</sub> | 331.2 Kops <br><sub>1.4% of best</sub> | 345.1 Kops <br><sub>1.9% of best</sub> | 0.0319% <br><sub>99.7% of best</sub> | 1588.7 <br><sub>76.3% of best</sub> |
  

  ### strings N=3e6, M=2^26 (~64MB), K=12
  
  - **N:** 3,000,000  •  **Bits:** 67,108,864  •  **K:** 12  •  **Data:** strings
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate | RSS (MB) |
  |:--|--:|--:|--:|--:|--:|
  | FastFilterBloom | **20.52 Mops** <br><sub>100.0% of best</sub> | **22.03 Mops** <br><sub>100.0% of best</sub> | **20.13 Mops** <br><sub>100.0% of best</sub> | **0.00230%** <br><sub>100.0% of best</sub> | 4328.0 <br><sub>77.5% of best</sub> |
| bloomfilter | 9.224 Mops <br><sub>44.9% of best</sub> | 8.841 Mops <br><sub>40.1% of best</sub> | 9.106 Mops <br><sub>45.2% of best</sub> | 0.00257% <br><sub>89.6% of best</sub> | 4092.2 <br><sub>81.9% of best</sub> |
| @ably/bloomit | 1.083 Mops <br><sub>5.3% of best</sub> | 1.092 Mops <br><sub>5.0% of best</sub> | 1.581 Mops <br><sub>7.9% of best</sub> | 0.00250% <br><sub>92.0% of best</sub> | 4546.4 <br><sub>73.8% of best</sub> |
| blumea | 440.1 Kops <br><sub>2.1% of best</sub> | 387.8 Kops <br><sub>1.8% of best</sub> | 1.307 Mops <br><sub>6.5% of best</sub> | 1.00% <br><sub>0.2% of best</sub> | 6420.2 <br><sub>52.2% of best</sub> |
| bloom-filters | 260.5 Kops <br><sub>1.3% of best</sub> | 293.4 Kops <br><sub>1.3% of best</sub> | 324.1 Kops <br><sub>1.6% of best</sub> | 0.00280% <br><sub>82.1% of best</sub> | **3353.3** <br><sub>100.0% of best</sub> |
  

  ### buf128k N=5k, M=2^20 (~64MB), K=12
  
  - **N:** 500  •  **Bits:** 8,192  •  **K:** 12  •  **Data:** buffer128k
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate | RSS (MB) |
  |:--|--:|--:|--:|--:|--:|
  | FastFilterBloom | **107.7 Kops** <br><sub>100.0% of best</sub> | **108.3 Kops** <br><sub>100.0% of best</sub> | **106.6 Kops** <br><sub>100.0% of best</sub> | **0.00%** <br><sub>–</sub> | 6428.3 <br><sub>47.6% of best</sub> |
| @ably/bloomit | 60.39 Kops <br><sub>56.1% of best</sub> | 59.17 Kops <br><sub>54.6% of best</sub> | 60.61 Kops <br><sub>56.8% of best</sub> | **0.00%** <br><sub>–</sub> | 3148.1 <br><sub>97.2% of best</sub> |
| bloomfilter | 2.919 Kops <br><sub>2.7% of best</sub> | 2.856 Kops <br><sub>2.6% of best</sub> | 2.900 Kops <br><sub>2.7% of best</sub> | **0.00%** <br><sub>–</sub> | 6179.5 <br><sub>49.5% of best</sub> |
| blumea | 781.7 ops <br><sub>0.7% of best</sub> | 783.1 ops <br><sub>0.7% of best</sub> | 2.619 Kops <br><sub>2.5% of best</sub> | 1.60% <br><sub>0.0% of best</sub> | **3061.6** <br><sub>100.0% of best</sub> |
| bloom-filter | 314.2 ops <br><sub>0.3% of best</sub> | 313.3 ops <br><sub>0.3% of best</sub> | 1.767 Kops <br><sub>1.7% of best</sub> | **0.00%** <br><sub>–</sub> | 3209.8 <br><sub>95.4% of best</sub> |
| bloom-filters | 272.7 ops <br><sub>0.3% of best</sub> | 276.2 ops <br><sub>0.3% of best</sub> | 276.1 ops <br><sub>0.3% of best</sub> | **0.00%** <br><sub>–</sub> | 3896.5 <br><sub>78.6% of best</sub> |
  

  ### buf2m   N=500, M=2^27 (~128MB), K=12
  
  - **N:** 500  •  **Bits:** 134,217,728  •  **K:** 12  •  **Data:** buffer2m
  
  | Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate | RSS (MB) |
  |:--|--:|--:|--:|--:|--:|
  | FastFilterBloom | **12.04 Kops** <br><sub>100.0% of best</sub> | **12.21 Kops** <br><sub>100.0% of best</sub> | **12.13 Kops** <br><sub>100.0% of best</sub> | **0.00%** <br><sub>–</sub> | 5142.1 <br><sub>53.4% of best</sub> |
| @ably/bloomit | 2.730 Kops <br><sub>22.7% of best</sub> | 2.817 Kops <br><sub>23.1% of best</sub> | 2.876 Kops <br><sub>23.7% of best</sub> | **0.00%** <br><sub>–</sub> | 6025.3 <br><sub>45.6% of best</sub> |
| bloomfilter | 182.7 ops <br><sub>1.5% of best</sub> | 176.2 ops <br><sub>1.4% of best</sub> | 182.2 ops <br><sub>1.5% of best</sub> | **0.00%** <br><sub>–</sub> | **2745.0** <br><sub>100.0% of best</sub> |
| blumea | 44.94 ops <br><sub>0.4% of best</sub> | 47.52 ops <br><sub>0.4% of best</sub> | 171.0 ops <br><sub>1.4% of best</sub> | 1.00% <br><sub>0.0% of best</sub> | 12096.7 <br><sub>22.7% of best</sub> |
| bloom-filters | 14.35 ops <br><sub>0.1% of best</sub> | 14.04 ops <br><sub>0.1% of best</sub> | 14.44 ops <br><sub>0.1% of best</sub> | **0.00%** <br><sub>–</sub> | 7954.6 <br><sub>34.5% of best</sub> |
  