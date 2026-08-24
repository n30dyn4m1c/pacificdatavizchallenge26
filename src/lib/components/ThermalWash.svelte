<script>
	/**
	 * ThermalWash — the piece's ambient thermometer. A fixed, pointer-blind
	 * veil that carries a whisper of the story's own temperature across the
	 * whole surface: as the reader moves from chapter to chapter, the page
	 * breathes toward the warm arm through the drought chapters, cools when
	 * the piece dives under the ocean and when the rains come back, and runs
	 * hottest of all through chapter nine — the present.
	 *
	 * It is mapped to SCROLL POSITION between the chapter anchors (the same
	 * ids the contents rail jumps to), interpolated linearly, capped at a
	 * few percent opacity so type and charts never lose contrast, and it is
	 * never animated by anything but the reader's own scrolling.
	 */
	import { onMount } from 'svelte';

	// story temperature at each chapter anchor, −1 (cool pole) … +1 (warm)
	const POINTS = [
		['ch-1', 0.12],
		['ch-engine', -0.22],
		['ch-2', 0],
		['ch-3', 0.42],
		['ch-4', 0.55],
		['ch-5', 0.48],
		['ch-aftermath', -0.38],
		['ch-6', 0.24],
		['ch-7', 0.06],
		['ch-8', 0.1],
		['ch-9', 0.85],
		['ch-shelf26', 0.55],
		['ch-ask', 0.18],
		['ch-record', 0]
	];

	let el = $state(null);

	onMount(() => {
		if (!el) return;
		let stops = [];
		let raf = 0;

		const measure = () => {
			const docTop = 0;
			stops = [];
			for (const [id, t] of POINTS) {
				const node = document.getElementById(id);
				if (node) stops.push({ y: Math.max(docTop, node.offsetTop ?? 0), t });
			}
			stops.sort((a, b) => a.y - b.y);
			paint();
		};

		const tempAt = (y) => {
			if (!stops.length) return 0;
			if (y <= stops[0].y) return stops[0].t;
			for (let i = 1; i < stops.length; i++) {
				if (y < stops[i].y) {
					const a = stops[i - 1];
					const b = stops[i];
					return a.t + ((b.t - a.t) * (y - a.y)) / Math.max(1, b.y - a.y);
				}
			}
			return stops[stops.length - 1].t;
		};

		// cap: a cast, never a filter — type keeps full contrast everywhere
		const MAX_A = 0.05;
		const paint = () => {
			const t = tempAt(window.scrollY);
			el.style.setProperty('--wash-warm', (Math.max(0, t) * MAX_A).toFixed(4));
			el.style.setProperty('--wash-cool', (Math.max(0, -t) * MAX_A).toFixed(4));
		};

		const onScroll = () => {
			if (!raf) raf = requestAnimationFrame(() => (raf = 0) || paint());
		};
		const remeasure = () => {
			measure();
		};

		measure();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', remeasure);
		// late layout shifts (fonts, images, lazy scenes) move the anchors
		const ro = new ResizeObserver(remeasure);
		ro.observe(document.body);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', remeasure);
			ro.disconnect();
			cancelAnimationFrame(raf);
		};
	});
</script>

<div bind:this={el} class="thermal-wash no-print" aria-hidden="true"></div>

<style>
	.thermal-wash {
		position: fixed;
		inset: 0;
		z-index: 90;
		pointer-events: none;
		background:
			linear-gradient(to bottom, rgb(199 67 49 / calc(var(--wash-warm, 0) * 2)) 0%, rgb(199 67 49 / var(--wash-warm, 0)) 100%),
			linear-gradient(to bottom, rgb(42 120 214 / var(--wash-cool, 0)) 0%, rgb(42 120 214 / calc(var(--wash-cool, 0) * 2)) 100%);
	}
</style>
