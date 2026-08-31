<script>
	/**
	 * Chapter 3 — the rain follows. The mirror chart: Papua New Guinea's
	 * rainfall anomaly alone first, then the far ocean fades in above it, then
	 * the connectors on 1982/1997/2015 walk the eye from spike to shortfall.
	 * All statistics quoted are computed by /prep and shipped in the JSON.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import ChapterHead from '$lib/components/ChapterHead.svelte';
	import Figure from '$lib/components/Figure.svelte';
	import LazyMirror from '$lib/components/LazyMirror.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import { cardIndex, sweep, runwayVh } from '$lib/scrolly.js';

	const N = 4;

	const figTitle = [
		'Papua New Guinea’s rain, one year at a time',
		'The same years, with the far ocean on top',
		'Eight of the ten driest years were El Niño years',
		'When the far ocean warms, PNG’s rain fails'
	];
	const phaseName = { elnino: 'El Niño', lanina: 'La Niña', neutral: 'neutral', pending: '—' };
	const fmt = (v) => (v == null ? '—' : (v > 0 ? '+' : '') + v.toFixed(1));
</script>

<ChapterHead
	id="ch-3"
	no="Chapter three · the rain"
	title="When the far ocean tips, the rain follows."
	standfirst="Here is PNG’s own record: how much rain each year brought, above or below normal. Put it under the see&#8209;saw, and the connection is hard to miss."
/>

<ScrollScene
	id="2-signal"
	title="The Oceanic Niño Index over Papua New Guinea's rainfall anomaly, 1979–2025"
	heightVh={runwayVh(N)}
	dataUrl="/data/scene_reveal.json"
>
	{#snippet prose({ data })}
		<h3>The rain, in prose</h3>
		<p>
			The Pacific Community's rainfall-anomaly record for Papua New Guinea (annual, 1979–2025)
			mirrors the far ocean: when the Oceanic Niño Index spikes upward — El Niño — the rain at
			home collapses. Eight of the ten driest years in the record are El Niño years; the other
			two, 1992 and 1993, sit in the trailing warmth of the long 1991–92 event.
		</p>
		<p>
			Averaged across the record, El Niño years run −5.9 points against +3.8 points in all
			other years — a correlation of −0.64. Points, not millimetres: the dataflow publishes this
			series labelled “mm”, but at these magnitudes the values are a relative anomaly index
			around zero — Papua New Guinea’s rain runs to thousands of millimetres a year, so a true
			mm-scale national anomaly would read in hundreds. The relabelling changes no ranking and
			no correlation; the pattern is the point. And not every El Niño year is a drought year in
			every province — the monsoon and local geography modulate the rain — but every great El
			Niño on this record met a great shortfall.
		</p>
		<p>
			The great El Niños of chapter two — 1982, 1997, 2015 — are the great droughts of this
			chart.
		</p>
		{#if data}
			<DataTable
				caption="The ten driest years (1979–2025) by the SPC precipitation-anomaly series, and the state of the far ocean"
				columns={['Year', 'ENSO phase', 'Rainfall anomaly (index points)']}
				rows={data.driest10.map((d) => {
					const yr = data.years.find((y) => y.year === d.year);
					return [d.year, phaseName[d.phase] ?? d.phase, fmt(yr?.rain)];
				})}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		{@const idx = cardIndex(progress, N)}
		<Figure
			maxHeight={620}
			title={figTitle[idx]}
			subtitle="Papua New Guinea rainfall anomaly (index points) below; the Oceanic Niño Index (°C) above, same years, same axis"
			note="The dataflow publishes this series labelled “mm”; at these magnitudes the values are a relative anomaly index around zero, so the piece plots them as published and calls them index points."
			source="Rainfall: SPC climate-change indicators · ONI: NOAA CPC"
		>
			{#snippet body({ h })}
				{#if data}
					<LazyMirror
						years={data.years}
						showOni={idx >= 1}
						markYears={idx >= 2 ? [1982, 1997, 2015] : []}
						progress={sweep(progress, N)}
						mode="light"
						height={h}
						ariaLabel="Two mirrored bar charts sharing one time axis from 1979 to 2025: the Oceanic Niño Index above, Papua New Guinea's rainfall-anomaly index below. Beneath almost every El Niño spike — 1982, 1997, 2015 — the rainfall collapses."
					/>
				{/if}
			{/snippet}
		</Figure>
	{/snippet}

	{#snippet flow({ progress, data })}
		{@const idx = cardIndex(progress, N)}
		<div class="card-slot first" class:active={idx === 0}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">1/4</span>
				<span class="card-kicker">The home record</span>
				<p>
					PNG’s own rain, one bar per year, above or below its long-term normal.
					<span class="hl hl-warm">Dry years</span> point down;
					<span class="hl hl-cool">wet years</span> up.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 1}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">2/4</span>
				<span class="card-kicker">Now, together</span>
				<p>
					Add the far ocean above, same years. Find any El Niño spike — then look straight
					down at PNG’s rain in the same year.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 2}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">3/4</span>
				<span class="card-kicker">The pattern</span>
				<p>
					<strong>1982. 1997. 2015.</strong> Every big spike above meets a collapse below.
					<span class="hl hl-warm">Eight of the ten driest years</span> were El Niño years —
					and the other two came just after one.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 3}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">4/4</span>
				<span class="card-kicker">The rule</span>
				<p>
					In El Niño years PNG’s rain runs
					<strong>{data ? data.mean_rain_elnino : '−5.9'}&nbsp;points</strong> below normal, on
					average; in all other years,
					<strong>+{data ? data.mean_rain_other : '3.8'}&nbsp;points</strong> above it.
				</p>
				<p>Put simply: <strong>when the far ocean warms, store water.</strong></p>
			</div>
		</div>
	{/snippet}
</ScrollScene>
