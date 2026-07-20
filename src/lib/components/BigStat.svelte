<script>
	/**
	 * BigStat — a full-width resting interlude between chapters: one huge
	 * number and one line of caption. The pudding-style "let the stat land"
	 * beat; purely static, no interaction.
	 */
	import { reveal } from '$lib/reveal.js';

	let { kicker = '', stat, caption, accent = 'warm' } = $props();
</script>

<section class="bigstat" aria-label="{stat} — {caption}">
	{#if kicker}
		<p class="kicker" use:reveal>{kicker}</p>
	{/if}
	<p
		class="stat display reveal-pop"
		class:warm={accent === 'warm'}
		class:cool={accent === 'cool'}
		use:reveal={{ delay: 110 }}
	>
		{stat}
	</p>
	<p class="caption" use:reveal={{ delay: 260 }}>{caption}</p>
</section>

<style>
	.bigstat {
		min-height: 72vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 4rem 1.5rem;
		gap: 0.75rem;
	}

	.stat {
		font-size: clamp(4rem, 16vw, 10rem);
		line-height: 1;
		margin: 0;
		font-variant-numeric: tabular-nums;
	}

	.stat.warm {
		color: var(--warm);
	}

	.stat.cool {
		color: var(--cool);
	}

	.caption {
		font-size: clamp(1.05rem, 2.4vw, 1.35rem);
		font-family: Fraunces, Georgia, serif;
		font-weight: 700;
		max-width: 26em;
		text-wrap: balance;
		margin: 0;
	}
</style>
