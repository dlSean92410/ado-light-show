import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { crx } from '@crxjs/vite-plugin';
import manifest from './public/manifest.json';

// https://vite.dev/config/
export default defineConfig({
	plugins: [encoderBuildPlugin(), react(), crx({ manifest })],
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
		},
	},
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		cssCodeSplit: false, // prevent css files generation from content script
	},
});

function encoderBuildPlugin() {
	return {
		name: 'encoder-build',
		async buildStart() {
			const fs = await import('fs');
			const path = await import('path');

			const src = path.resolve(__dirname, 'src/crypto/encoder.dev.js');
			const out = path.resolve(__dirname, 'src/crypto/encoder.js');
			if (!fs.existsSync(src)) {
				console.warn('[encoder-build] encoder.dev.js not found');
				return;
			}
			const code = fs.readFileSync(src, 'utf8');
			const result = await transformWithEsbuild(code, src, {
				minify: true,
				target: 'es2020',
				format: 'esm',
			});
			fs.writeFileSync(out, result.code, 'utf8');
			console.log('[encoder-build] encoder.js generated');
		},
	};
}
