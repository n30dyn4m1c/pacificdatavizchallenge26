<script>
	/**
	 * Chapter 9 — now. The one chapter at monthly resolution, because the
	 * reader is standing inside the event: the recent see-saw month by month
	 * (the 2023–24 El Niño, the shallow double La Niña, the fast flip of
	 * 2026), then 2026 laid over the four great onsets, then the honest
	 * version of "what happens next" — an analogue estimate labelled as an
	 * estimate, checked against the official CPC/IRI outlook — then the
	 * chapter marks its own homework against the latest cited reading, and
	 * finally the calendar it implies. Data: static/data/scene_now.json
	 * (NOAA PSL Niño 3.4 monthly; all derived numbers computed in /prep).
	 *
	 * Every number in the copy below comes from `$lib/generated/now-copy.js`,
	 * which the pipeline writes. It is imported at build time rather than read
	 * from the lazily-fetched scene JSON so the sentences are complete in the
	 * prerendered HTML and without JavaScript — re-running the pipeline after
	 * NOAA appends a month updates the prose, the cards and the aria-label
	 * together, and nothing here has to be hand-edited.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import ChapterHead from '$lib/components/ChapterHead.svelte';
	import Figure from '$lib/components/Figure.svelte';
	import LazyNow from '$lib/components/LazyNow.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import { cardIndex, clamp01, runwayVh } from '$lib/scrolly.js';
	import { now } from '$lib/generated/now-copy.js';

	const N = 5;

	const figTitle = [
		'The last three years, month by month',
		`${now.latest.label}: ahead of all four great El Niños`,
		'What the record says happens next — an estimate',
		'That estimate has already been beaten',
		'The months to prepare for'
	];

	// per-card draw-in: mostly drawn when a card centers, completing just past it
	const local = (progress, idx) => clamp01((progress * N - idx) * 1.6 + 0.75);

	const fmt = (v) => (v == null ? '—' : (v > 0 ? '+' : '') + v.toFixed(2));

	// what each precedent is *for* in this piece — the one editorial thing the
	// pipeline can't generate, keyed so the standings order stays data-driven
	const GLOSS = {
		1982: '',
		1997: ' — the drought that emptied the rivers',
		2015: '',
		2023: ''
	};

	function tableRows(data) {
		const names = data.month_names;
		const onset = data.current.onset;
		const rows = [];
		for (let m = 0; m < data.span; m++) {
			const month = `${names[m % 12]} ${onset + Math.floor(m / 12)}`;
			const evs = data.events.map((ev) => fmt(ev.months.find((d) => d.m === m)?.anomaly));
			const cur = data.current.months.find((d) => d.m === m);
			const est = data.analogue.forecast.find((d) => d.m === m);
			rows.push([
				month,
				...evs,
				cur ? fmt(cur.anomaly) : est ? `${fmt(est.mean)} est. (${fmt(est.lo)}…${fmt(est.hi)})` : '—'
			]);
		}
		return rows;
	}
</script>

<ChapterHead
	id="ch-9"
	no="Chapter nine · now"
	title="This time is <span class='hl hl-warm'>now</span>."
	standfirst="Every chapter so far reads the past, one year at a time. This one runs month by month, because it is happening now: in the first half of 2026 the far ocean warmed faster than in any event on record, and by August the official outlook expected a <em>very strong</em> El&nbsp;Niño. The one chart here that looks ahead is labelled as an estimate — on the chart itself."
/>
<p class="ch9-dateline">Ocean data through {now.latest.label} · live coverage to {now.updated.label}</p>

<ScrollScene
	id="9-now"
	title="The 2026 El Niño, month by month, against its four precedents"
	heightVh={runwayVh(N)}
	dataUrl="/data/scene_now.json"
>
	{#snippet prose({ data })}
		<h3>Where we are, in prose</h3>
		<p>
			Month by month, the last three years hold the whole see-saw: the 2023–24 El Niño peaking
			near +2 °C, a weak La Niña through 2024 and 2025, then a fast reversal in early 2026 — from
			{now.flip[0].text} °C in {now.flip[0].month} to {now.latest.text} °C by {now.latest.month}.
			Laid over the {now.events} strongest El Niños of the record, 2026 at {now.anchorMonth} is
			warmer than {#each now.standings as s, i (s.onset)}{i > 0
					? i === now.standings.length - 1
						? ' and '
						: ', '
					: ''}{s.onset} ({s.text}){/each} were at the same point: this event is developing
			faster than any of its precedents. The months ahead are not yet measured, so the chart
			continues the 2026 line along the four precedents, weighting each by how closely its
			January–{now.anchorMonth} matched 2026's. That gives a peak around {now.estimate.text} °C
			in {now.estimate.month} 2026, inside a range of {now.estimate.loText} to
			{now.estimate.hiText} — an estimate, labelled as such.
		</p>
		<p>
			The estimate should be read as a floor, not a ceiling. The quoted weekly Niño 3.4 index
			for the {now.scoring.readingLabel} was about {now.scoring.readingText} °C — above anything
			the four precedents reached by that month. All {now.events} precedents were cooler than
			2026 at {now.anchorMonth}, which is why paths drawn from their own levels run low. Started
			from where 2026 actually is, the same {now.events} trajectories put {now.scoring.month} at
			{now.scoring.anchoredHereText} and peak near {now.anchored.text} °C. The official outlook
			agrees: as of early August 2026 an El Niño Advisory is in effect, continuation into early
			2027 is put at roughly 97 %, and a very strong peak (+2.0 °C or more) in late 2026 is the
			central expectation.
		</p>
		<p>
			On a calendar, that means the hard months — failing rain, falling rivers, frost-prone
			highland nights — run from now to about {now.calendar.hardestEnd}, which is also where
			Papua New Guinea's National Weather Service puts the end of the drought; on the faster
			reading they run to about {now.calendar.hardestEndAnchored}. The swing back to heavy rain
			arrives around {now.calendar.swingback}, and the first big rain on drought-bared slopes
			brings floods and landslides of its own.
		</p>
		{#if data}
			<DataTable
				caption="Niño 3.4 monthly anomaly (°C) by event month: the four precedents, 2026 observed, and the analogue estimate. The estimate reads as a floor — the quoted weekly index for the {now.scoring.readingLabel} (≈ {now.scoring.readingText} °C, a different product, not tabled here) already runs above it."
				columns={['Month (2026 event)', '1982–83', '1997–98', '2015–16', '2023–24', '2026–27']}
				rows={tableRows(data)}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		{@const idx = cardIndex(progress, N)}
		<Figure
			title={figTitle[idx]}
			subtitle="Niño&nbsp;3.4 anomaly (°C), month by month · observed to {now.latest.label}, plus one cited weekly reading"
			note="The dashed path and its band are an <strong>estimate</strong> built from the four precedents — not an observation, and not an official forecast. The ringed point is a <strong>quoted weekly index</strong>, a different product: marked, never joined to the line."
			source="NOAA Physical Sciences Laboratory · checked against the NOAA CPC / IRI outlook and the WMO update, early August 2026"
		>
			{#snippet body({ h })}
			{#if data}
				<LazyNow
					{data}
					phase={idx}
					progress={local(progress, idx)}
					height={h}
					ariaLabel="Line chart of monthly Niño 3.4 sea-surface temperature anomalies. First the last three years as monthly bars: the 2023–24 El Niño, a weak double La Niña, then a fast rise through the first half of 2026 to {now.latest
						.text} °C in {now.latest.month}. Then the {now.events} great El Niños of 1982, 1997, 2015 and 2023 aligned by calendar month as gray lines, with 2026 so far as a red line above all of them at {now
						.latest.month}. A ringed marker just beyond the end of that line carries the quoted weekly index for the {now
						.scoring.readingLabel} at about {now.scoring.readingText} °C, labelled as a cited weekly reading rather than part of the monthly series. A shaded band and dashed line, labelled as an estimate, continue 2026 along the range of the four precedents to a peak of roughly {now
						.estimate.text} °C around {now.estimate.label}, declining through mid-2027 — with the {now
						.scoring.month} weekly reading sitting above that band. A second, lighter dashed path then shows the same four trajectories started from 2026's own level, peaking near {now
						.anchored.text} °C. Bracket annotations mark the hard months from {now.latest
						.month} 2026 to {now.calendar.hardestEnd} and the swing back to rain around {now.calendar
						.swingback}."
				/>
			{/if}
			{/snippet}
		</Figure>
	{/snippet}

	{#snippet flow({ progress })}
		{@const idx = cardIndex(progress, N)}
		<div class="card-slot first" class:active={idx === 0}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">1/{N}</span>
				<span class="card-kicker">The flip</span>
				<p>
					Month by month, the last three years: the <span class="hl hl-warm">2023–24 El
					Niño</span>, a weak <span class="hl hl-cool">La Niña</span> through 2024–25 — then, in
					early 2026, a fast flip. {now.flip[0].month}: {now.flip[0].text}&nbsp;°C.
					{now.flip[1].month}: {now.flip[1].text}. {now.flip[2].month}:
					<strong>{now.flip[2].text} and climbing</strong>. PNG’s National Weather Service
					issued its first El Niño advisory on 1 May 2026.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 1}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">2/{N}</span>
				<span class="card-kicker">Faster than all four greats</span>
				<p>
					Lay 2026 over the {now.events} strongest El Niños, month for month. At
					{now.anchorMonth} of their first year, {#each now.standings as s, i (s.onset)}{i > 0
							? ' '
							: ''}{s.onset} stood at {s.text}{GLOSS[s.onset] ?? ''}.{/each}
					<strong>2026 stands at {now.latest.text} — above all four.</strong> No event in this
					{now.record.years}-year record has started this fast. The ringed marker by the
					line’s end is the quoted weekly reading for mid&#8209;{now.scoring.month}: about
					<strong>{now.scoring.readingText}&nbsp;°C</strong> — a different product from the
					monthly series, marked, never joined to the line.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 2}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">3/{N}</span>
				<span class="card-kicker">What happens next</span>
				<p>
					Nobody has measured the rest of 2026 — so the chart continues the red line along the
					only guide that exists: the {now.events} precedents. That path peaks near
					<strong>{now.estimate.text}&nbsp;°C around {now.estimate.month}</strong>, inside the
					precedents’ {now.estimate.loText}-to-{now.estimate.hiText} range. It is
					<em>an estimate, drawn dashed</em> — not an official forecast. The official outlook
					points the same way: a <span class="hl hl-warm">very strong</span> event (above
					+2.0&nbsp;°C) in late 2026, holding into early 2027.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 3}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">4/{N}</span>
				<span class="card-kicker">Already too low</span>
				<p>
					Treat that band as a <span class="hl hl-warm">floor, not a ceiling</span>.
					{now.scoring.month}’s weekly reading — about
					<strong>{now.scoring.readingText}&nbsp;°C</strong> — already sits above anything the
					four precedents reached by that month. Re-run the same four paths from 2026’s own
					level and they peak near <strong>{now.anchored.text}&nbsp;°C</strong> — the lighter
					dashed line. Plan for at least the precedents, and possibly more.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 4}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">5/{N}</span>
				<span class="card-kicker">The months to prepare for</span>
				<p>
					<span class="hl hl-warm">Now to about {now.calendar.hardestEnd}</span>: the hard
					months — failing rain, falling rivers and dams, frost nights above 2,200&nbsp;m. PNG’s
					weather service gives the same end date, and on the faster reading it runs to about
					{now.calendar.hardestEndAnchored}.
					<span class="hl hl-cool">Around {now.calendar.swingback}</span>: the rain returns —
					and the first heavy rain on drought-bared slopes brings floods and landslides.
					<strong>What to do in each of these windows is the last chapter.</strong>
				</p>
			</div>
		</div>
	{/snippet}
</ScrollScene>

<style>
	.ch9-dateline {
		max-width: 44rem;
		margin: -0.75rem auto 0;
		padding: 0 1.5rem;
		text-align: center;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-light-muted);
	}
</style>
