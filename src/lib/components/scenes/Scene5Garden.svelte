<script>
	/**
	 * Scene 5 — One Garden. Human scale: largely typographic, with a canvas
	 * frost effect creeping over an illustrated kaukau mound. Ends with the
	 * two knowledge systems side by side, presented as equals.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import FrostCanvas from './FrostCanvas.svelte';
</script>

<ScrollScene
	id="5-garden"
	title="One garden — a frost night at 2,400 metres"
	heightVh={380}
	surface="light"
	dataUrl="/data/scene5_garden.json"
>
	{#snippet prose()}
		<h2>One garden</h2>
		<p>
			This is what the numbers land on: one mounded garden of kaukau at 2,400 metres. On a clear
			dry-season night under El Niño skies, the day’s heat escapes straight upward, and by 4 a.m.
			the leaves are stiff and silvered. One such night takes the leaves; three take the harvest.
			The people who garden here read the warning signs in fog, leaf and creek — and satellites
			read the same story from orbit. Neither list replaces the other; the calendar that works is
			built from both.
		</p>
	{/snippet}

	{#snippet children({ progress, active, data })}
		<div class="garden">
			<div class="phase mound-phase" style:opacity={progress < 0.72 ? 1 : 0}>
				<div class="copy">
					<p class="kicker">Above 2,200 metres · one night, one garden</p>
					<p class="lede">
						I planted this mound in March, when the ocean was already warm and the old people
						were already talking.
					</p>
					<p class="quiet" style:opacity={progress > 0.3 ? 1 : 0}>
						The sky stays clear. The heat leaves the ground at dusk.
					</p>
					<p class="quiet" style:opacity={progress > 0.5 ? 1 : 0}>
						By morning the vines are silver. One night. That is all frost needs.
					</p>
				</div>
				<div class="mound">
					<FrostCanvas {progress} {active} />
				</div>
			</div>

			{#if data}
				<div class="phase panel-phase" style:opacity={progress >= 0.72 ? 1 : 0}>
					<h2 class="display">Two ways of knowing. One warning.</h2>
					<div class="indicators">
						<div class="col-head">What the garden says</div>
						<div class="col-head">What the satellite says</div>
						{#each data.indicators as pair, i (i)}
							<div class="cell traditional">{pair.traditional}</div>
							<div class="cell satellite">{pair.satellite}</div>
						{/each}
					</div>
					<p class="equal-note">Presented as equals, because they are.</p>
				</div>
			{/if}
		</div>
	{/snippet}
</ScrollScene>

<style>
	.garden {
		position: relative;
		height: 100%;
		max-width: 68rem;
		margin: 0 auto;
		padding: 1.5rem;
	}

	.phase {
		position: absolute;
		inset: 1.5rem;
		transition: opacity 0.45s;
	}

	.mound-phase {
		display: grid;
		grid-template-columns: minmax(16rem, 1fr) minmax(0, 1.2fr);
		gap: 2rem;
		align-items: center;
	}

	.lede {
		font-family: Fraunces, Georgia, serif;
		font-size: clamp(1.3rem, 3vw, 2rem);
		line-height: 1.25;
	}

	.quiet {
		color: var(--ink-light-secondary);
		transition: opacity 0.5s;
	}

	.mound {
		height: min(52vh, 30rem);
	}

	.panel-phase {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1.25rem;
	}

	.panel-phase h2 {
		font-size: clamp(1.6rem, 4.5vw, 2.6rem);
	}

	.indicators {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1px;
		background: var(--ink-light-grid);
		border: 1px solid var(--ink-light-grid);
		border-radius: 8px;
		overflow: hidden;
	}

	.col-head {
		background: var(--paper);
		font-weight: 600;
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 0.7rem 0.9rem;
		color: var(--ink-light-secondary);
	}

	.cell {
		background: var(--paper-raised);
		padding: 0.8rem 0.9rem;
		font-size: 0.9rem;
	}

	.equal-note {
		font-size: 0.8rem;
		color: var(--ink-light-muted);
		font-style: italic;
	}

	@media (max-width: 700px) {
		.mound-phase {
			grid-template-columns: 1fr;
			gap: 0.5rem;
			align-content: start;
		}

		.mound {
			height: 36vh;
		}

		.indicators {
			font-size: 0.85rem;
		}
	}
</style>
