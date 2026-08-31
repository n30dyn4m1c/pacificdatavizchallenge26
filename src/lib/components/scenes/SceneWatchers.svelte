<script>
	/**
	 * Chapter 8 — the watchers. The close: Papua New Guinea's meteorological
	 * monitoring network as a step chart (1 station in 1951 → 6 in 2026), and
	 * the payoff of the whole journey — a remote signal is an early one, if
	 * someone is watching.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import ChapterHead from '$lib/components/ChapterHead.svelte';
	import LazyLines from '$lib/components/LazyLines.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import Figure from '$lib/components/Figure.svelte';
	import { cardIndex, sweep, runwayVh } from '$lib/scrolly.js';

	const N = 4;

	const figTitle = [
		'In 1951 the country reported one weather station',
		'Today it reports six — and their records fill this piece',
		'A drought made far away can be seen coming',
		'In May 2026, the watchers called it'
	];
</script>

<ChapterHead
	id="ch-8"
	no="Chapter eight · the watchers"
	title="A signal is only a warning if someone reads it."
	standfirst="The last chart of the record isn’t a temperature. It’s attention — PNG’s meteorological monitoring network, one number a year, since 1951."
/>

<ScrollScene
	id="6-watchers"
	title="Papua New Guinea's meteorological monitoring network, 1951–2026"
	heightVh={runwayVh(N)}
	dataUrl="/data/scene_watch.json"
>
	{#snippet prose({ data })}
		<h3>The watchers, in prose</h3>
		<p>
			The Pacific Community's record of Papua New Guinea's meteorological monitoring network runs
			from 1951, when the country reported a single station, to 2026, when it reports six. Six is
			the SPC indicator's own count, not the whole national network: Papua New Guinea's full
			observing network — manual, automatic and aviation stations — has always been far larger,
			but few stations keep the continuous, climate-quality records this dataset runs on, and
			coverage stays sparse. It is the least dramatic series in the dataset and the most
			important: every chart in this piece exists because someone kept measuring. And because
			Papua New Guinea's droughts are made by a far ocean that tips months before the rain fails,
			watching is not bookkeeping — it is early warning. The ocean has already tipped: the
			warning is chapter nine, month by month. The one open line in this yearly record — the
			2025–26 season — is now classified too: a weak La Niña, peaking at −0.6, the last dip
			before the ocean tipped.
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
		<Figure
			title={figTitle[idx]}
			subtitle={idx === 3
				? 'Six climate-quality stations — and on 1 May 2026 this network issued the first warning, five months before the forecast peak'
				: 'Meteorological monitoring stations reported, 1951–2026'}
			source="SPC climate-change indicators (METEO_MONITOR_NET) · official Challenge dataset"
		>
			{#snippet body({ h })}
				{#if data}
					<LazyLines
						series={[{ key: 'met', name: 'Monitoring stations', values: data.stations.years }]}
						progress={sweep(progress, N, 1.2)}
						mode="light"
						unit=""
						baseline={0}
						curve="step"
						height={h}
						ariaLabel="Step chart of Papua New Guinea's meteorological monitoring network from 1951 to 2026, rising from one station to six."
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
				<span class="card-kicker">The last chart</span>
				<p>
					This one isn’t a temperature — it’s <em>who is watching</em>. In
					<strong>1951</strong>, Papua New Guinea reported exactly <strong>one</strong>
					meteorological monitoring station.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 1}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">2/4</span>
				<span class="card-kicker">Today</span>
				<p>
					Today it reports <strong>six</strong> — the long-record core of the network. Every
					chart in this piece exists because someone kept measuring.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 2}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">3/4</span>
				<span class="card-kicker">Why it matters</span>
				<p>
					PNG’s droughts are made by a <span class="hl hl-cool">far ocean</span> that tips
					<span class="hl hl-ink">months</span> before the rain fails. So watching is not
					bookkeeping — it is early warning: time to fill tanks, plant differently, move
					supplies.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 3}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">4/4</span>
				<span class="card-kicker">The payoff</span>
				<p>
					On <strong>1 May 2026</strong>, this network — with the ocean instruments behind it —
					issued the warning: El Niño, months before the expected peak. The next chapter is
					that warning, month by month.
				</p>
			</div>
		</div>
	{/snippet}
</ScrollScene>
