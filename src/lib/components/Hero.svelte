<script>
	/**
	 * Hero — the animated cover.
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

<style>
	.hero {
		position: relative;
		min-height: 100svh;
		display: grid;
		place-items: center;
		overflow: hidden;
		padding: 3rem 1.5rem;
		background: var(--ocean);
		color: var(--ink-dark-primary);
	}
	.scrim {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			radial-gradient(62% 52% at 50% 46%, color-mix(in srgb, var(--ocean) 62%, transparent), transparent 72%),
			linear-gradient(to bottom, color-mix(in srgb, var(--ocean) 45%, transparent), transparent 24% 76%, color-mix(in srgb, var(--ocean) 78%, transparent));
	}
	.rain { position: absolute; inset: 0; pointer-events: none; }
	.drop {
		position: absolute; top: -48px; border-radius: 2px; background: var(--drop-color);
		animation-name: fall; animation-timing-function: linear; animation-iteration-count: infinite;
	}
	.drop.far { width: 1.5px; }
	.drop.near { width: 2.5px; }
	.rain.dry { visibility: hidden; }
	.rain.dry .drop { animation-play-state: paused; }
	@keyframes fall { to { transform: translateY(110vh); } }
	.hero-inner {
		position: relative; max-width: 46rem; text-align: center;
		display: flex; flex-direction: column; align-items: center;
	}
	.hero-inner > * { animation: hero-up 0.9s cubic-bezier(0.16, 0.6, 0.24, 1) both; }
	.hero-mark { display: block; height: clamp(3.4rem, 7vw, 4.75rem); width: auto; margin-bottom: 1.15rem; opacity: 0.96; }
	.kicker { animation-delay: 0.05s; color: var(--ink-dark-secondary); opacity: 0.9; }
	.hero-inner > h1 { font-size: clamp(3rem, 11vw, 7rem); margin: 0.35em 0 0.3em; text-wrap: balance; animation-delay: 0.18s; }
	.standfirst { font-size: clamp(1.05rem, 2.4vw, 1.3rem); color: var(--ink-dark-secondary); max-width: 34em; text-wrap: pretty; animation-delay: 0.48s; }
	.byline {
		font-size: 0.8rem;
		color: var(--ink-dark-muted);
		margin-top: 0.35rem;
		margin-bottom: 0;
		max-width: 36em;
		text-wrap: balance;
		animation-delay: 0.64s;
	}
	/* the global `p { max-width: 36em }` is a reading measure — at this line's
	   0.72rem that is only 415px, which orphans "read" onto a second line on
	   every desktop. It is a one-line caption, not a paragraph: let it use the
	   column it is centred in, and balance the wrap where it still has to. */
	.meta {
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-dark-muted);
		margin: 0.9rem 0 0;
		max-width: none;
		text-wrap: balance;
		animation-delay: 0.76s;
	}
	@keyframes hero-up { from { opacity: 0; transform: translateY(26px); } }
	.hero .hl {
		padding: 0 0.08em;
		border-radius: 0.08em;
		font-weight: inherit;
		background-color: transparent;
		background-repeat: no-repeat;
		background-size: 0% 100%;
		animation: hl-wipe 0.7s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
	}
	.hero .hl-cool { background-image: linear-gradient(color-mix(in srgb, var(--hl-cool) 30%, transparent), color-mix(in srgb, var(--hl-cool) 30%, transparent)); animation-delay: 0.85s; }
	.hero .hl-warm { background-image: linear-gradient(color-mix(in srgb, var(--hl-warm) 32%, transparent), color-mix(in srgb, var(--hl-warm) 32%, transparent)); animation-delay: 1.1s; }
	@keyframes hl-wipe { to { background-size: 100% 100%; } }
	.hero-band { margin-top: 1.9rem; color: var(--ink-dark-muted); animation-delay: 0.85s; }
	.hero-band :global(svg) { width: min(26rem, 70vw); }
	.scroll-cue { margin-top: 2rem; display: flex; flex-direction: column; align-items: center; animation-delay: 1.25s; }
	.cue-line { position: relative; display: block; width: 1px; height: 2.6rem; background: color-mix(in srgb, currentColor 28%, transparent); overflow: hidden; }
	.cue-drop { position: absolute; left: -1.5px; top: -8px; width: 4px; height: 7px; border-radius: 2px; background: var(--drop-color); animation: cue-fall 1.9s cubic-bezier(0.45, 0, 0.6, 1) infinite; }
	@keyframes cue-fall {
		0% { transform: translateY(0); opacity: 0; }
		18% { opacity: 1; }
		78% { opacity: 1; }
		100% { transform: translateY(3.6rem); opacity: 0; }
	}
	.cover-chip {
		position: absolute; left: 1.25rem; bottom: 1.1rem; display: flex; align-items: center; gap: 0.45em;
		font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-dark-muted); margin: 0;
		animation: hero-up 0.9s cubic-bezier(0.16, 0.6, 0.24, 1) 1.4s both;
	}
	.chip-dot { width: 0.5em; height: 0.5em; border-radius: 50%; background: var(--hl-warm); flex: none; }
	@media (max-width: 40rem) {
		.cover-chip { left: 50%; transform: translateX(-50%); white-space: nowrap; }
	}
	@media (prefers-reduced-motion: reduce) {
		.rain { display: none; }
		.hero-inner > *, .cover-chip, .hero .hl { animation: none; }
		.hero .hl { background-size: 100% 100%; }
		.cue-drop { display: none; }
	}
	@media print {
		.hero { background: #fff; color: #1d1a14; min-height: auto; }
		.hero-mark { display: none; }
		.hero-inner > h1 { color: #1d1a14; }
		.kicker, .standfirst { color: #55503f; }
		.byline, .meta, .cover-chip { color: #8a8578; }
		.hero-band { color: #c9c0aa; }
	}
</style>
