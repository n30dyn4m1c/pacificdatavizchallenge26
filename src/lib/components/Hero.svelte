<script>
	/**
	 * Hero — the typographic opener. Warm paper, one huge headline with the
	 * piece's two meaning colors baked into it, and a quiet field of falling
	 * rain drawn in CSS (deterministic positions, no JS animation loop;
	 * removed entirely under prefers-reduced-motion).
	 */

	// deterministic drop field: pseudo-random from index, stable across builds
	const DROPS = Array.from({ length: 34 }, (_, i) => {
		const h = (i * 2654435761) % 1000;
		return {
			left: (i * 100) / 34 + (h % 20) / 10 - 1,
			delay: -((h % 700) / 100),
			dur: 2.6 + (h % 230) / 100,
			opacity: 0.12 + (h % 14) / 100,
			len: 14 + (h % 22)
		};
	});
</script>

<section class="hero" aria-label="The Ocean Knows First — title">
	<div class="rain no-print" aria-hidden="true">
		{#each DROPS as d, i (i)}
			<span
				class="drop"
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
		<span class="scroll-hint no-print" aria-hidden="true">scroll ↓</span>
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
		top: -40px;
		width: 2px;
		border-radius: 2px;
		background: var(--cool);
		animation-name: fall;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
	}

	@keyframes fall {
		to {
			transform: translateY(110vh);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.rain {
			display: none;
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

	h1 {
		font-size: clamp(3rem, 11vw, 7rem);
		margin: 0.35em 0 0.3em;
		text-wrap: balance;
	}

	.standfirst {
		font-size: clamp(1.05rem, 2.4vw, 1.3rem);
		color: var(--ink-light-secondary);
		max-width: 34em;
		text-wrap: pretty;
	}

	.byline {
		font-size: 0.8rem;
		color: var(--ink-light-muted);
		margin-top: 0.25rem;
	}

	.scroll-hint {
		margin-top: 2.25rem;
		font-size: 0.78rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--ink-light-muted);
		animation: bob 2.2s ease-in-out infinite;
	}

	@keyframes bob {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(8px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-hint {
			animation: none;
		}
	}
</style>
