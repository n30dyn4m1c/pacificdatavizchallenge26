<script>
	/**
	 * Chapter 6 — the watchers. The close: Papua New Guinea's meteorological
	 * monitoring network as a step chart (1 station in 1951 → 6 in 2026), and
	 * the payoff of the whole journey — a remote signal is an early one, if
	 * someone is watching.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import ChapterHead from '$lib/components/ChapterHead.svelte';
	import LazyLines from '$lib/components/LazyLines.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import { cardIndex, sweep } from '$lib/scrolly.js';

	const N = 4;
</script>

<ChapterHead
	no="Chapter six · the watchers"
	title="A signal is only a warning if someone reads it."
	standfirst="The last chart isn’t a temperature. It’s attention — measured in monitoring stations, one number a year, since 1951."
/>

<ScrollScene
	id="6-watchers"
	title="Papua New Guinea's meteorological monitoring network, 1951–2026"
	heightVh={(N + 1) * 100}
	dataUrl="/data/scene_watch.json"
>
	{#snippet prose({ data })}
		<h3>The watchers, in prose</h3>
		<p>
			The Pacific Community's record of Papua New Guinea's meteorological monitoring network runs
			from 1951, when the country reported a single station, to 2026, when it reports six. It is
			the least dramatic series in the dataset and the most important: every chart in this piece
			exists because someone kept measuring. And because Papua New Guinea's droughts are made by
			a far ocean that tips months before the rain fails, watching is not bookkeeping — it is
			early warning. The current ENSO season is still unclassified; when it tips, the ocean will
			say so first, and this time someone is listening.
		</p>
		{#if data}
			<DataTable
				caption="Meteorological monitoring stations, selected years"
				columns={['Year', 'Stations']}
				rows={[1951, 1970, 1990, 2000, 2010, 2020, 2026].map((yr) => {
					const s = data.stations.years.find((d) => d.year === yr);
					return [yr, s ? s.value : '—'];
				})}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		{@const idx = cardIndex(progress, N)}
		<div class="graphic">
			<p class="graphic-title">
				METEOROLOGICAL MONITORING NETWORK · stations reported per year, 1951–2026
			</p>
			{#if data}
				<LazyLines
					series={[{ key: 'met', name: 'Monitoring stations', accent: true, values: data.stations.years }]}
					progress={sweep(progress, N, 1.2)}
					mode="light"
					unit=""
					baseline={0}
					curve="step"
					height={400}
					ariaLabel="Step chart of Papua New Guinea's meteorological monitoring network from 1951 to 2026, rising from one station to six."
				/>
			{/if}
		</div>
	{/snippet}

	{#snippet flow({ progress })}
		{@const idx = cardIndex(progress, N)}
		<div class="card-slot first" class:active={idx === 0}>
			<div class="step-card">
				<span class="card-kicker">The last chart</span>
				<p>
					It isn’t a temperature — it’s <em>who’s watching</em>. In <strong>1951</strong>, Papua
					New Guinea reported exactly <strong>one</strong> meteorological monitoring station.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 1}>
			<div class="step-card">
				<span class="card-kicker">Today</span>
				<p>
					Today it reports <strong>six</strong> — and the record those stations and their
					partners keep is every chart you just read.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 2}>
			<div class="step-card">
				<span class="card-kicker">Why it matters</span>
				<p>
					Because the drought-maker is a <span class="hl hl-cool">far ocean</span>, it tips its
					hand <span class="hl hl-ink">months</span> before the rain fails at home. A signal read
					early is a harvest saved, a tank filled, a warning sent up a valley in time.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 3}>
			<div class="step-card">
				<span class="card-kicker">The open column</span>
				<p>
					Remember the see-saw’s last column — still a <strong>?</strong>. When it tips, the
					ocean will say so first. This time, someone is listening.
				</p>
			</div>
		</div>
	{/snippet}
</ScrollScene>
