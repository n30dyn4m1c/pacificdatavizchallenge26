<script>
	/**
	 * Scene 2 — We've Been Here Before. Pinned ONI overlay chart: scrolling
	 * draws 1997–98 and 2015–16 as gray ghosts, then the current event in
	 * the accent color, overshooting both. Part 2: step-paced narration
	 * (one idea per step) and an optional ghost-emphasis CompareToggle.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SceneSteps from '$lib/components/SceneSteps.svelte';
	import CompareToggle from '$lib/components/beats/CompareToggle.svelte';
	import OniChart from '$lib/components/OniChart.svelte';
	import DataTable from '$lib/components/DataTable.svelte';

	const steps = [
		{ at: [0.04, 0.16], text: 'My father remembers 1997.' },
		{ at: [0.16, 0.3], text: 'The big river fell until the barges stopped.', sub: 'The frost that year took the gardens at Tambul.' },
		{ at: [0.3, 0.44], text: '2015 traced the same shape.' },
		{ at: [0.44, 0.56], text: 'The same wait. The same hungry months.' },
		{ at: [0.56, 0.72], text: 'Now watch the red line.' },
		{ at: [0.72, 1], text: 'The same curve, a third time.', sub: 'And this one is still climbing — already ahead of both.' }
	];

	// ghost emphasis is optional enrichment; the base chart never depends on it
	let emphasis = $state('1997–98');
</script>

<ScrollScene
	id="2-history"
	title="Past El Niño events compared with the current one"
	heightVh={560}
	surface="dark"
	dataUrl="/data/scene2_oni_history.json"
>
	{#snippet prose({ data })}
		<h2>We’ve been here before</h2>
		<p>
			The Oceanic Niño Index traces of 1997–98 and 2015–16 — the two El Niño events that brought
			Papua New Guinea its worst droughts and frosts in living memory — rise, peak near the end
			of the calendar year, and decay by the following winter. The current event (synthetic
			placeholder data) follows the same track but is forecast to peak higher than both, at
			+2.8 °C in December 2026.
		</p>
		{#if data}
			<DataTable
				caption="Oceanic Niño Index by month for the three events"
				columns={['Month of event', ...data.events.map((e) => e.name)]}
				rows={data.events[0].series.map((d, i) => [
					d.month.split(' ')[0] + (i >= 12 ? ' (yr 2)' : ''),
					...data.events.map((e) => {
						const p = e.series[i];
						return p ? (p.oni > 0 ? '+' : '') + p.oni.toFixed(1) + (p.forecast ? ' f' : '') : '—';
					})
				])}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		<div class="wrap">
			<header class="head-row">
				<div>
					<p class="kicker">Oceanic Niño Index · three events, one curve</p>
					<h2 class="display">We’ve been here before.</h2>
				</div>
				{#if progress > 0.52}
					<div class="toggle-slot">
						<CompareToggle
							label="Compare a past event up close"
							options={[
								{ value: '1997–98', label: '1997–98' },
								{ value: '2015–16', label: '2015–16' }
							]}
							bind:value={emphasis}
						/>
					</div>
				{/if}
			</header>
			{#if data}
				<OniChart
					events={data.events}
					{progress}
					mode="dark"
					emphasis={progress > 0.52 ? emphasis : null}
					ariaLabel="Line chart overlaying the Oceanic Niño Index of the 1997–98, 2015–16 and current El Niño events. The current event is forecast to peak above both."
				/>
			{/if}
			<div class="steps-row">
				<SceneSteps {steps} {progress} width="34rem" />
			</div>
		</div>
	{/snippet}
</ScrollScene>

<style>
	.wrap {
		height: 100%;
		max-width: 62rem;
		margin: 0 auto;
		padding: 1.5rem 1.25rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.75rem;
	}

	.head-row {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	h2.display {
		font-size: clamp(1.8rem, 5vw, 3rem);
		margin-bottom: 0;
	}

	.steps-row {
		min-height: 6.5rem;
		display: flex;
		align-items: flex-start;
	}

	@media (max-width: 700px) {
		.toggle-slot {
			display: none; /* narrow screens: chart + steps first; table has the data */
		}
	}
</style>
