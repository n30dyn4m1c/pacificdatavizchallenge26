<script>
	/**
	 * Scene 7 — "You are here". The ending, redesigned for a reader INSIDE
	 * the event (August 2026 onward): the calendar computes the current
	 * month client-side (Pacific/Port_Moresby; dev override ?now=YYYY-MM-DD)
	 * and renders every action in one of three states relative to it —
	 * window CLOSED (greyed but visible, labelled plainly), window OPEN
	 * (accent, top of the province's list) or window AHEAD (normal weight).
	 * Closed windows are never hidden: their visibility is what makes the
	 * open ones urgent.
	 *
	 * The province selector is a tappable mini-map with a dropdown fallback;
	 * a shared link (?province=<slug>#scene-7-calendar) preselects the
	 * province. Selecting an action draws a line back to the ONI threshold
	 * it references. The selected province's official PNG-NWS/NARI DEWS
	 * status sits beside its name. Print gets one clean page in grayscale.
	 */
	import { base } from '$app/paths';
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import Cite from '$lib/components/Cite.svelte';
	import { dews as dewsColors, dewsLabel } from '$lib/palette.js';
	import { ui, lag } from '$lib/state.svelte.js';

	const dewsC = dewsColors.light;

	let selected = $state(0);
	let selectedAction = $state(null);

	let geo = $state(null);
	async function onData(data) {
		// a shared link lands here with the sender's province preselected
		if (ui.province) {
			const i = data.provinces.findIndex((p) => slug(p.name) === ui.province.toLowerCase());
			if (i !== -1) selected = i;
		}
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

	// ── "now", client-side ───────────────────────────────────────────────
	const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

	/** absolute month index of an action month like "Jul 26" */
	const monthIdx = (str) => {
		const [mon, yy] = str.split(' ');
		return (2000 + +yy) * 12 + MONTHS.indexOf(mon);
	};
	const monthFull = (str) => MONTHS_FULL[MONTHS.indexOf(str.split(' ')[0])];

	// null until +layout.svelte has read the clock → SSR/prerender renders
	// every window as "ahead", never falsely closed
	const nowIdx = $derived(ui.now ? ui.now.y * 12 + (ui.now.m - 1) : null);
	const nowLabel = $derived(ui.now ? `${MONTHS_FULL[ui.now.m - 1]} ${ui.now.y}` : 'today');

	const windowState = (a) => {
		if (nowIdx == null) return 'ahead';
		const mi = monthIdx(a.month);
		return mi < nowIdx ? 'closed' : mi === nowIdx ? 'open' : 'ahead';
	};

	// open windows first (the focus), then ahead, then closed — each group
	// chronological. Original indices survive for the threshold line + toggle.
	const STATE_ORDER = { open: 0, ahead: 1, closed: 2 };
	const decorate = (prov) =>
		prov.actions
			.map((a, i) => ({ ...a, state: windowState(a), origIdx: i }))
			.sort((x, y) => STATE_ORDER[x.state] - STATE_ORDER[y.state] || monthIdx(x.month) - monthIdx(y.month));

	// beat 3 of the lead-in: what is actually open in the selected province
	function statusLine(list) {
		const open = list.filter((a) => a.state === 'open').length;
		if (open) return `${open} action window${open > 1 ? 's are' : ' is'} open right now`;
		const next = list.find((a) => a.state === 'ahead');
		if (next) return `the next window opens in ${monthFull(next.month)}`;
		return 'every drafted window has closed — what remains is response';
	}

	const bulletinLabel = (d) => {
		if (!d) return '';
		const [y, m] = d.split('-');
		return `${MONTHS_FULL[+m - 1]} ${y}`;
	};

	// ── share: the primary CTA ───────────────────────────────────────────
	const slug = (name) => name.toLowerCase().replace(/\s+/g, '-');
	let toast = $state('');
	let toastTimer = 0;

	function shareUrl(prov) {
		const url = new URL(window.location.href);
		url.searchParams.delete('now'); // dev params never travel
		url.searchParams.delete('notap');
		url.searchParams.set('province', slug(prov.name));
		url.hash = 'scene-7-calendar';
		return url.toString();
	}

	async function share(prov) {
		const url = shareUrl(prov);
		if (navigator.share) {
			try {
				await navigator.share({
					title: document.title,
					text: `Anticipatory-action calendar for ${prov.name} — open and closed windows as of ${nowLabel}`,
					url
				});
				return;
			} catch (e) {
				if (e.name === 'AbortError') return; // user cancelled: no fallback
			}
		}
		try {
			await navigator.clipboard.writeText(url);
			toast = 'Link copied — send it on.';
		} catch {
			toast = `Copy this link: ${url}`;
		}
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => (toast = ''), 4000);
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
	title="You are here — the anticipatory-action calendar by province"
	surface="light"
	pin={false}
	printable={true}
	dataUrl="/data/scene7_calendar.json"
	ondata={(d) => {
		dataRef = d;
		onData(d);
	}}
	onprogress={onProgress}
>
	{#snippet prose({ data })}
		<h2>You are here</h2>
		<p>
			Everything above exists for this page — and the page is being read from inside the event,
			not before it. The calendar computes the current month where you are reading it (Papua New
			Guinea time) and shows, for each province, which action windows have already closed, which
			are open right now, and which are still ahead. Closed windows stay visible — their
			visibility is what makes the open ones urgent. Beside each province's name is its current
			official status from the PNG-NWS/NARI monthly Drought Update.
			{#if data?.governance}
				{data.governance.text}<Cite
					href={data._meta?.governance?.source_url}
					label={data._meta?.governance?.source}
				/>
			{/if}
			Choose a province, read its months, print it, and send it to the provincial disaster
			coordinator. (Placeholder actions — to be co-drafted with the National Disaster Centre and
			provincial Divisions of Agriculture and Livestock.)
		</p>
	{/snippet}

	{#snippet children({ data })}
		<div class="calendar">
			<header class="cal-head">
				<p class="kicker">The payoff · a tool, not a chart</p>
				<h2 class="display">You are here.</h2>
				<!-- TODO-VERIFY: Tok Pisin placeholder — prep/manual/tokpisin_strings.json#scene7-opener -->
				<p class="tpi-echo" lang="tpi">Yu stap hia nau.</p>
			</header>

			{#if data}
				{@const prov = data.provinces[selected]}
				{@const marks = railMarks(prov)}
				{@const list = decorate(prov)}
				{@const tier = data.dews?.provinces?.[prov.name]}

				<!-- the lead-in: three short steps, then the governance fact -->
				<ol class="you-are-here no-print">
					<li>The ocean signal was there by June 2026 — everything above is how I watched it arrive.</li>
					<li>It is now <strong>{nowLabel}</strong>. We are inside the event, not ahead of it.</li>
					<li>In <strong>{prov.name}</strong>, {statusLine(list)}.</li>
				</ol>
				{#if data.governance}
					<p class="governance no-print">
						{data.governance.text}<Cite
							href={data._meta?.governance?.source_url}
							label={data._meta?.governance?.source}
						/>
					</p>
				{/if}

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
						{#if tier}
							<span
								class="dews-chip"
								style:border-color={dewsC[tier]}
								style:color={dewsC[tier]}
								title="PNG-NWS/NARI Drought Update, {bulletinLabel(data.dews?.bulletin_date)}"
							>
								{dewsLabel[tier]}
							</span>
						{/if}
						<span>· anticipatory-action calendar · as of {nowLabel}</span>
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
						{#each list as a (a.month + a.action)}
							{#if ui.noTap}
								<article class="action st-{a.state}">
									<div class="month display">
										{a.month}
										{#if a.state === 'open'}<span class="open-tag">open now</span>{/if}
									</div>
									<div class="body">
										<p class="what">{a.action}</p>
										<p class="trigger"><span class="t-label">trigger</span> {a.trigger}</p>
										<p class="agency">{a.lead_agency}</p>
										{#if a.state === 'closed'}
											<p class="closed-note">This window closed in {monthFull(a.month)}.</p>
										{/if}
									</div>
								</article>
							{:else}
								<button
									class="action selectable beat-focus st-{a.state}"
									class:on={selectedAction === a.origIdx}
									data-action-idx={a.origIdx}
									aria-pressed={selectedAction === a.origIdx}
									onclick={() => toggleAction(data, a.origIdx)}
								>
									<div class="month display">
										{a.month}
										{#if a.state === 'open'}<span class="open-tag">open now</span>{/if}
									</div>
									<div class="body">
										<p class="what">{a.action}</p>
										<p class="trigger"><span class="t-label">trigger</span> {a.trigger}</p>
										<p class="agency">{a.lead_agency}</p>
										{#if a.state === 'closed'}
											<p class="closed-note">This window closed in {monthFull(a.month)}.</p>
										{/if}
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
					<div class="cta-row no-print">
						<button class="cta-primary" onclick={() => share(prov)}>
							Send this to your provincial disaster coordinator
						</button>
						<button class="print-btn" onclick={() => window.print()}>
							Print this province’s calendar
						</button>
					</div>
					{#if toast}
						<p class="toast no-print" role="status">{toast}</p>
					{/if}
				{/if}

				<!-- the official handoff -->
				<p class="official">
					For official status:
					<a href={data.dews?.source_url} target="_blank" rel="noopener noreferrer"
						>PNG-NWS / NARI monthly Drought Update ({bulletinLabel(data.dews?.bulletin_date)})</a
					>
					·
					<a href="https://www.pngmet.gov.pg/" target="_blank" rel="noopener noreferrer"
						>PNG National Weather Service</a
					>
				</p>
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

	/* ── the "you are here" lead-in: three short steps ────────────────── */
	.you-are-here {
		list-style: none;
		counter-reset: beat;
		margin: 0 0 1rem;
		padding: 0;
		max-width: 38rem;
	}

	.you-are-here li {
		counter-increment: beat;
		position: relative;
		padding: 0.35rem 0 0.35rem 2.2rem;
		font-family: Fraunces, Georgia, serif;
		font-size: 1.08rem;
		line-height: 1.4;
	}

	.you-are-here li::before {
		content: counter(beat);
		position: absolute;
		left: 0;
		top: 0.45rem;
		width: 1.45rem;
		height: 1.45rem;
		display: grid;
		place-items: center;
		font: 700 0.75rem/1 'Public Sans', system-ui, sans-serif;
		color: var(--paper-raised);
		background: var(--accent-light);
		border-radius: 50%;
	}

	.governance {
		max-width: 38rem;
		font-size: 0.88rem;
		color: var(--ink-light-secondary);
		border-left: 3px solid var(--ink-light-axis);
		padding-left: 0.8rem;
		margin: 0 0 1.5rem;
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

	.prov-title .dews-chip {
		display: inline-block;
		vertical-align: middle;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.07em;
		padding: 0.22rem 0.5rem;
		border: 1.5px solid;
		border-radius: 4px;
		margin: 0 0.4rem 0.2rem 0.2rem;
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

	/* ── window states relative to the current month ──────────────────── */
	.action.st-open {
		border: 2px solid var(--accent-light);
		background: color-mix(in srgb, var(--accent-light) 6%, var(--paper-raised));
	}

	.open-tag {
		display: block;
		width: fit-content;
		font: 700 0.6rem/1 'Public Sans', system-ui, sans-serif;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--paper-raised);
		background: var(--accent-light);
		border-radius: 4px;
		padding: 0.25rem 0.4rem;
		margin-top: 0.4rem;
	}

	.action.st-closed {
		opacity: 0.6;
	}

	.action.st-closed .month {
		color: var(--ink-light-muted);
	}

	.closed-note {
		font-size: 0.75rem;
		font-style: italic;
		color: var(--ink-light-muted);
		margin: 0.3em 0 0;
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

	/* ── CTAs: share first, print second, official handoff last ──────── */
	.cta-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		margin: 2rem 0 0.5rem;
	}

	.cta-primary {
		font: 600 0.9rem/1.2 'Public Sans', system-ui, sans-serif;
		min-height: 44px;
		padding: 0.75rem 1.4rem;
		border-radius: 6px;
		border: none;
		background: var(--accent-light);
		color: var(--paper-raised);
		cursor: pointer;
	}

	.print-btn {
		font: 600 0.85rem/1.2 'Public Sans', system-ui, sans-serif;
		min-height: 44px;
		padding: 0.7rem 1.2rem;
		border-radius: 6px;
		border: 1.5px solid var(--ink-light-axis);
		background: var(--paper-raised);
		color: var(--ink-light-primary);
		cursor: pointer;
	}

	.cta-primary:focus-visible,
	.print-btn:focus-visible {
		outline: 2px solid var(--accent-light);
		outline-offset: 3px;
	}

	.toast {
		font-size: 0.8rem;
		color: var(--ink-light-secondary);
		overflow-wrap: anywhere;
		margin: 0 0 0.5em;
	}

	.official {
		font-size: 0.8rem;
		color: var(--ink-light-secondary);
		margin-top: 1rem;
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

		/* the three window states, legible in grayscale */
		.action.st-open {
			border: 2.5px solid #000;
			background: #fff;
		}

		.open-tag {
			color: #fff;
			background: #000;
		}

		.action.st-closed {
			opacity: 1;
			color: #777;
			border-style: dashed;
		}

		.action.st-closed .month,
		.action.st-closed .agency,
		.action.st-closed .trigger,
		.closed-note {
			color: #777;
		}

		.prov-title .dews-chip {
			color: #000 !important;
			border-color: #000 !important;
		}

		.tpi-echo {
			display: none;
		}

		.official {
			color: #000;
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
