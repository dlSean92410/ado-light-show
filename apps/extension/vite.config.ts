import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { crx } from '@crxjs/vite-plugin';
import manifest from './public/manifest.json';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), crx({ manifest })],
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
		},
	},
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		cssCodeSplit: false, // prevent css files generation from content script
		rollupOptions: {
			input: {
				penlightManager: resolve(__dirname, 'src/page/penlight-manager/index.html'),
			},
		},
	},
	assetsInclude: ['**/*.wasm'],
});
