import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import { ADAPTERS, type Adapter, type AdapterInstance } from "./adapters";
import { formatRateFromMops, makeMarkdownComparative } from "./markdown";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MB = 1024 * 1024;
const now = () => performance.now();
const median = (arr: number[]) =>
  arr.slice().sort((a, b) => a - b)[Math.floor(arr.length / 2)];

declare global {
  // eslint-disable-next-line no-var
  var gc: (() => void) | undefined;
}

function forceGC(label?: string) {
  if (global.gc) {
    global.gc();
    // tiny wait to let sweeping finish
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1);
  } else if (label) {
    console.warn(`[warn] GC not exposed: ${label}. Run with: node --expose-gc ...`);
  }
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

function genStrings(n: number, seed = 1234): string[] {
  const rnd = makeRng(seed);
  const out = new Array<string>(n);
  for (let i = 0; i < n; i++)
    out[i] =
      `${rnd().toString(36)}:${rnd().toString(36)}:${rnd().toString(36)}:${rnd().toString(36)}:${i.toString(36)}`;
  return out;
}

function genBuffers(n: number, sizeBytes: number, seed = 2025): Buffer[] {
  const rnd = makeRng(seed);
  const out = new Array<Buffer>(n);
  for (let i = 0; i < n; i++) {
    const buf = Buffer.allocUnsafe(sizeBytes);
    for (let j = 0; j < sizeBytes; j += 4) {
      const v = rnd();
      buf[j] = v & 255;
      buf[j + 1] = (v >>> 8) & 255;
      buf[j + 2] = (v >>> 16) & 255;
      buf[j + 3] = (v >>> 24) & 255;
    }
    out[i] = buf;
  }
  return out;
}

function buffersToB64(arr: Buffer[]): string[] {
  const out = new Array<string>(arr.length);
  for (let i = 0; i < arr.length; i++) out[i] = arr[i].toString("base64");
  return out;
}

async function timeMedian(
  runs: number,
  fn: () => void | Promise<void>,
): Promise<number> {
  const times: number[] = [];
  for (let i = 0; i < runs; i++) {
    forceGC(`pre-run ${i + 1}/${runs}`);
    const t0 = now();
    await fn();
    const t1 = now();
    forceGC(`post-run ${i + 1}/${runs}`);
    times.push(t1 - t0);
  }
  return median(times);
}

// ---------- scenarios ----------
type Scenario = {
  name: string;
  N: number;
  bits: number;
  k: number;
  dataKind: "strings" | "buffer128k" | "buffer2m";
};
const SCENARIOS: Scenario[] = [
  {
    name: "strings N=1e5, M=2^21 (~2MB), K=10",
    N: 100_000,
    bits: 2 ** 21,
    k: 10,
    dataKind: "strings",
  },
  {
    name: "strings N=1e6, M=2^24 (~16MB), K=10",
    N: 1_000_000,
    bits: 2 ** 24,
    k: 10,
    dataKind: "strings",
  },
  {
    name: "strings N=3e6, M=2^26 (~64MB), K=12",
    N: 3_000_000,
    bits: 2 ** 26,
    k: 12,
    dataKind: "strings",
  },
  {
    name: "buf128k N=5k, M=2^20 (~64MB), K=12",
    N: 5_00,
    bits: 2 ** 13,
    k: 12,
    dataKind: "buffer128k",
  },
  {
    name: "buf2m   N=500, M=2^27 (~128MB), K=12",
    N: 500,
    bits: 2 ** 27,
    k: 12,
    dataKind: "buffer2m",
  },
];
const RUNS = 3;

// ---------- measurement model ----------
export type Row = {
  lib: string;
  scenario: string;
  dataKind: Scenario["dataKind"];
  N: number;
  bits: number;
  k: number;
  add_ms: number;
  add_mops: number; // store Mops numerically (we'll format adaptively)
  has_hit_ms: number;
  has_hit_mops: number;
  has_miss_ms: number;
  has_miss_mops: number;
  fp: number;
  fp_rate: number;
};

function makeOps(inst: AdapterInstance) {
  return {
    addAny: (v: string | Buffer) => {
      if (typeof v === "string") {
        if (!inst.addString) throw new Error("Adapter missing addString");
        inst.addString(v);
      } else {
        if (inst.addBuffer) inst.addBuffer(v);
        else if (inst.addString) inst.addString(v.toString("base64"));
        else throw new Error("Adapter missing both addBuffer/addString");
      }
    },
    hasAny: (v: string | Buffer) => {
      if (typeof v === "string") {
        if (!inst.hasString) throw new Error("Adapter missing hasString");
        return inst.hasString(v);
      } else {
        if (inst.hasBuffer) return inst.hasBuffer(v);
        if (inst.hasString) return inst.hasString(v.toString("base64"));
        throw new Error("Adapter missing both hasBuffer/hasString");
      }
    },
  };
}

async function benchAdapterScenario(
  adapter: Adapter,
  sc: Scenario,
): Promise<Row> {
  const { N, bits, k, dataKind } = sc;

  // Generate datasets
  let presentStr: string[] = [];
  let absentStr: string[] = [];
  let presentBuf: Buffer[] = [];
  let absentBuf: Buffer[] = [];

  if (dataKind === "strings") {
    presentStr = genStrings(N, 1111);
    absentStr = genStrings(N, 2222).map((s) => `z${s}`);
  } else if (dataKind === "buffer128k") {
    presentBuf = genBuffers(N, 128 * 1024, 3333);
    absentBuf = genBuffers(N, 128 * 1024, 4444);
    presentStr = buffersToB64(presentBuf);
    absentStr = buffersToB64(absentBuf);
  } else {
    // buffer2m
    presentBuf = genBuffers(N, 2 * 1024 * 1024, 5555);
    absentBuf = genBuffers(N, 2 * 1024 * 1024, 6666);
    presentStr = buffersToB64(presentBuf);
    absentStr = buffersToB64(absentBuf);
  }

  // Decide which representation to pass to this adapter
  const useBuffer = dataKind !== "strings" && adapter.supportsBuffer;

  // Warmup (to get JIT going)
  const warm = await adapter.create({ bits, k, N });
  const W = Math.min(5000, N);
  const { addAny: warmAdd, hasAny: warmHas } = makeOps(warm);
  for (let i = 0; i < W; i++) warmAdd(useBuffer ? presentBuf[i] : presentStr[i]);
  for (let i = 0; i < W; i++) warmHas(useBuffer ? presentBuf[i] : presentStr[i]);

  // Fresh instance for timed work
  const f = await adapter.create({ bits, k, N });
  const { addAny: addOp, hasAny: hasOp } = makeOps(f);

  const add_ms = await timeMedian(RUNS, () => {
    if (useBuffer) {
      for (let i = 0; i < N; i++) addOp(presentBuf[i]);
    } else {
      for (let i = 0; i < N; i++) addOp(presentStr[i]);
    }
  });
  const add_mops = +(N / add_ms / 1000);

  const has_hit_ms = await timeMedian(RUNS, () => {
    let acc = 0;
    if (useBuffer) {
      for (let i = 0; i < N; i++) acc += hasOp(presentBuf[i]) ? 1 : 0;
    } else {
      for (let i = 0; i < N; i++) acc += hasOp(presentStr[i]) ? 1 : 0;
    }
    if (acc === 0) console.error("sanity: zero hits?");
  });
  const has_hit_mops = +(N / has_hit_ms / 1000);

  let lastFP = 0;
  const has_miss_ms = await timeMedian(RUNS, () => {
    let fp = 0;
    if (useBuffer) {
      for (let i = 0; i < N; i++) if (hasOp(absentBuf[i])) fp++;
    } else {
      for (let i = 0; i < N; i++) if (hasOp(absentStr[i])) fp++;
    }
    lastFP = fp;
  });
  const has_miss_mops = +(N / has_miss_ms / 1000);
  const fp_rate = lastFP / N;

  forceGC("final");

  return {
    lib: adapter.name,
    scenario: sc.name,
    dataKind,
    N,
    bits,
    k,
    add_ms: +add_ms,
    add_mops,
    has_hit_ms: +has_hit_ms,
    has_hit_mops,
    has_miss_ms: +has_miss_ms,
    has_miss_mops,
    fp: lastFP,
    fp_rate,
  };
}

// safe wrapper that isolates adapter failures
async function tryBenchAdapterScenario(
  adapter: Adapter,
  sc: Scenario,
): Promise<Row | null> {
  try {
    return await benchAdapterScenario(adapter, sc);
  } catch (e: any) {
    const msg = e?.stack ?? e?.message ?? String(e);
    console.error(`\n[ERROR] Scenario="${sc.name}" Adapter="${adapter.name}" failed:\n${msg}\n`);
    return null;
  }
}

async function main() {
  const rows: Row[] = [];

  for (const sc of SCENARIOS) {
    const perScenarioValid: Row[] = [];
    for (const adapter of ADAPTERS) {
      const r = await tryBenchAdapterScenario(adapter, sc);
      if (r) {
        perScenarioValid.push(r);
        rows.push(r);
      }
    }
    if (perScenarioValid.length === 0) {
      console.warn(`\n[${sc.name}] No successful adapters for this scenario.`);
      continue;
    }
    
    const fastest = perScenarioValid
      .slice()
      .sort((a, b) => b.add_mops - a.add_mops)[0];
    const lowestFP = perScenarioValid
      .slice()
      .sort((a, b) => a.fp_rate - b.fp_rate)[0];
    

    console.log(
      `\n[${sc.name}] fastest add: ${fastest.lib} (${formatRateFromMops(fastest.add_mops).text}); ` +
        `lowest FP: ${lowestFP.lib} (${(lowestFP.fp_rate * 100).toPrecision(3)}%);`
    );
  }

  if (rows.length === 0) {
    console.warn("\nNo successful results to write. Skipping report.md generation.");
    return;
  }

  const md = makeMarkdownComparative(RUNS, rows);
  const mdPath = resolve(__dirname, "report.md");
  writeFileSync(mdPath, md, "utf8");

  console.log(`\nWrote: ${mdPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});