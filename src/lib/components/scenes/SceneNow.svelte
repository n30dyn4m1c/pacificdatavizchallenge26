<script>
	/**
	 * Chapter 9 — now. The one chapter at monthly resolution, because the
	 * reader is standing inside the event: the recent see-saw month by month
	 * (the 2023–24 El Niño, the shallow double La Niña, the fast flip of
	 * 2026), then 2026 laid over the four great onsets, then the honest
	 * version of "what happens next" — an analogue estimate labelled as an
	 * estimate, checked against the official CPC/IRI outlook — and finally
	 * the calendar it implies. Data: static/data/scene_now.json (NOAA PSL
	 * Niño 3.4 monthly; all derived numbers computed in /prep).
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import ChapterHead from '$lib/components/ChapterHead.svelte';
	import LazyNow from '$lib/components/LazyNow.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import { cardIndex, clamp01 } from '$lib/scrolly.js';

	const N = 4;

	// per-card draw-in: mostly drawn when a card centers, completing just past it
	const local = (progress, idx) => clamp01((progress * N - idx) * 1.6 + 0.75);

	const fmt = (v) => (v == null ? '—' : (v > 0 ? '+' : '') + v.toFixed(2));

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
	no="Chapter nine · now"
	title="This time is <span class='hl hl-warm'>now</span>."
	standfirst="Every chapter so far reads the record backwards, one number a year. This one runs at one number a <em>month</em>, because the reader is standing inside the event: in mid&#8209;2026 the far ocean is warming fast, and the national declarations have already been made. The chart below is the only place this piece looks forward — and it says so, on the chart."
/>

<ScrollScene
	id="9-now"
	title="The 2026 El Niño, month by month, against its four precedents"
	heightVh={(N + 1) * 100}
	dataUrl="/data/scene_now.json"
>
	{#snippet prose({ data })}
		<h3>Where we are, in prose</h3>
		<p>
			At monthly resolution, the last three years show the whole see-saw: the 2023–24 El Niño
			peaking near +2 °C, a weak La Niña holding through 2024 and 2025, and then a fast reversal in
			early 2026 — from −0.27 °C in February to +1.44 °C by June. Laid over the four great El Niños
			of the record aligned by calendar month, June 2026 is warmer than 1982 (+0.53), 1997 (+1.09),
			2015 (+1.18) and 2023 (+0.84) stood at the same point in their onset years: this event is
			developing faster than any of its precedents. The months ahead are not yet measured, so the
			piece estimates them from precedent and labels the estimate: weighting the four events by how
			closely their January–June matched 2026's, the combined path peaks around +2.3 °C in November
			2026, inside an envelope of +1.9 to +2.7. The official mid-June outlook from NOAA's Climate
			Prediction Center and IRI reads the same way: El Niño is essentially certain to continue
			through the 2026–27 season, peaking in September–November, with about half the forecast
			models reaching "very strong". On the calendar that history and that outlook imply, the hard
			months — failing rain, falling rivers, frost-prone highland nights — run from now to about
			March 2027, and the swing back toward heavy rain on drought-bared slopes arrives around
			May–June 2027.
		</p>
		{#if data}
			<DataTable
				caption="Niño 3.4 monthly anomaly (°C) by event month: the four precedents, 2026 observed, and the analogue estimate"
				columns={['Month (2026 event)', '1982–83', '1997–98', '2015–16', '2023–24', '2026–27']}
				rows={tableRows(data)}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		{@const idx = cardIndex(progress, N)}
		<div class="graphic">
			<p class="graphic-title">
				NIÑO 3.4, MONTH BY MONTH · observations NOAA Physical Sciences Laboratory, through June
				2026 · the dashed path is an estimate
			</p>
			{#if data}
				<LazyNow
					{data}
					phase={idx}
					progress={local(progress, idx)}
					height={470}
					ariaLabel="Line chart of monthly Niño 3.4 sea-surface temperature anomalies. First the last three years as monthly bars: the 2023–24 El Niño, a weak double La Niña, then a fast rise through the first half of 2026 to +1.44 °C in June. Then the four great El Niños of 1982, 1997, 2015 and 2023 aligned by calendar month as gray lines, with 2026 so far as a red line above all of them at June. A shaded band and dashed line, labelled as an estimate, continue 2026 along the range of the four precedents to a peak of roughly +2.3 °C around November 2026, declining through mid-2027. Bracket annotations mark the hard months from June 2026 to March 2027 and the swing back to rain around May–June 2027."
				/>
			{/if}
		</div>
	{/snippet}

	{#snippet flow({ progress })}
		{@const idx = cardIndex(progress, N)}
		<div class="card-slot first" class:active={idx === 0}>
			<div class="step-card">
				<span class="card-kicker">The last three years, in months</span>
				<p>
					Zoom the see-saw in to monthly resolution and there is the whole story of the moment:
					the <span class="hl hl-warm">2023–24 El Niño</span>, a weak
					<span class="hl hl-cool">La Niña</span> holding through two years — and then, in early
					2026, the flip. February: −0.27&nbsp;°C. April: +0.29. June: <strong>+1.44 and
					climbing</strong>. The Papua New Guinea National Weather Service declared El Niño after
					its first advisory of 1 May 2026.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 1}>
			<div class="step-card">
				<span class="card-kicker">Against the four great onsets</span>
				<p>
					Lay 2026 over the four great El Niños, month for month. At June of the onset year, 1982
					stood at +0.53. 2023 at +0.84. 1997 — the drought that emptied the rivers — at +1.09.
					2015 at +1.18. <strong>2026 stands at +1.44, above all four.</strong> No El Niño in this
					56-year monthly record has come on this fast.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 2}>
			<div class="step-card">
				<span class="card-kicker">The months nobody has measured yet</span>
				<p>
					The rest of the red line does not exist — so this chart continues it the only honest
					way: along its four precedents, weighted by how closely each matched 2026 so far
					(1997 matches best). That path peaks near <strong>+2.3&nbsp;°C in November</strong>,
					inside the precedents’ +1.9-to-+2.7 range — <em>an estimate, drawn dashed</em>. The
					official outlook agrees: NOAA/IRI’s mid-June forecast has El Niño all but certain
					through the 2026–27 season, peaking September–November, with 13 of 24 models reaching
					“very strong”.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 3}>
			<div class="step-card">
				<span class="card-kicker">What the calendar says</span>
				<p>
					Read as a calendar, the estimate is a work plan. <span class="hl hl-warm">Now to about
					March 2027</span>: the hard months — failing rain, falling dams and rivers, cloudless
					frost nights above 2,200&nbsp;m. Water tanks, drought-hardy plantings and river-town
					stocks bought <em>now</em> still arrive in time. <span class="hl hl-cool">Around
					May–June 2027</span>: the swing back — and the record’s warning that the first heavy
					rain on drought-bared slopes brings floods and landslips of its own.
				</p>
			</div>
		</div>
	{/snippet}
</ScrollScene>
