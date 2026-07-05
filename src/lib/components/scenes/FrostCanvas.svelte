<script>
	/**
	 * Canvas-2D frost crystallization for Scene 5. Deterministic (seeded):
	 * ~500 branch segments are precomputed with a "birth" progress; drawing
	 * is purely scroll-driven (no rAF loop — nothing animates on its own).
	 * The canvas only redraws while the scene is active.
	 *
	 * `start`/`span` map scene progress → frost sweep. Under
	 * prefers-reduced-motion the branch-growth creep is replaced by a
	 * simple crossfade: the finished pattern fades in as one layer.
	 */
	import { ui } from '$lib/state.svelte.js';

	let { progress = 0, active = false, start = 0.22, span = 0.5 } = $props();

	let canvas = $state(null);
	let box = $state(null);
	let w = $state(0);
	let h = $state(0);

	// mulberry32 — seeded, so the pattern is identical on every visit
	function rng(seed) {
		return () => {
			seed |= 0;
			seed = (seed + 0x6d2b79f5) | 0;
			let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	// segments in unit coordinates; grown from seed points on the mound crest
	const segments = (() => {
		const r = rng(260714);
		const segs = [];
		const seeds = 9;
		for (let s = 0; s < seeds; s++) {
			const sx = 0.12 + (0.76 * s) / (seeds - 1) + (r() - 0.5) * 0.05;
			const sy = 0.62 - Math.sin((s / (seeds - 1)) * Math.PI) * 0.28 + (r() - 0.5) * 0.04;
			const grow = (x, y, angle, len, depth, birth) => {
				if (depth > 4 || len < 0.008) return;
				const nx = x + Math.cos(angle) * len;
				const ny = y + Math.sin(angle) * len;
				segs.push({ x1: x, y1: y, x2: nx, y2: ny, birth, d: depth });
				const kids = depth < 2 ? 3 : 2;
				for (let k = 0; k < kids; k++) {
					grow(
						nx,
						ny,
						angle + (r() - 0.5) * 1.9,
						len * (0.55 + r() * 0.3),
						depth + 1,
						Math.min(1, birth + 0.08 + r() * 0.12)
					);
				}
			};
			for (let b = 0; b < 5; b++) {
				grow(sx, sy, r() * Math.PI * 2, 0.028 + r() * 0.03, 0, s / seeds / 3 + b * 0.02);
			}
		}
		return segs;
	})();

	// frost sweeps the mound over progress start → start+span of the scene
	const frostP = $derived(Math.max(0, Math.min(1, (progress - start) / span)));

	$effect(() => {
		if (!canvas || !active) return;
		void frostP;
		void ui.reducedMotion;
		const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
		const cw = Math.round(w * dpr);
		const ch = Math.round(h * dpr);
		if (!cw || !ch) return;
		if (canvas.width !== cw || canvas.height !== ch) {
			canvas.width = cw;
			canvas.height = ch;
		}
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, cw, ch);
		// reduced motion: no creeping growth — the finished pattern
		// crossfades in as a single layer instead
		const reduced = ui.reducedMotion;
		canvas.style.opacity = reduced ? String(frostP) : '1';
		// frost wears the anomaly scale's cool arm (see palette.js)
		ctx.lineCap = 'round';
		for (const s of segments) {
			if (!reduced && s.birth > frostP) continue;
			if (reduced && frostP === 0) continue;
			ctx.strokeStyle = s.d < 2 ? 'rgba(168, 212, 248, 0.85)' : 'rgba(95, 168, 238, 0.5)';
			ctx.lineWidth = (s.d < 2 ? 1.6 : 1) * dpr;
			ctx.beginPath();
			ctx.moveTo(s.x1 * cw, s.y1 * ch);
			ctx.lineTo(s.x2 * cw, s.y2 * ch);
			ctx.stroke();
		}
	});
</script>

<!-- overlay layer: the scene positions this box over its illustration -->
<div class="frost-box" bind:this={box} bind:clientWidth={w} bind:clientHeight={h}>
	<canvas bind:this={canvas} aria-hidden="true"></canvas>
</div>

<style>
	.frost-box {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
</style>
