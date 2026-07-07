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
	import LazyEnso from '$lib/components/LazyEnso.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import { cardIndex, sweep } from '$lib/scrolly.js';

	const N = 4;
	const GREATS = [1982, 1997, 2015, 2023];
	const phaseName = { elnino: 'El Niño', lanina: 'La Niña', neutral: 'neutral', pending: '—' };
</script>

<ChapterHead
	no="Chapter two · the far ocean"
	title="The Pacific runs on a see&#8209;saw."
	standfirst="The dashed rectangle from chapter one is an instrument, and it has been read for decades. Its temperature, condensed to one number per season, is the Oceanic Niño Index — and the index has a see&#8209;saw in it."
/>

<ScrollScene
	id="1-seesaw"
	title="The Oceanic Niño Index, 1979–2025"
	heightVh={(N + 1) * 100}
	dataUrl="/data/scene_reveal.json"
>
	{#snippet prose({ data })}
		<h3>The see-saw, in prose</h3>
		<p>
			The Oceanic Niño Index tracks the sea-surface temperature of the Niño&nbsp;3.4 region in the
			central equatorial Pacific — far east of Papua New Guinea. Most years it sits near zero.
			Every few years it tips: upward is El Niño, when the Pacific's warm pool drains east away
			from Papua New Guinea; downward is La Niña, when warmth piles back west. The great El Niños
			of the record are 1982, 1997, 2015 and 2023. The season now forming is not yet classified —
			the chart's last column is an open question mark. (The ONI is NOAA CPC data, the one series
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
		<div class="graphic">
			<p class="graphic-title">
				THE OCEANIC NIÑO INDEX · one bar per year, 1979–2025 · NOAA Climate Prediction Center
			</p>
			{#if data}
				<LazyEnso
					years={data.years}
					progress={sweep(progress, N)}
					colored={idx >= 1}
					marks={idx >= 2 && idx < 3 ? GREATS : []}
					height={430}
					ariaLabel="Bar chart of the Oceanic Niño Index from 1979 to 2025. Bars point up in El Niño years — sharply in 1982, 1997, 2015 and 2023 — and down in La Niña years. The 2025 season is not yet classified."
				/>
			{/if}
		</div>
	{/snippet}

	{#snippet flow({ progress })}
		{@const idx = cardIndex(progress, N)}
		<div class="card-slot first" class:active={idx === 0}>
			<div class="step-card">
				<span class="card-kicker">The measurement</span>
				<p>
					Scientists log the temperature of the <span class="hl hl-cool">Niño&nbsp;3.4 region</span>
					season after season, year after year. Condensed to one bar per year, the record
					looks like this.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 1}>
			<div class="step-card">
				<span class="card-kicker">What the tips mean</span>
				<p>
					Most years it sits near zero. Every few years it tips — hard. Up is
					<span class="hl hl-warm">El Niño</span>: the Pacific’s warm water drains east,
					<em>away</em> from Papua New Guinea. Down is <span class="hl hl-cool">La Niña</span>:
					the warmth piles back west, overhead.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 2}>
			<div class="step-card">
				<span class="card-kicker">The big ones</span>
				<p>
					<strong>1982. 1997. 2015. 2023.</strong> The great El Niños of the modern record.
					The next chapter holds these same years against Papua New Guinea’s rain.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 3}>
			<div class="step-card">
				<span class="card-kicker">The last column</span>
				<p>
					And the season forming right now? Still a <strong>?</strong> — the ocean writes this
					chart one season at a time. Hold that thought for the end.
				</p>
			</div>
		</div>
	{/snippet}
</ScrollScene>
