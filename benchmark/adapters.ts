import npm_bloomit from "@ably/bloomit";
import npm_bloom_filter from "bloom-filter";
import npm_bloom_filters from "bloom-filters";
import npm_bloomfilter from "bloomfilter";
import * as npm_blumea from "blumea";
import { FastBloomFilter } from "../src/bloomfilter.ts";

export type AdapterInstance = {
	addString?: (s: string) => void;
	hasString?: (s: string) => boolean;
	addBuffer?: (b: Buffer) => void;
	hasBuffer?: (b: Buffer) => boolean;

	// Required meta
	bits: () => number;
	k: () => number;
};
export type Adapter = {
	name: string;
	supportsBuffer: boolean;
	create: (opts: {
		bits: number;
		k: number;
		N: number;
	}) => Promise<AdapterInstance>;
};

const adapter_npm_bloom_filters: Adapter = {
	name: "bloom-filters",
	supportsBuffer: false,
	async create({ bits, k }) {
		const inst = new npm_bloom_filters.BloomFilter(bits, k);
		return {
			addString: (s) => inst.add(s),
			hasString: (s) => inst.has(s),
			bits: () => bits,
			k: () => k,
		};
	},
};

const adapterBloomFilter: Adapter = {
	name: "bloomfilter",
	supportsBuffer: false,
	async create({ bits, k }) {
		const inst = new npm_bloomfilter.BloomFilter(bits, k);
		return {
			addString: (s) => inst.add(s),
			hasString: (s) => inst.test(s),
			bits: () => bits,
			k: () => k,
		};
	},
};

const adapterFastBloomFilter: Adapter = {
	name: "FastFilterBloom",
	supportsBuffer: true,
	async create({ bits, k }) {
		const inst = await FastBloomFilter(bits, k);
		return {
			addString: (s: string) => inst.addString(s),
			hasString: (s: string) => inst.hasString(s),
			addBuffer: (b: Buffer) => inst.add(b),
			hasBuffer: (b: Buffer) => inst.has(b),
			bits: () => inst.bitCount,
			k: () => k,
		};
	},
};

const adapter_npm_bloom_filter: Adapter = {
	name: "bloom-filter",
	supportsBuffer: true,
	async create({ bits, k }) {
		const inst = new npm_bloom_filter({
			vData: new Uint32Array(bits / 8).fill(0),
			nHashFuncs: k,
			nTweak: 2147483649,
			nFlags: 0,
		});
		return {
			addString: (s: string) => inst.insert(s),
			hasString: (s: string) => inst.contains(s),
			addBuffer: (b: Buffer) => inst.insert(b),
			hasBuffer: (b: Buffer) => inst.contains(b),
			bits: () => bits,
			k: () => k,
		};
	},
};

const adapter_npm_bloomit: Adapter = {
	name: "@ably/bloomit",
	supportsBuffer: false,
	async create({ bits, k }) {
		const inst = new npm_bloomit.BloomFilter(bits, k);
		return {
			addString: (s: string) => inst.add(s),
			hasString: (s: string) => inst.has(s),
			bits: () => bits,
			k: () => k,
		};
	},
};

const adapter_npm_blumea: Adapter = {
	name: "blumea",
	supportsBuffer: false,
	async create({ bits, k, N }) {
		const inst = new npm_blumea.BloomFilter(N, 0.01);
		return {
			addString: (s: string) => inst.insert(s),
			hasString: (s: string) => inst.find(s),
			bits: () => bits,
			k: () => k,
		};
	},
};

export const ADAPTERS: Adapter[] = [
	adapterFastBloomFilter,
	adapterBloomFilter,
	adapter_npm_bloom_filters,
	adapter_npm_bloom_filter,
	adapter_npm_bloomit,
	adapter_npm_blumea,
];
