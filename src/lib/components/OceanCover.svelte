<script>
	/**
	 * OceanCover — the hero's living cover: the Pacific at night, painted on
	 * a 2D canvas behind the title. The sea is not stock footage; it is the
	 * story's own number. The warm glow at the horizon is the LATEST Niño
	 * 3.4 anomaly (now.latest, the same generated copy chapter nine quotes),
	 * tinted through the piece's one palette via fieldColor() — the same
	 * blend the charts use — so a record-warm ocean literally glows warmer
	 * on the cover.
	 *
	 * Layers, back to front: night sky gradient (ocean → oceanRaised), the
	 * water mass below the horizon, the additive anomaly glow breathing on
	 * an ~8 s cycle, six interfering swell lines whose amplitude grows
	 * toward the viewer, and a soft warm streak reflected under the glow.
	 *
	 * Discipline: one rAF loop, running only while the cover is on screen,
	 * the tab is visible, wet > 0 (the reader hasn't scrolled past) and
	 * motion is allowed. prefers-reduced-motion gets a single painted
	 * frame — the same scene, held still. DPR is capped at 1.5; all colors
	 * come from /lib/palette.js.
	 */
	import { onMount } from 'svelte';
	import { surfaces, ink, fieldColor, ANOM_MAX } from '$lib/palette.js';
	import { now } from '$lib/generated/now-copy.js';
	import { ui } from '$lib/state.svelte.js';

	// 1 over the hero → 0 just past it (Hero owns the scroll math)
	let { wet = 1 } = $props();

	const ANOM = now.latest.anomaly; // °C, e.g. +1.73 in July 2026
	const HEAT = Math.max(0, Math.min(1, ANOM / ANOM_MAX)); // 0…1 warm share
	const GLOW = fieldColor(ANOM, 'dark'); // palette-true warm tint
	const COOL = fieldColor(-0.8, 'dark'); // faint cool arm for the far swell

	let canvas = $state(null);
	let visible = $state(true); // IntersectionObserver
	let dim = $derived(0.25 + 0.75 * wet); // fade as the reader scrolls away

	// hex → rgba() string for canvas paints
	const chan = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
	const rgba = (h, a) => `rgba(${chan(h).join(',')},${a})`;

	const SWELL = 6;

	function paint(ctx, w, h, t) {
		const hy = h * 0.6; // horizon

		// ── sky ──
		const sky = ctx.createLinearGradient(0, 0, 0, hy);
		sky.addColorStop(0, surfaces.ocean);
		sky.addColorStop(1, surfaces.oceanRaised);
		ctx.fillStyle = sky;
		ctx.fillRect(0, 0, w, hy + 1);

		// ── water mass ──
		const sea = ctx.createLinearGradient(0, hy, 0, h);
		sea.addColorStop(0, surfaces.oceanRaised);
		sea.addColorStop(1, surfaces.ocean);
		ctx.fillStyle = sea;
		ctx.fillRect(0, hy, w, h - hy);

		// ── anomaly glow: the warming ocean, breathing ──
		const breath = 0.85 + 0.15 * Math.sin(t * 0.0008);
		const gA = (0.1 + 0.3 * HEAT) * breath;
		const gr = Math.min(w, h) * 0.85;
		const glow = ctx.createRadialGradient(w / 2, hy, 0, w / 2, hy, gr);
		glow.addColorStop(0, rgba(GLOW, gA));
		glow.addColorStop(0.45, rgba(GLOW, gA * 0.35));
		glow.addColorStop(1, rgba(GLOW, 0));
		ctx.globalCompositeOperation = 'lighter';
		ctx.fillStyle = glow;
		ctx.fillRect(0, 0, w, h);

		// ── warm reflection streak under the glow ──
		const streak = ctx.createLinearGradient(0, hy, 0, hy + (h - hy) * 0.5);
		streak.addColorStop(0, rgba(GLOW, (0.1 + 0.08 * HEAT) * breath));
		streak.addColorStop(1, rgba(GLOW, 0));
		ctx.fillStyle = streak;
		ctx.fillRect(w * 0.32, hy, w * 0.36, (h - hy) * 0.5);
		ctx.globalCompositeOperation = 'source-over';

		// ── swell: six interfering lines, nearer = taller & stronger ──
		const scale = Math.max(0.6, Math.min(1.4, h / 900));
		for (let i = 0; i < SWELL; i++) {
			const f = (i + 0.5) / SWELL; // 0 at horizon → 1 at bottom edge
			const baseY = hy + f * (h - hy);
			const amp = (2 + i * 2.4) * scale;
			const a = 0.05 + f * 0.16;
			// each line: cool at the edges, warming toward the glow's center
			const stroke = ctx.createLinearGradient(0, 0, w, 0);
			stroke.addColorStop(0, rgba(COOL, a * 0.5));
			stroke.addColorStop(0.5, rgba(GLOW, a * (0.5 + 0.5 * HEAT)));
			stroke.addColorStop(1, rgba(COOL, a * 0.5));
			ctx.strokeStyle = stroke;
			ctx.lineWidth = 1 + f * 1.2;
			ctx.beginPath();
			const k1 = (2.2 + i * 0.7) * ((Math.PI * 2) / w);
			const k2 = (5.1 + i * 1.3) * ((Math.PI * 2) / w);
			const p1 = t * (0.00022 + i * 0.00005);
			const p2 = t * (0.00013 + i * 0.00004);
			const step = Math.max(4, w / 220);
			for (let x = -step; x <= w + step; x += step) {
				const y =
					baseY +
					amp * Math.sin(x * k1 + p1) +
					amp * 0.45 * Math.sin(x * k2 - p2 * 1.7);
				x <= 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
			}
			ctx.stroke();
		}

		// ── hairline horizon: the one sharp edge in the scene ──
		ctx.fillStyle = rgba(ink.dark.muted, 0.35);
		ctx.fillRect(0, hy, w, 1);
	}

	let kick = () => {}; // replaced on mount; watched-state changes re-arm it

	onMount(() => {
		const ctx = canvas.getContext('2d');
		let raf = 0;
		let w = 0;
		let h = 0;

		const running = () => wet > 0 && visible && !document.hidden && !ui.reducedMotion;

		const frame = (t) => {
			raf = 0;
			paint(ctx, w, h, t);
			if (running()) raf = requestAnimationFrame(frame);
		};

		kick = () => {
			if (running()) {
				if (!raf) raf = requestAnimationFrame(frame);
			} else if (ui.reducedMotion && w) {
				paint(ctx, w, h, 4000); // the same scene, held still
			}
		};

		const resize = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		resize();
		kick();

		const io = new IntersectionObserver(([e]) => {
			visible = e.isIntersecting;
			kick();
		});
		io.observe(canvas);

		const onResize = () => {
			resize();
			kick();
		};
		window.addEventListener('resize', onResize);
		document.addEventListener('visibilitychange', kick);
		return () => {
			kick = () => {};
			io.disconnect();
			window.removeEventListener('resize', onResize);
			document.removeEventListener('visibilitychange', kick);
			cancelAnimationFrame(raf);
		};
	});

	// scrolling back up, a visibility flip, or a motion-preference change
	// re-arms (or stills) the loop
	$effect(() => {
		wet;
		visible;
		ui.reducedMotion;
		kick();
	});
</script>

<canvas
	bind:this={canvas}
	class="ocean-cover no-print"
	style:opacity={dim}
	aria-hidden="true"
></canvas>

<style>
	.ocean-cover {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>
