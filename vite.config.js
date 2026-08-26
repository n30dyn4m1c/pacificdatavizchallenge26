import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

/**
 * font-preload — inject <link rel="preload" as="font"> for the bundled latin
 * woff2 faces, in paint order. Without this the Fraunces headline swaps in
 * late on slow links (font-display:swap = guaranteed FOUT); with it the four
 * faces start downloading with the first HTML. Hashed filenames make static
 * hints impossible, so the links are written into the finished index.html
 * after the build settles (closeBundle runs after the static adapter's own
 * writeBundle). Marker comment keeps the injection idempotent.
 */
function fontPreload() {
	return {
		name: 'font-preload',
		closeBundle() {
			const htmlPath = 'build/index.html';
			const assetsDir = 'build/_app/immutable/assets';
			let html, files;
			try {
				html = readFileSync(htmlPath, 'utf8');
				files = readdirSync(assetsDir);
			} catch {
				return; // not a full build (dev/preview) — nothing to do
			}
			if (html.includes('<!-- font-preload -->')) return;
			const order = [
				'fraunces-latin-900-normal', // the display face, first paint
				'fraunces-latin-700-normal',
				'public-sans-latin-400-normal', // body text
				'public-sans-latin-600-normal'
			];
			const links = order
				.map((base) => files.find((f) => f.startsWith(base) && f.endsWith('.woff2')))
				.filter(Boolean)
				.map(
					(f) =>
						`\t\t<link rel="preload" href="./_app/immutable/assets/${f}" as="font" type="font/woff2" crossorigin />`
				)
				.join('\n');
			if (!links) return;
			writeFileSync(
				htmlPath,
				html.replace('</head>', `<!-- font-preload -->\n${links}\n\t</head>`)
			);
		}
	};
}

export default defineConfig({
	plugins: [sveltekit(), fontPreload()]
});
