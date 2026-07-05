<script>
	/**
	 * TransitionMotif — the anomaly color scale as a thin fixed gradient
	 * bar that surfaces only around scene boundaries, changing position and
	 * orientation from one handover to the next: the connective tissue
	 * tying the shader palette through the whole piece. Deliberately faint
	 * — it should be felt, not noticed. Purely decorative (aria-hidden).
	 */
	import { onMount } from 'svelte';
	import { anomalyStops, ANOM_MIN, ANOM_MAX } from '$lib/palette.js';

	const stops = anomalyStops('dark');
	const grad = (deg) =>
		`linear-gradient(${deg}deg, ${stops
			.map((s) => `${s.hex} ${(((s.t - ANOM_MIN) / (ANOM_MAX - ANOM_MIN)) * 100).toFixed(1)}%`)
			.join(', ')})`;

	let opacity = $state(0);
	// cycle: top edge → right edge (vertical) → bottom edge → …
	let slot = $state(0);

	onMount(() => {
		let boundaries = [];

		function measure() {
			const scenes = [...document.querySelectorAll('section.scene')];
			// a boundary is the handover between consecutive scenes
			boundaries = scenes
				.slice(1)
				.map((s) => s.getBoundingClientRect().top + window.scrollY);
		}

		let raf = 0;
		function update() {
			raf = 0;
			if (!boundaries.length) return;
			const mid = window.scrollY + window.innerHeight / 2;
			let best = 0;
			let bestD = Infinity;
			boundaries.forEach((b, i) => {
				const d = Math.abs(b - mid);
				if (d < bestD) {
					bestD = d;
					best = i;
				}
			});
			slot = best % 3;
			// fade in over the last ~60vh approaching a boundary, out after
			const span = window.innerHeight * 0.6;
			opacity = Math.max(0, 1 - bestD / span) * 0.5;
		}

		const onScroll = () => {
			if (!raf) raf = requestAnimationFrame(update);
		};

		measure();
		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', measure);
		// scene runways are static heights, but lazy content can nudge layout
		const ro = new ResizeObserver(measure);
		ro.observe(document.body);

		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', measure);
			ro.disconnect();
			if (raf) cancelAnimationFrame(raf);
		};
	});
</script>

<div
	class="motif no-print slot-{slot}"
	style:opacity
	style:background-image={grad(slot === 1 ? 180 : 90)}
	aria-hidden="true"
></div>

<style>
	.motif {
		position: fixed;
		z-index: 35;
		pointer-events: none;
		transition: opacity 0.25s linear;
	}

	.slot-0 {
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
	}

	.slot-1 {
		top: 0;
		bottom: 0;
		right: 0;
		width: 3px;
	}

	.slot-2 {
		bottom: 0;
		left: 0;
		right: 0;
		height: 3px;
	}
</style>
