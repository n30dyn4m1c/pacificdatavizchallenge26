<script>
	/**
	 * Act III — The alibi. The scatter that clears the obvious suspect: every
	 * year 1979–2025 plotted as its own local sea anomaly (x) against its own
	 * rainfall anomaly (y). If Papua New Guinea's warming sea took the rain,
	 * the driest years would sit in the warm-and-dry corner. They sit on the
	 * cool side — and the overall link runs the OTHER way (r = +0.48, computed
	 * in /prep from the SPC series): warm local years are wetter. Real SPC
	 * record (static/data/scene_alibi.json).
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SceneSteps from '$lib/components/SceneSteps.svelte';
	import LazyScatter from '$lib/components/LazyScatter.svelte';
	import TapReveal from '$lib/components/beats/TapReveal.svelte';
	import DataTable from '$lib/components/DataTable.svelte';

	const steps = [
		{ at: [0.03, 0.22], text: 'Put every year on trial: its own sea against its own rain.' },
		{ at: [0.22, 0.42], text: 'If the warm sea stole the rain, the dry years would sit in the warm corner.' },
		{ at: [0.42, 0.62], text: 'They don’t. Every driest year had a cool or ordinary sea.', sub: 'In 1997 — the driest year ever — the local sea ran −0.2 °C.' },
		{ at: [0.62, 0.82], text: 'If anything, the link runs the other way: warm local years are wetter.', sub: 'Correlation +0.48 — the wrong sign for a thief.' },
		{ at: [0.82, 1], text: 'Papua New Guinea’s own ocean has an alibi.', sub: 'Whatever takes the rain is not in this water.' }
	];

	const fmt = (v, p = 1) => (v > 0 ? '+' : '') + v.toFixed(p);
</script>

<ScrollScene
	id="3-alibi"
	title="The alibi — Papua New Guinea's local sea anomaly against its rainfall anomaly, year by year"
	heightVh={560}
	surface="dark"
	dataUrl="/data/scene_alibi.json"
>
	{#snippet prose({ data })}
		<h2>Exhibit C: the alibi</h2>
		<p>
			The obvious suspect, on trial. Each dot is one year, 1979–2025, placed by Papua New Guinea's
			own sea-surface anomaly that year (across) and its rainfall anomaly (up and down) — both from
			the same SPC record. If the warming local sea drove the droughts, the driest years would
			cluster where the sea is warm and the rain is short. Instead every one of the five driest
			years — 1997, 2015, 1993, 1982, 1992 — had a cool-or-ordinary local sea (in 1997, the driest
			year of all, it ran −0.2&nbsp;°C). Across all 47 years the correlation is <em>positive</em>,
			+0.48: warm local years tend to be wetter, not drier. The local ocean is cleared — and the
			clue is exactly that: when the rain goes, the warm water has gone somewhere too.
		</p>
		{#if data}
			<DataTable
				caption="The five driest years: local sea vs rainfall"
				columns={['Year', 'Local sea anomaly (°C)', 'Rainfall anomaly (mm)']}
				rows={data.driest_detail.map((d) => [d.year, fmt(d.sst), fmt(d.rain)])}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		<div class="wrap">
			<header>
				<p class="kicker">Papua New Guinea · each year: its own sea (x) against its own rain (y)</p>
				<h2 class="display">The alibi.</h2>
			</header>
			{#if data}
				<LazyScatter
					points={data.points}
					driest={data.driest}
					{progress}
					mode="dark"
					height={400}
					ariaLabel="Scatter plot of 47 years, each placed by Papua New Guinea's local sea-surface anomaly and its rainfall anomaly. The five driest years all sit on the cool side of the chart, not the warm side; overall, warmer local years are slightly wetter, correlation plus 0.48."
				/>
			{/if}
			<div class="steps-row">
				<SceneSteps {steps} {progress} width="32rem" />
				<div class="reveal-slot" class:hidden={progress <= 0.62} inert={progress <= 0.62}>
					<TapReveal id="alibi-warmwet" label="How can a warm sea mean more rain? →">
						<h3>The rain follows the warm water</h3>
						<p>
							Papua New Guinea sits in the western Pacific warm pool — some of the warmest ocean
							on Earth, and the engine of the towering rain clouds that water the country. A warm
							local year usually means the warm pool is sitting right where it belongs, overhead.
						</p>
						<p>
							So a cool local sea in a dry year is not a coincidence — it is the fingerprint of
							the warm pool having moved away, and the rain moving with it. The question the next
							scene answers: moved where?
						</p>
					</TapReveal>
				</div>
			</div>
		</div>
	{/snippet}
</ScrollScene>

<style>
	.wrap {
		height: 100%;
		max-width: 64rem;
		margin: 0 auto;
		padding: 1.5rem 1.25rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.75rem;
	}

	h2.display {
		font-size: clamp(1.8rem, 5vw, 3rem);
		margin-bottom: 0;
	}

	.steps-row {
		min-height: 6.5rem;
		display: flex;
		align-items: flex-start;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.reveal-slot {
		transition: opacity 0.4s;
	}

	.reveal-slot.hidden {
		opacity: 0;
		pointer-events: none;
	}
</style>
