import type { Row } from "./bench";

function relPctHigherIsBetter(curr: number, best: number): string {
	if (!Number.isFinite(curr) || !Number.isFinite(best) || best <= 0)
		return "<sub>–</sub>";
	return `<sub>${((curr / best) * 100).toFixed(1)}% of best</sub>`;
}
function relPctLowerIsBetter(curr: number, best: number): string {
	if (!Number.isFinite(curr) || !Number.isFinite(best) || curr <= 0)
		return "<sub>–</sub>";
	return `<sub>${((best / curr) * 100).toFixed(1)}% of best</sub>`;
}
function boldIfBest(s: string, isBest: boolean) {
	return isBest ? `**${s}**` : s;
}

// ---- formatting helpers (adaptive units + relative-to-best sublabels) ----
type Unit = "ops" | "Kops" | "Mops" | "Gops";
function pickUnit(opsPerSec: number): Unit {
	if (opsPerSec >= 1e9) return "Gops";
	if (opsPerSec >= 1e6) return "Mops";
	if (opsPerSec >= 1e3) return "Kops";
	return "ops";
}
export function formatRateFromMops(mops: number): {
	text: string;
	unit: Unit;
	value: number;
} {
	// mops is numeric (not rounded). Convert to ops/s and select unit to avoid 0.00
	const opsPerSec = mops * 1e6;
	const unit = pickUnit(opsPerSec);
	let val = opsPerSec;
	if (unit === "Gops") val = opsPerSec / 1e9;
	else if (unit === "Mops") val = opsPerSec / 1e6;
	else if (unit === "Kops") val = opsPerSec / 1e3;
	const prec = val < 10 ? 3 : val < 100 ? 2 : 1;
	return { text: `${val.toFixed(prec)} ${unit}`, unit, value: val };
}

function mdScenarioComparison(sName: string, rows: Row[] | undefined): string {
	if (!rows) return "";
	// Bests
	const bestAdd = Math.max(...rows.map((r) => r.add_mops));
	const bestHit = Math.max(...rows.map((r) => r.has_hit_mops));
	const bestMiss = Math.max(...rows.map((r) => r.has_miss_mops));
	const bestFP = Math.min(...rows.map((r) => r.fp_rate));

	// Sort adapters by add throughput desc
	const sorted = rows.slice().sort((a, b) => b.add_mops - a.add_mops);

	const header = `| Adapter | Add Throughput | Has-hit Throughput | Has-miss Throughput | FP Rate |`;
	const sep = `|:--|--:|--:|--:|--:|`;

	const lines = sorted.map((r) => {
		const addFmt = formatRateFromMops(r.add_mops);
		const hitFmt = formatRateFromMops(r.has_hit_mops);
		const missFmt = formatRateFromMops(r.has_miss_mops);

		const addCell =
			boldIfBest(`${addFmt.text}`, r.add_mops === bestAdd) +
			" <br>" +
			relPctHigherIsBetter(r.add_mops, bestAdd);
		const hitCell =
			boldIfBest(`${hitFmt.text}`, r.has_hit_mops === bestHit) +
			" <br>" +
			relPctHigherIsBetter(r.has_hit_mops, bestHit);
		const missCell =
			boldIfBest(`${missFmt.text}`, r.has_miss_mops === bestMiss) +
			" <br>" +
			relPctHigherIsBetter(r.has_miss_mops, bestMiss);

		const fpText = `${(r.fp_rate * 100).toPrecision(3)}%`;
		const fpCell =
			boldIfBest(fpText, r.fp_rate === bestFP) +
			" <br>" +
			relPctLowerIsBetter(r.fp_rate, bestFP);

		return `| ${r.lib} | ${addCell} | ${hitCell} | ${missCell} | ${fpCell} |`;
	});

	const meta = sorted[0];
	return `
  ### ${sName}
  
  - **N:** ${meta.N.toLocaleString()}  •  **Bits:** ${meta.bits.toLocaleString()}  •  **K:** ${meta.k}  •  **Data:** ${meta.dataKind}
  
  ${header}
  ${sep}
  ${lines.join("\n")}
  `;
}

export function makeMarkdownComparative(runs: number, rows: Row[]): string {
	const byScenario = Object.groupBy(rows, (r) => r.scenario);
	const scenarios = Object.keys(byScenario);

	const libSet = Array.from(new Set(rows.map((r) => r.lib)));
	const intro = `# Bloom Filter Bench — Comparative Report
  
  **Date:** ${new Date().toISOString()}
  
  **Adapters:** ${libSet.join(", ")}  
  **Scenarios:** ${scenarios.length}
  
  *Tables rank adapters within the same scenario. Primary values use **adaptive throughput units** (Ops/Kops/Mops/Gops). Sub-labels show percentage relative to the best in that metric (higher is better for throughput; lower is better for FP rate and RSS). Timings are medians of ${runs} runs with GC before/after each run. For adapters without Buffer support, buffer datasets are base64-encoded strings.*
  `;

	const blocks = scenarios.map((s) => mdScenarioComparison(s, byScenario[s]));

	return intro + blocks.join("\n");
}
