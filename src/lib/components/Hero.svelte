<script>
	/**
	 * Hero — the animated cover. A full-bleed Pacific at night (OceanCover,
	 * a living canvas whose horizon glow IS the latest Niño 3.4 anomaly)
	 * fills the viewport Medium-style; the title sits over it in warm
	 * white Fraunces on a quiet scrim, with the piece's two meaning colors
	 * wiped into the headline. A two-depth field of rain falls across the
	 * whole cover (deterministic positions, CSS-only; removed entirely
	 * under prefers-reduced-motion, where the canvas holds a still frame).
	 *
	 * The opening choreography is CSS-only: kicker → headline → highlight
	 * wipes → standfirst → byline → ONI band → scroll cue, each settling up
	 * into place once. The scroll cue is a single drop falling down a
	 * hairline — the story's first raindrop.
	 *
	 * And the rain is the first character: it falls while the cover fills
	 * the screen, thins as the reader scrolls (the canvas dimming with it),
	 * and has stopped entirely by the time the intro's first line lands.
	 * The drought, foreshadowed in the first ten seconds of scrolling —
	 * before a single chart or claim.
	 *
	 * The small caption bottom-left is the cover's provenance: the glow is
	 * not decoration, it is this month's number.
	 */
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import OniBand from '$lib/components/OniBand.svelte';
	import OceanCover from '$lib/components/OceanCover.svelte';
	import { impact } from '$lib/palette.js';
	import { now } from '$lib/generated/now-copy.js';

	const mkDrops = (n, seed, base) =>
		Array.from({ length: n }, (_, i) => {
			const h = ((i + seed) * 2654435761) % 1000;
			return {
				left: (i * 100) / n + (h % 20) / 10 - 1,
				delay: -((h % 700) / 100),
				dur: base.dur + (h % 230) / 100,
				opacity: base.op + (h % base.opJitter) / 100,
				len: base.len + (h % base.lenJitter)
			};
		});

	const FAR = mkDrops(30, 0, { dur: 3.4, op: 0.13, opJitter: 9, len: 12, lenJitter: 14 });
	const NEAR = mkDrops(14, 7, { dur: 2.1, op: 0.24, opJitter: 12, len: 24, lenJitter: 20 });

	let wet = $state(1);

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		let raf = 0;
		const update = () => {
			raf = 0;
			wet = Math.max(0, Math.min(1, 1 - window.scrollY / (window.innerHeight * 0.9)));
		};
		const onScroll = () => {
			if (!raf) raf = requestAnimationFrame(update);
		};
		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScroll);
			cancelAnimationFrame(raf);
		};
	});
</script>

<section
	class="hero"
	aria-label="The Ocean Knows First — title"
	style:--drop-color={impact.dark.frost}
	style:--hl-cool={impact.dark.frost}
	style:--hl-warm={impact.dark.drought}
>
	<OceanCover {wet} />
	<div class="scrim no-print" aria-hidden="true"></div>
	<div class="rain no-print" class:dry={wet <= 0} style:opacity={wet} aria-hidden="true">
		{#each FAR as d, i (i)}
			<span class="drop far" style:left="{d.left}%" style:animation-delay="{d.delay}s" style:animation-duration="{d.dur}s" style:opacity={d.opacity} style:height="{d.len}px"></span>
		{/each}
		{#each NEAR as d, i (i)}
			<span class="drop near" style:left="{d.left}%" style:animation-delay="{d.delay}s" style:animation-duration="{d.dur}s" style:opacity={d.opacity} style:height="{d.len}px"></span>
		{/each}
	</div>

	<div class="hero-inner">
		<img class="hero-mark" src="{base}/turtle-white.png" alt="" width="512" height="512" aria-hidden="true" />
		<p class="kicker">Pacific Dataviz Challenge 2026 · Papua New Guinea</p>
		<h1 class="display">
			The <span class="hl hl-cool">ocean</span> knows <span class="hl hl-warm">first</span>
		</h1>
		<p class="standfirst">
			Papua New Guinea’s worst droughts begin seven thousand kilometres away, in the temperature
			of the Pacific — months before the rain fails. In 2026 that ocean is warming fast. This is
			what El Niño does to PNG, and what to do about it.
		</p>
		<p class="byline">
			Neo Malesa · Port Moresby · official Pacific Community climate record, Pacific Data Hub
		</p>
		<p class="meta">Nine short chapters · about 12 minutes · scroll to read</p>
		<div class="hero-band" aria-hidden="true"><OniBand /></div>
		<div class="scroll-cue no-print" aria-hidden="true">
			<span class="cue-line"><span class="cue-drop"></span></span>
		</div>
	</div>

	<p class="cover-chip">
		<span class="chip-dot" aria-hidden="true"></span>Niño 3.4 anomaly {now.latest.text} °C · {now.latest.label}
	</p>
</section>
