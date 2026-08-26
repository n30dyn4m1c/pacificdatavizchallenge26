<script>
	/**
	 * Chapter 7 — the ledger. Emissions per person as countable dots: the
	 * world's ≈6.6 t against Papua New Guinea's ≈1.2 t (SPC record). The one
	 * reference value not from the SPC dataflow (the world average, EDGAR
	 * 2023) is documented in /prep and named in the prose.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import ChapterHead from '$lib/components/ChapterHead.svelte';
	import DotUnits from '$lib/components/DotUnits.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import Figure from '$lib/components/Figure.svelte';
	import { cardIndex, runwayVh } from '$lib/scrolly.js';

	const N = 4;

	const figTitle = [
		'Count emissions the way you would count anything',
		'The world average: 6.6 tonnes per person per year',
		'Papua New Guinea: one tonne',
		'Almost none of the cause — all of the consequences'
	];
	const fmt2 = (v) => v.toFixed(2);
</script>

<ChapterHead
	id="ch-7"
	no="Chapter seven · the ledger"
	title="Papua New Guinea didn’t cause this."
	standfirst="The see&#8209;saw of El&nbsp;Niño is natural. The warming underneath it is not — and almost none of it is made in PNG."
/>

<ScrollScene
	id="5-ledger"
	title="Greenhouse-gas emissions per person: Papua New Guinea against the world average"
	heightVh={runwayVh(N)}
	dataUrl="/data/scene_gap.json"
>
	{#snippet prose({ data })}
		<h3>The ledger, in prose</h3>
		<p>
			In the Pacific Community's record, Papua New Guinea's greenhouse-gas emissions run between
			0.9 and 1.7 tonnes of CO₂-equivalent per person across 1970–2024, ending at 1.0 — flat
			for half a century. The world average is about 6.6 tonnes per person (EDGAR, 2023 — the one
			reference figure in this piece not from the SPC dataflow, documented in /prep). The warming
			that raises the sea and sharpens the droughts of the earlier chapters is overwhelmingly made
			elsewhere; the consequences are carried here.
		</p>
		{#if data}
			<DataTable
				caption="Emissions per person, selected years"
				columns={['Year', 'GHG per person (t CO₂e)']}
				rows={[1970, 1980, 1990, 2000, 2010, 2020, 2024].map((yr) => {
					const g = data.ghg.years.find((d) => d.year === yr);
					return [yr, g ? fmt2(g.value) : '—'];
				})}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		{@const idx = cardIndex(progress, N)}
		<Figure
			title={figTitle[idx]}
			subtitle="Greenhouse-gas emissions per person per year · one dot = 100&nbsp;kg of CO₂-equivalent"
			source="Papua New Guinea: SPC climate-change indicators · world average: EDGAR (EC-JRC), 2023"
		>
			{#snippet body({ h, w })}
				{#if data}
					<DotUnits
						world={{ value: data.world.value, label: 'World average (EDGAR, 2023)' }}
						png={{ value: data.latest.value, label: `Papua New Guinea (${data.latest.year})` }}
						state={idx}
						height={h}
						width={w}
						ariaLabel="Unit chart comparing yearly greenhouse-gas emissions per person: the world average of about 6.6 tonnes shown as 66 dots, against Papua New Guinea's {data.latest.value} tonne{data.latest.value === 1 ? '' : 's'} shown as {Math.round(data.latest.value * 10)} dots."
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
				<span class="card-kicker">Count it out</span>
				<p>
					One dot for every <strong>100&nbsp;kg</strong> of greenhouse gas emitted per person,
					per year.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 1}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">2/4</span>
				<span class="card-kicker">The world</span>
				<p>The world average: <strong>6.6 tonnes</strong> per person. Sixty-six dots.</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 2}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">3/4</span>
				<span class="card-kicker">Papua New Guinea</span>
				<p>
					Papua New Guinea: <span class="hl hl-ink">1 tonne</span>. Ten dots — and in fifty
					years of record, never more than 1.7.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 3}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">4/4</span>
				<span class="card-kicker">What it means</span>
				<p>
					The warming that sharpens PNG’s droughts is overwhelmingly made elsewhere, and PNG
					cannot wait for the rest of the world to fix it. What the country <em>can</em> do is
					be ready — and readiness starts with watching the signal. That is the next chapter.
				</p>
			</div>
		</div>
	{/snippet}
</ScrollScene>


