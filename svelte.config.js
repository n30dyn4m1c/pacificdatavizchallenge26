import adapter from '@sveltejs/adapter-static';

/**
 * BASE_PATH is set by the GitHub Pages deploy workflow to "/<repo-name>".
 * Locally it defaults to '' so `npm run dev` / `npm run preview` work at /.
 * All asset and data URLs in the app go through `base` from `$app/paths`.
 */
const base = process.env.BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			fallback: undefined, // fully prerendered, no SPA fallback
			strict: true
		}),
		paths: {
			base
		}
	}
};

export default config;
