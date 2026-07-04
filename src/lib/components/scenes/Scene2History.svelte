<script>
	/**
	 * Scene 2 — We've Been Here Before. Pinned ONI overlay chart: scrolling
	 * draws 1997–98 and 2015–16 as gray ghosts, then the current event in
	 * the accent color, overshooting both.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import OniChart from '$lib/components/OniChart.svelte';
	import DataTable from '$lib/components/DataTable.svelte';

	const captions = [
		{ at: [0.04, 0.32], text: 'My father remembers 1997 — the year the big river got so low the barges stopped, and the frost took the gardens at Tambul.' },
		{ at: [0.3, 0.58], text: '2015 again: the same shape, the same wait, the same hungry months. We have seen this curve twice in living memory.' },
		{ at: [0.56, 1], text: 'Now look at the red line. It is the same curve a third time — except this one is still climbing, and it is already ahead of both.' }
	];
</script>

<ScrollScene
	id="2-history"
	title="Past El Niño events compared with the current one"
	heightVh={340}
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
			<header>
				<p class="kicker">Oceanic Niño Index · three events, one curve</p>
				<h2 class="display">We’ve been here before.</h2>
			</header>
			{#if data}
				<OniChart
					events={data.events}
					{progress}
					mode="dark"
					ariaLabel="Line chart overlaying the Oceanic Niño Index of the 1997–98, 2015–16 and current El Niño events. The current event is forecast to peak above both."
				/>
			{/if}
			<div class="captions">
				{#each captions as c, i (i)}
					<p
						class="caption"
						style:opacity={progress >= c.at[0] && progress < c.at[1] ? 1 : 0}
					>
						{c.text}
					</p>
				{/each}
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

	h2.display {
		font-size: clamp(1.8rem, 5vw, 3rem);
	}

	.captions {
		position: relative;
		min-height: 4.5rem;
	}

	.caption {
		position: absolute;
		inset: 0;
		margin: 0 auto;
		max-width: 40em;
		color: var(--ink-dark-secondary);
		transition: opacity 0.35s;
		font-size: 0.95rem;
	}
</style>
