<script>
	/**
	 * Scene 7 — The Calendar. The payoff: an interactive anticipatory-action
	 * calendar. Part 2: the province selector is a tappable mini-map (the
	 * same provinces file scene 6 draws) with a dropdown fallback; selecting
	 * a month highlights its trigger and draws a thin line back to the ONI
	 * threshold it references on a small rail. Scroll-only readers see the
	 * first province's full calendar; print gets one clean page.
	 */
	import { base } from '$app/paths';
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import { ui, lag } from '$lib/state.svelte.js';

	let selected = $state(0);
	let selectedAction = $state(null);

	let geo = $state(null);
	async function onData() {
		if (geo) return;
		try {
			geo = await (await fetch(`${base}/data/png_provinces.json`)).json();
		} catch {
			geo = { features: [] };
		}
	}

	// the calendar takes over as the time object: dismiss the lag ticker
	function onProgress(_p, active) {
		if (active) lag.dismissed = true;
	}

	// same equirectangular-ish projection as scene 6
	const K = 72;
	const px = (lon) => (lon - 140.6) * K;
	const py = (lat) => (-4.3 - lat) * K;
	const ringPath = (f) =>
		f.geometry.coordinates[0]
			.map(([lon, lat], i) => `${i ? 'L' : 'M'}${px(lon).toFixed(1)} ${py(lat).toFixed(1)}`)
			.join(' ') + ' Z';

	function pickProvince(data, name) {
		const i = data.provinces.findIndex((p) => p.name === name);
		if (i !== -1) {
			selected = i;
			selectedAction = null;
			line = null;
		}
	}

	// ── trigger → ONI-threshold connecting line ─────────────────────────
	const RAIL_MAX = 3;
	let wrapEl = $state(null);
	let line = $state(null);
	let wrapH = $state(0);
	let wrapW = $state(0);

	function railMarks(prov) {
		return [...new Set(prov.actions.map((a) => a.oni_threshold).filter((t) => t != null))];
	}

	function drawLine(data) {
		if (selectedAction == null || !wrapEl || !data) {
			line = null;
			return;
		}
		const act = data.provinces[selected].actions[selectedAction];
		const from = wrapEl.querySelector(`[data-action-idx="${selectedAction}"] .trigger`);
		const to =
			act.oni_threshold != null
				? wrapEl.querySelector(`[data-thresh="${act.oni_threshold}"]`)
				: null;
		if (!from || !to) {
			line = null;
			return;
		}
		const wr = wrapEl.getBoundingClientRect();
		const fr = from.getBoundingClientRect();
		const tr = to.getBoundingClientRect();
		wrapW = wr.width;
		wrapH = wr.height;
		line = {
			x1: fr.left - wr.left + 14,
			y1: fr.top - wr.top + fr.height / 2,
			x2: tr.left - wr.left + tr.width / 2,
			y2: tr.bottom - wr.top + 2
		};
	}

	function toggleAction(data, i) {
		selectedAction = selectedAction === i ? null : i;
		// measured after this tick's DOM update by the $effect below
	}

	let dataRef = $state(null);
	$effect(() => {
		void selected;
		void selectedAction;
		drawLine(dataRef);
	});
</script>

<svelte:window onresize={() => drawLine(dataRef)} />

<ScrollScene
	id="7-calendar"
	title="Anticipatory-action calendar by province"
	surface="light"
	pin={false}
	printable={true}
	dataUrl="/data/scene7_calendar.json"
	ondata={(d) => {
		dataRef = d;
		onData();
	}}
	onprogress={onProgress}
>
	{#snippet prose()}
		<h2>The calendar</h2>
		<p>
			Everything above exists for this page. Because the ocean signals months ahead, each
			province can hold a calendar of actions with explicit triggers: not “respond to the
			disaster” but “when the index crosses this line, do this, and this agency leads.” Choose a
			province, read its months, print it, and put it on the wall of the provincial disaster
			office. (Placeholder actions — to be co-drafted with the National Disaster Centre and
			provincial Divisions of Agriculture and Livestock.)
		</p>
	{/snippet}

	{#snippet children({ data })}
		<div class="calendar">
			<header class="cal-head">
				<p class="kicker">The payoff · a tool, not a chart</p>
				<h2 class="display">The calendar was printed<br />before the disaster.</h2>
				<p class="cal-intro no-print">
					The months between signal and consequence are working months. Pick a province — each
					action is tied to a trigger you can verify and an agency that leads.
				</p>
			</header>

			{#if data}
				{@const prov = data.provinces[selected]}
				{@const marks = railMarks(prov)}

				{#if !ui.noTap}
					<div class="selector no-print">
						{#if geo}
							<svg
								viewBox="-6 -6 560 400"
								class="mini-map"
								role="radiogroup"
								aria-label="Choose a province from the map"
							>
								{#each geo.features as f (f.properties.name)}
									{@const idx = data.provinces.findIndex((p) => p.name === f.properties.name)}
									{@const hasCal = idx !== -1}
									{#if hasCal}
										<path
											d={ringPath(f)}
											class="prov has-cal"
											class:on={idx === selected}
											role="radio"
											aria-checked={idx === selected}
											aria-label={f.properties.name}
											tabindex="0"
											onclick={() => pickProvince(data, f.properties.name)}
											onkeydown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault();
													pickProvince(data, f.properties.name);
												}
											}}
										/>
									{:else}
										<!-- provinces without a drafted calendar stay visible but dim -->
										<path d={ringPath(f)} class="prov" aria-hidden="true" />
									{/if}
									{#if hasCal}
										{@const c = f.geometry.coordinates[0]}
										{@const cx = c.reduce((s, p) => s + px(p[0]), 0) / c.length}
										{@const cy = c.reduce((s, p) => s + py(p[1]), 0) / c.length}
										<text x={cx} y={cy} text-anchor="middle" class="prov-label" aria-hidden="true">
											{f.properties.name}
										</text>
									{/if}
								{/each}
							</svg>
						{/if}
						<label class="select-fallback">
							<span>Province</span>
							<select
								class="beat-focus"
								value={prov.name}
								onchange={(e) => pickProvince(data, e.currentTarget.value)}
							>
								{#each data.provinces as p (p.name)}
									<option value={p.name}>{p.name}</option>
								{/each}
							</select>
						</label>
					</div>
				{/if}

				<section class="grid-wrap" aria-label="Actions for {prov.name}" bind:this={wrapEl}>
					<h3 class="prov-title display">
						{prov.name}
						<span>· anticipatory-action calendar · strong El Niño 2026–27</span>
					</h3>

					{#if !ui.noTap && marks.length}
						<!-- the ONI rail: the thresholds these triggers reference -->
						<div class="rail no-print" aria-hidden="true">
							<span class="rail-title">ONI °C</span>
							<div class="rail-bar">
								{#each [0, 0.5, 1, 1.5, 2, 2.5, 3] as t (t)}
									<span class="rail-tick" style:left="{(t / RAIL_MAX) * 100}%">
										<i></i>{t % 1 === 0 ? (t > 0 ? '+' + t : t) : ''}
									</span>
								{/each}
								{#each marks as t (t)}
									<span
										class="rail-mark"
										class:lit={selectedAction != null &&
											prov.actions[selectedAction]?.oni_threshold === t}
										style:left="{(t / RAIL_MAX) * 100}%"
										data-thresh={t}
									>
										+{t}
									</span>
								{/each}
							</div>
						</div>
					{/if}

					<div class="action-grid">
						{#each prov.actions as a, i (a.month + a.action)}
							{#if ui.noTap}
								<article class="action">
									<div class="month display">{a.month}</div>
									<div class="body">
										<p class="what">{a.action}</p>
										<p class="trigger"><span class="t-label">trigger</span> {a.trigger}</p>
										<p class="agency">{a.lead_agency}</p>
									</div>
								</article>
							{:else}
								<button
									class="action selectable beat-focus"
									class:on={selectedAction === i}
									data-action-idx={i}
									aria-pressed={selectedAction === i}
									onclick={() => toggleAction(data, i)}
								>
									<div class="month display">{a.month}</div>
									<div class="body">
										<p class="what">{a.action}</p>
										<p class="trigger"><span class="t-label">trigger</span> {a.trigger}</p>
										<p class="agency">{a.lead_agency}</p>
									</div>
								</button>
							{/if}
						{/each}
					</div>

					{#if line}
						<svg
							class="link-line no-print"
							width={wrapW}
							height={wrapH}
							viewBox="0 0 {wrapW} {wrapH}"
							aria-hidden="true"
						>
							<path
								d="M {line.x1} {line.y1} C {line.x1 - 34} {line.y1}, {line.x2} {line.y2 + 40}, {line.x2} {line.y2}"
								fill="none"
								stroke="var(--accent-light)"
								stroke-width="1.5"
								stroke-dasharray="4 4"
							/>
							<circle cx={line.x2} cy={line.y2} r="3" fill="var(--accent-light)" />
						</svg>
					{/if}
				</section>

				{#if !ui.noTap}
					<div class="print-row no-print">
						<button class="print-btn" onclick={() => window.print()}>
							Print this province’s calendar
						</button>
						<span class="print-note">prints to a single clean page</span>
					</div>
				{/if}
			{/if}

			<footer class="cal-foot">
				<p>
					Placeholder data · Pacific Data Viz Challenge 2026 entry · sources and the real data
					pipeline are documented in the repository’s <code>/prep</code> directory.
				</p>
			</footer>
		</div>
	{/snippet}
</ScrollScene>

<style>
	.calendar {
		max-width: 62rem;
		margin: 0 auto;
		padding: 5rem 1.25rem 4rem;
	}

	.cal-head h2 {
		font-size: clamp(1.9rem, 5.5vw, 3.2rem);
	}

	.cal-intro {
		color: var(--ink-light-secondary);
	}

	/* ── selector: mini-map + dropdown fallback ───────────────────────── */
	.selector {
		display: flex;
		align-items: flex-end;
		gap: 1.5rem;
		flex-wrap: wrap;
		margin: 1.5rem 0;
	}

	.mini-map {
		width: min(24rem, 100%);
		height: auto;
	}

	.prov {
		fill: var(--paper-raised);
		stroke: var(--ink-light-axis);
		stroke-width: 1;
		opacity: 0.45;
	}

	.prov.has-cal {
		opacity: 1;
		cursor: pointer;
		transition: fill 0.25s;
	}

	.prov.has-cal:hover {
		fill: color-mix(in srgb, var(--accent-light) 18%, var(--paper-raised));
	}

	.prov.on {
		fill: color-mix(in srgb, var(--accent-light) 38%, var(--paper-raised));
		stroke: var(--accent-light);
		stroke-width: 1.75;
	}

	.prov:focus-visible {
		outline: none;
		stroke: var(--accent-light);
		stroke-width: 2.5;
	}

	.prov-label {
		font-size: 13px;
		font-weight: 600;
		fill: var(--ink-light-primary);
		pointer-events: none;
	}

	.select-fallback {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-light-secondary);
	}

	.select-fallback select {
		font: 600 0.85rem/1.2 'Public Sans', system-ui, sans-serif;
		min-height: 44px;
		padding: 0.5rem 0.8rem;
		border-radius: 8px;
		border: 1px solid var(--ink-light-axis);
		background: var(--paper-raised);
		color: var(--ink-light-primary);
	}

	/* ── the ONI rail ─────────────────────────────────────────────────── */
	.rail {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		margin: 0.75rem 0 1.5rem;
	}

	.rail-title {
		font-size: 0.65rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-light-muted);
		white-space: nowrap;
	}

	.rail-bar {
		position: relative;
		flex: 1;
		height: 4px;
		border-radius: 2px;
		background: var(--ink-light-grid);
		margin-right: 1.25rem;
	}

	.rail-tick {
		position: absolute;
		top: 6px;
		transform: translateX(-50%);
		font-size: 0.6rem;
		color: var(--ink-light-muted);
		font-variant-numeric: tabular-nums;
	}

	.rail-tick i {
		display: block;
		width: 1px;
		height: 5px;
		background: var(--ink-light-axis);
		margin: -9px auto 2px;
	}

	.rail-mark {
		position: absolute;
		top: -22px;
		transform: translateX(-50%);
		font-size: 0.68rem;
		font-weight: 700;
		color: var(--ink-light-secondary);
		font-variant-numeric: tabular-nums;
		padding: 0.1rem 0.35rem;
		border: 1px solid var(--ink-light-axis);
		border-radius: 4px;
		background: var(--paper-raised);
		transition: color 0.25s, border-color 0.25s;
	}

	.rail-mark.lit {
		color: var(--accent-light);
		border-color: var(--accent-light);
	}

	/* ── the action grid ──────────────────────────────────────────────── */
	.grid-wrap {
		position: relative;
	}

	.prov-title {
		font-size: 1.4rem;
		margin: 1.5rem 0 1rem;
	}

	.prov-title span {
		font-family: 'Public Sans', system-ui, sans-serif;
		font-size: 0.75rem;
		font-weight: 400;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-light-muted);
	}

	.action-grid {
		display: grid;
		gap: 0.75rem;
	}

	.action {
		display: grid;
		grid-template-columns: 5.5rem 1fr;
		gap: 1rem;
		padding: 0.9rem 1rem;
		background: var(--paper-raised);
		border: 1px solid var(--ink-light-grid);
		border-radius: 8px;
	}

	button.action {
		text-align: left;
		font: inherit;
		color: inherit;
		cursor: pointer;
		width: 100%;
		transition: border-color 0.25s;
	}

	button.action:hover {
		border-color: var(--ink-light-axis);
	}

	button.action.on {
		border-color: var(--accent-light);
	}

	button.action.on .trigger {
		color: var(--ink-light-primary);
	}

	button.action.on .t-label {
		border-color: var(--accent-light);
		color: var(--accent-light);
	}

	.month {
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--accent-light);
	}

	.what {
		font-weight: 600;
		margin-bottom: 0.35em;
	}

	.trigger {
		font-size: 0.85rem;
		color: var(--ink-light-secondary);
		margin-bottom: 0.25em;
	}

	.t-label {
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		border: 1px solid var(--ink-light-axis);
		border-radius: 4px;
		padding: 0.1rem 0.35rem;
		margin-right: 0.4rem;
	}

	.agency {
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--ink-light-muted);
		margin: 0;
	}

	.link-line {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.print-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin: 2rem 0;
	}

	.print-btn {
		font: 600 0.85rem/1 'Public Sans', system-ui, sans-serif;
		min-height: 44px;
		padding: 0.75rem 1.25rem;
		border-radius: 6px;
		border: none;
		background: var(--accent-light);
		color: var(--paper-raised);
		cursor: pointer;
	}

	.print-note {
		font-size: 0.75rem;
		color: var(--ink-light-muted);
	}

	.cal-foot {
		margin-top: 3rem;
		padding-top: 1rem;
		border-top: 1px solid var(--ink-light-grid);
		font-size: 0.75rem;
		color: var(--ink-light-muted);
	}

	@media print {
		.calendar {
			padding: 0;
		}

		.action {
			border: 1px solid #999;
			break-inside: avoid;
			padding: 0.5rem 0.75rem;
		}

		button.action.on {
			border-color: #999;
		}

		.action-grid {
			gap: 0.4rem;
		}

		.month {
			color: #000;
		}

		.cal-head h2 {
			font-size: 1.6rem;
		}
	}
</style>
