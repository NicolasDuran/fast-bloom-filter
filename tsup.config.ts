// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm", "cjs"],
	dts: true,
	sourcemap: true,
	clean: true,
	outDir: "dist",
	target: "node22",
	platform: "node",
	treeshake: true,
	splitting: false,
});
