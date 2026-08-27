/**
 * smoke.mjs — post-build smoke test.
 *
 * Asserts the built page actually contains the piece's load-bearing markup,
 * copy and assets. `vite build` compiles modules; it does NOT catch a page
 * that prerenders with missing content, and a dangling template reference
 * once shipped a silently broken page. Run after `npm run build`:
 *
 *   node prep/smoke.mjs        (or: npm run smoke)
 *
 * Exits 1 and names every missing check on failure.
 */
import { readFileSync, existsSync } from 'node:fs';

const page = 'build/index.html';
if (!existsSync(page)) {
	console.error(`smoke: ${page} not found — run \`npm run build\` first`);
	process.exit(1);
}
const html = readFileSync(page, 'utf-8');

// one string per load-bearing feature: hero, TL;DR, chapters, field notes,
// chapter nine, the ask, the epilogue, the social card
const CHECKS = [
	'The Ocean Knows First',
	'property="og:image"',
	'name="twitter:card"',
	'The story in three numbers',
	'The rain’s switch sits an ocean away',
	'Under the surface, an',
	'When the far ocean tips, the rain follows.',
	'One drought, every altitude.',
	'What a dry year takes.',
	'Papua New Guinea didn’t cause this.',
	'Months without real rain',
	'an ordinary night',
	'This time is',
	'Faster than all four greats',
	'Prepare for the predictable',
	'Store water now',
	'Expect the flood after',
	'The whole record.',
	// the Challenge's turtle mark, in the hero and the colophon (app.html's
	// favicon links point at the same files)
	'/turtle-white.png',
	'/turtle.png'
];

const ASSETS = [
	'build/share/og.png',
	'build/data/scene_map.json',
	'build/data/scene_now.json',
	'build/data/scene_record.json',
	'build/turtle.png',
	'build/turtle-white.png',
	'build/favicon-light.png',
	'build/favicon-dark.png'
];

let missing = 0;
for (const c of CHECKS) {
	if (!html.includes(c)) {
		console.error(`smoke: MISSING in ${page}: ${JSON.stringify(c)}`);
		missing++;
	}
}
for (const a of ASSETS) {
	if (!existsSync(a)) {
		console.error(`smoke: MISSING asset: ${a}`);
		missing++;
	}
}
if (missing) {
	console.error(`smoke: ${missing} check(s) failed`);
	process.exit(1);
}
console.log(`smoke: ok — ${CHECKS.length} page checks, ${ASSETS.length} asset checks`);
