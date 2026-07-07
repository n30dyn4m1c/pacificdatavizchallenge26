<script>
	/**
	 * Chapter 5 — down in the gardens. The national crop-yield record with
	 * the driest years marked, and the honest caveat: subsistence gardens sit
	 * off this ledger. The frost mechanism itself is taken apart in field
	 * note 02, just above this chapter.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import ChapterHead from '$lib/components/ChapterHead.svelte';
	import LazyLines from '$lib/components/LazyLines.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import { cardIndex, sweep } from '$lib/scrolly.js';

	const N = 4;
	const fmt0 = (v) => Math.round(v).toLocaleString('en');
</script>

<ChapterHead
	no="Chapter five · the gardens"
	title="What a dry year takes."
	standfirst="A shortfall on a rainfall chart is a shortfall in somebody’s garden. The national harvest record shows where the El&nbsp;Niño years landed — and hides where they landed hardest."
/>

<ScrollScene
	id="5-gardens"
	title="Papua New Guinea crop yield against its driest years, 1961–2024"
	heightVh={(N + 1) * 100}
	dataUrl="/data/scene_cost.json"
>
	{#snippet prose({ data })}
		<h3>The gardens, in prose</h3>
		<p>
			The Pacific Community's national crop-yield record for Papua New Guinea (1961–2024) climbs
			across the decades, and stumbles at the driest years — 1982, 1993, 1997 and 2015. The dips
			look modest, and that is itself a finding: most of the country's food grows in subsistence
			gardens a national yield-per-hectare figure barely sees, so the deepest losses sit off this
			ledger. 1997 was the hardest year of the record: drought in the lowlands and frost in the
			Highlands in the same season — the double mechanism the island chapter and its field notes
			describe — brought one of the country's worst food emergencies in living memory.
		</p>
		{#if data}
			<DataTable
				caption="Crop yield (kg/ha) in and around the driest years"
				columns={['Year', 'Crop yield (kg/ha)', 'Driest year?']}
				rows={data.crop.years
					.filter((d) => data.drought_years.some((y) => Math.abs(d.year - y) <= 1))
					.map((d) => [d.year, fmt0(d.value), data.drought_years.includes(d.year) ? 'yes' : ''])}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		{@const idx = cardIndex(progress, N)}
		<div class="graphic">
			<p class="graphic-title">
				NATIONAL CROP YIELD · kg per hectare, 1961–2024 · driest years marked
			</p>
			{#if data}
				<LazyLines
					series={[{ key: 'crop', name: 'Crop yield', accent: true, values: data.crop.years }]}
					markYears={idx >= 1 ? data.drought_years : []}
					progress={sweep(progress, N, 1.2)}
					mode="light"
					unit="kg/ha"
					height={430}
					baseline={null}
					ariaLabel="Line chart of Papua New Guinea national crop yield from 1961 to 2024, climbing overall and dipping around the four driest years, 1982, 1993, 1997 and 2015."
				/>
			{/if}
		</div>
	{/snippet}

	{#snippet flow({ progress })}
		{@const idx = cardIndex(progress, N)}
		<div class="card-slot first" class:active={idx === 0}>
			<div class="step-card">
				<span class="card-kicker">The harvest</span>
				<p>
					So what does a dry year take, in the official ledger? Here is the national harvest —
					crop yield, 1961 to 2024. Mostly it climbs: better seed, better roads, better prices.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 1}>
			<div class="step-card">
				<span class="card-kicker">Mark the dry years</span>
				<p>
					Now mark the four driest years: <strong>1982, 1993, 1997, 2015</strong>. The line
					stumbles at every one.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 2}>
			<div class="step-card">
				<span class="card-kicker">The honest caveat</span>
				<p>
					The dips look small. But most of Papua New Guinea’s food grows in
					<span class="hl hl-ink">subsistence gardens</span> that a national statistic barely
					sees — the hardest losses land off this chart, in exactly the villages the field notes
					described.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 3}>
			<div class="step-card">
				<span class="card-kicker">1997, twice over</span>
				<p>
					1997 hit twice in one season: <span class="hl hl-warm">drought</span> in the lowlands
					and <span class="hl hl-cool">frost</span> above the 2,200-metre line — the clear-night
					mechanism of field note 02. Gardens, and the cuttings to replant them, died together.
				</p>
			</div>
		</div>
	{/snippet}
</ScrollScene>
