<script>
	/**
	 * Hero — the typographic opener. Warm paper, one huge headline with the
	 * piece's two meaning colors baked into it, and a quiet two-depth field of
	 * falling rain drawn in CSS (deterministic positions, no JS animation
	 * loop; removed entirely under prefers-reduced-motion).
	 *
	 * The opening choreography is CSS-only: kicker → headline → highlight
	 * wipes → standfirst → byline → ONI band → scroll cue, each settling up
	 * into place once. The scroll cue is a single drop falling down a
	 * hairline — the story's first raindrop.
	 */
	import OniBand from '$lib/components/OniBand.svelte';

	// deterministic drop fields: pseudo-random from index, stable across builds.
	// FAR drops are thin, slow and faint (depth); NEAR drops are wider, faster
	// and slightly stronger, so the field reads as rain, not specks.
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

	const FAR = mkDrops(30, 0, { dur: 3.4, op: 0.09, opJitter: 9, len: 12, lenJitter: 14 });
	const NEAR = mkDrops(14, 7, { dur: 2.1, op: 0.18, opJitter: 12, len: 24, lenJitter: 20 });
</script>

<section class="hero" aria-label="The Ocean Knows First — title">
	<div class="rain no-print" aria-hidden="true">
		{#each FAR as d, i (i)}
			<span
				class="drop far"
				style:left="{d.left}%"
				style:animation-delay="{d.delay}s"
				style:animation-duration="{d.dur}s"
				style:opacity={d.opacity}
				style:height="{d.len}px"
			></span>
		{/each}
		{#each NEAR as d, i (i)}
			<span
				class="drop near"
				style:left="{d.left}%"
				style:animation-delay="{d.delay}s"
				style:animation-duration="{d.dur}s"
				style:opacity={d.opacity}
				style:height="{d.len}px"
			></span>
		{/each}
	</div>

	<div class="hero-inner">
		<p class="kicker">Pacific Data Viz Challenge 2026 · Papua New Guinea</p>
		<h1 class="display">
			The <span class="hl hl-cool">ocean</span> knows <span class="hl hl-warm">first</span>
		</h1>
		<p class="standfirst">
			Papua New Guinea’s worst droughts don’t start in its own sky — they start in the temperature
			of seawater seven thousand kilometres east, months earlier. A journey through 176 years of
			the official Pacific climate record, from the far ocean down to a highland garden.
		</p>
		<p class="byline">
			Built on the Pacific Community’s climate-change indicators · Pacific Data Hub
		</p>
		<div class="hero-band" aria-hidden="true"><OniBand /></div>
		<div class="scroll-cue no-print" aria-hidden="true">
			<span class="cue-label">scroll</span>
			<span class="cue-line"><span class="cue-drop"></span></span>
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		min-height: 100svh;
		display: grid;
		place-items: center;
		overflow: hidden;
		padding: 3rem 1.5rem;
	}

	.rain {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.drop {
		position: absolute;
		top: -48px;
		border-radius: 2px;
		background: var(--cool);
		animation-name: fall;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
	}

	.drop.far {
		width: 1.5px;
	}

	.drop.near {
		width: 2.5px;
	}

	@keyframes fall {
		to {
			transform: translateY(110vh);
		}
	}

	.hero-inner {
		position: relative;
		max-width: 46rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* opening choreography: each block settles up into place, once */
	.hero-inner > * {
		animation: hero-up 0.9s cubic-bezier(0.16, 0.6, 0.24, 1) both;
	}

	.kicker {
		animation-delay: 0.05s;
	}

	.hero-inner > h1 {
		font-size: clamp(3rem, 11vw, 7rem);
		margin: 0.35em 0 0.3em;
		text-wrap: balance;
		animation-delay: 0.18s;
	}

	.standfirst {
		font-size: clamp(1.05rem, 2.4vw, 1.3rem);
		color: var(--ink-light-secondary);
		max-width: 34em;
		text-wrap: pretty;
		animation-delay: 0.48s;
	}

	.byline {
		font-size: 0.8rem;
		color: var(--ink-light-muted);
		margin-top: 0.25rem;
		animation-delay: 0.64s;
	}

	@keyframes hero-up {
		from {
			opacity: 0;
			transform: translateY(26px);
		}
	}

	/* the headline highlights wipe in after the type has landed */
	.hero .hl {
		background-color: transparent;
		background-repeat: no-repeat;
		background-size: 0% 100%;
		animation: hl-wipe 0.7s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
	}

	.hero .hl-cool {
		background-image: linear-gradient(
			color-mix(in srgb, var(--cool) 18%, transparent),
			color-mix(in srgb, var(--cool) 18%, transparent)
		);
		animation-delay: 0.85s;
	}

	.hero .hl-warm {
		background-image: linear-gradient(
			color-mix(in srgb, var(--warm) 20%, transparent),
			color-mix(in srgb, var(--warm) 20%, transparent)
		);
		animation-delay: 1.1s;
	}

	@keyframes hl-wipe {
		to {
			background-size: 100% 100%;
		}
	}

	/* the signature data-mark, faint, under the byline */
	.hero-band {
		margin-top: 1.9rem;
		color: var(--ink-light-axis);
		animation-delay: 0.85s;
	}

	.hero-band :global(svg) {
		width: min(26rem, 70vw);
	}

	/* scroll cue: one drop falling down a hairline */
	.scroll-cue {
		margin-top: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		animation-delay: 1.25s;
	}

	.cue-label {
		font-size: 0.72rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--ink-light-muted);
	}

	.cue-line {
		position: relative;
		display: block;
		width: 1px;
		height: 2.6rem;
		margin-top: 0.55rem;
		background: color-mix(in srgb, currentColor 28%, transparent);
		overflow: hidden;
	}

	.cue-drop {
		position: absolute;
		left: -1.5px;
		top: -8px;
		width: 4px;
		height: 7px;
		border-radius: 2px;
		background: var(--cool);
		animation: cue-fall 1.9s cubic-bezier(0.45, 0, 0.6, 1) infinite;
	}

	@keyframes cue-fall {
		0% {
			transform: translateY(0);
			opacity: 0;
		}
		18% {
			opacity: 1;
		}
		78% {
			opacity: 1;
		}
		100% {
			transform: translateY(3.6rem);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.rain {
			display: none;
		}

		.hero-inner > *,
		.hero .hl {
			animation: none;
		}

		.hero .hl {
			background-size: 100% 100%;
		}

		.cue-drop {
			display: none;
		}
	}
</style>
