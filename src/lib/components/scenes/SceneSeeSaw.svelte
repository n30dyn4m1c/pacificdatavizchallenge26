<script>
	/**
	 * Chapter 2 — the see-saw. The Oceanic Niño Index as a sticky bar chart;
	 * four step cards teach it: what the measurement is, what the tips mean
	 * (colors arrive), the four great El Niños (labels arrive), and the
	 * still-unwritten current season ("?"). Data: static/data/scene_reveal.json
	 * (SPC rainfall + the NOAA ONI companion; this chapter uses the ONI side).
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import ChapterHead from '$lib/components/ChapterHead.svelte';
	import Figure from '$lib/components/Figure.svelte';
	import LazyEnso from '$lib/components/LazyEnso.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import { cardIndex, sweep, runwayVh } from '$lib/scrolly.js';

	const N = 4;
	const GREATS = [1982, 1997, 2015, 2023];

	const figTitle = [
		'One number a year, for nearly half a century',
		'Up is El Niño. Down is La Niña.',
		'Four times, it tipped hard: 1982, 1997, 2015, 2023',
		'The newest season is still being written'
	];
	const phaseName = { elnino: 'El Niño', lanina: 'La Niña', neutral: 'neutral', pending: '—' };
</script>

<ChapterHead
	id="ch-2"
	no="Chapter two · the far ocean"
	title="The Pacific runs on a see&#8209;saw."
	standfirst="The temperature of the Niño&nbsp;3.4 rectangle, condensed to one number a year, is the Oceanic Niño Index. It is the simplest summary of PNG’s drought risk ever devised — here are nearly fifty years of it."
/>

<ScrollScene
	id="1-seesaw"
	title="The Oceanic Niño Index, 1979–2025"
	heightVh={runwayVh(N)}
	dataUrl="/data/scene_reveal.json"
>
	{#snippet prose({ data })}
		<h3>The see-saw, in prose</h3>
		<p>
			The Oceanic Niño Index tracks the sea-surface temperature of the Niño&nbsp;3.4 region in the
			central equatorial Pacific — far east of Papua New Guinea. Most years it sits near zero.
			Every few years it tips: upward is El Niño, when the Pacific's warm pool drains east away
			from Papua New Guinea; downward is La Niña, when warmth piles back west. The great El Niños
			of the record are 1982, 1997, 2015 and 2023. The chart's last season, 2025–26, is still an
			open question mark — CPC's table has yet to complete it. Naming what came after it, month
			by month, is what chapter nine is for. (The ONI is NOAA CPC data, the one series
			in this piece not from the SPC dataflow; see /prep.)
		</p>
		{#if data}
			<DataTable
				caption="ONI by year (peak of the season developing that year)"
				columns={['Year', 'ONI (°C)', 'Phase']}
				rows={data.years.map((d) => [d.year, d.oni ?? '—', phaseName[d.phase] ?? d.phase])}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		{@const idx = cardIndex(progress, N)}
		<Figure
			title={figTitle[idx]}
			subtitle="The Oceanic Niño Index — Niño&nbsp;3.4 sea-surface temperature anomaly (°C), one bar per year, 1979–2025"
			source="NOAA Climate Prediction Center"
		>
			{#snippet body({ h })}
				{#if data}
					<LazyEnso
						years={data.years}
						progress={sweep(progress, N)}
						colored={idx >= 1}
						marks={idx >= 2 && idx < 3 ? GREATS : []}
						height={h}
						ariaLabel="Bar chart of the Oceanic Niño Index from 1979 to 2025. Bars point up in El Niño years — sharply in 1982, 1997, 2015 and 2023 — and down in La Niña years. The 2025–26 season is not yet classified in the published table."
					/>
				{/if}
			{/snippet}
		</Figure>
	{/snippet}

	{#snippet flow({ progress })}
		{@const idx = cardIndex(progress, N)}
		<div class="card-slot first" class:active={idx === 0}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">1/4</span>
				<span class="card-kicker">The measurement</span>
				<p>
					One bar per year: how much warmer or cooler the
					<span class="hl hl-cool">Niño&nbsp;3.4 region</span> was than normal, since 1979.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 1}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">2/4</span>
				<span class="card-kicker">How to read it</span>
				<p>
					Most years sit near zero. When the index tips up —
					<span class="hl hl-warm">El Niño</span> — the Pacific’s warm water has moved east,
					away from Papua New Guinea, and PNG’s rain is at risk. Down is
					<span class="hl hl-cool">La Niña</span>: the warmth, and the rain, pile back west.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 2}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">3/4</span>
				<span class="card-kicker">The big ones</span>
				<p>
					<strong>1982. 1997. 2015. 2023.</strong> The four great El Niños of the modern
					record. Remember these years — the next chapter puts PNG’s rain underneath them.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 3}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">4/4</span>
				<span class="card-kicker">The last column</span>
				<p>
					The 2025–26 season is still a <strong>?</strong> on this yearly chart — CPC's
					table hasn't finished it. Naming what came next, month by month, is what
					chapter nine is for.
				</p>
			</div>
		</div>
	{/snippet}
</ScrollScene>
