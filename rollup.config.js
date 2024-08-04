import { defineConfig } from "rollup";
import esbuild from "rollup-plugin-esbuild";

export default defineConfig({
		input: "main.ts",
		output: {
			file: "dist/main.js",
			format: "esm",
		},
		plugins: [
			esbuild({
				tsconfig: "tsconfig.json",
				target: "ESNext",
				include: /\.[jt]sx?$/,
				exclude: /node_modules/,
			})
		]
})