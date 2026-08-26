<script>
	/**
	 * CallToAction — the close of the argument, made actionable. The whole
	 * piece has shown that El Niño's damage in Papua New Guinea follows a
	 * known sequence, announced months ahead by an ocean thermometer. This
	 * section turns that into three things:
	 *
	 *  · four concrete jobs (follow the warnings, store water, plant for
	 *    drought and frost, expect the flood after);
	 *  · THE PREPARATION CALENDAR: the jobs plotted into the months the
	 *    chapter-nine estimate actually implies (the hard months to ~Mar
	 *    2027, the swing back ~Jun 2027), with a live "you are here"
	 *    needle driven by the reader's current month;
	 *  · four commitment ticks, persisted to localStorage only — nothing is
	 *    sent anywhere (the piece ships no backend and tracks nobody) — plus
	 *    a one-tap copy-out so the plan can leave the browser as text.
	 *
	 * Calendar zones mirror $lib/generated/now-copy.js (`calendar.hardestEnd`
	 * = Mar 2027, `calendar.swingback` = Jun 2027); if the pipeline moves
	 * those dates, move them here with it.
	 */
	import { ui } from '$lib/state.svelte.js';
	import { reveal } from '$lib/reveal.js';
	import { now } from '$lib/generated/now-copy.js';

	const ASKS = [
		{
			no: '01',
			title: 'Follow the warnings',
			body: 'The ocean signal is public and runs months ahead of PNG’s rain. Follow the PNG National Weather Service and NARI’s drought updates — and when a drought alert is named for your province, treat it as a start date for action, not a headline.',
			/** action window on the calendar, in timeline-month indexes */
			at: 0,
			side: 'top'
		},
		{
			no: '02',
			title: 'Store water now',
			body: 'Fill tanks and containers while rivers and rain still run; fix gutters and protect wells. Communities should map their water sources and agree on rationing before the dry deepens — after the taps fail, every option costs more.',
			at: 3,
			side: 'bottom'
		},
		{
			no: '03',
			title: 'Plant for drought and frost',
			body: 'Shift gardens toward drought-hardy staples — cassava, taro, banana, resilient kaukau varieties — and protect planting material. Above 2,200 m, prepare for frost nights: cover and mulch what you can, and hold back cuttings to replant after.',
			at: 5,
			side: 'top'
		},
		{
			no: '04',
			title: 'Expect the flood after',
			body: 'The drought ends in water. Through the dry months: clear drains and waterways, keep new gardens out of riverbeds, and plan where people and supplies go if slopes slip. Treat the first heavy rain around June 2027 as a warning, not a celebration.',
			at: 11,
			side: 'bottom'
		}
	];

	// ── the preparation calendar ────────────────────────────────────────────
	const START = { y: 2026, m: 5 }; // May 2026, the declaration month
	const N_MONTHS = 15; //           May 2026 … Jul 2027
	const MONTHS_SHORT = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
	const MONTHS_LONG = [
		'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
	];

	const monthLabel = (i) => {
		const m = (START.m - 1 + i) % 12;
		const y = START.y + Math.floor((START.m - 1 + i) / 12);
		return { short: MONTHS_SHORT[m], long: `${MONTHS_LONG[m]} ${String(y).slice(2)}` };
	};

	// zones: [fromIndex, toIndex] inclusive — mirrors now.calendar above
	const HARD = [0, 10]; //   May 2026 – Mar 2027
	const SWING = [13, 13]; // Jun 2027 — where the weighted estimate drops below the El Niño threshold

	const W = 940;
	const H = 190;
	const PAD_L = 46;
	const PAD_R = 30;
	const xOf = (i) => PAD_L + (i * (W - PAD_L - PAD_R)) / (N_MONTHS - 1);

	let today = $derived(ui.now ?? { y: 2026, m: 8 }); // prerender reads at the as-of date
	let todayIdx = $derived(
		Math.max(0, Math.min(N_MONTHS - 1, (today.y - START.y) * 12 + (today.m - START.m)))
	);
	let hereLabel = $derived(
		`${MONTHS_LONG[(today.m - 1 + 12) % 12]} ${today.y}`
	);

	const ticks = Array.from({ length: N_MONTHS }, (_, i) => i);

	// ── commitments (localStorage only — there is no server to send to) ─────
	const KEY = 'ocean-knows-first-plan-v1';
	let done = $state([false, false, false, false]);
	let copied = $state(false);

	function load() {
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) {
				const arr = JSON.parse(raw);
				if (Array.isArray(arr)) done = ASKS.map((_, i) => Boolean(arr[i]));
			}
		} catch {
			/* private mode etc. — the plan still renders unticked */
		}
	}

	function toggle(i) {
		done[i] = !done[i];
		try {
			localStorage.setItem(KEY, JSON.stringify(done));
		} catch {
			/* non-persistent is fine */
		}
	}

	async function copyPlan() {
		const lines = [
			'PREPARING FOR THE 2026 EL NIÑO — the plan (The Ocean Knows First)',
			`Hard months: now to about ${now.calendar.hardestEnd}. The rain returns: about ${now.calendar.swingback}.`,
			'',
			...ASKS.map((a, i) => `${done[i] ? '[x]' : '[ ]'} ${a.no} ${a.title} — ${a.body}`),
			'',
			'Remember the sequence: drought first, frost in the Highlands, then floods when the rain returns.'
		];
		const text = lines.join('\n');
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			setTimeout(() => (copied = false), 2400);
		} catch {
			/* clipboard refused (permissions/insecure context) — no-op */
		}
	}

	$effect(() => {
		if (typeof window !== 'undefined') load();
	});

	const nDone = $derived(done.filter(Boolean).length);
</script>

<section class="cta" aria-label="What to do, and when">
	<header class="chapter-head" id="ch-ask">
		<p class="chapter-no" use:reveal>What to do</p>
		<h2 use:reveal={{ delay: 90 }}>Prepare for the predictable.</h2>
		<p class="standfirst" use:reveal={{ delay: 200 }}>
			Nobody can stop an El Niño, and nothing will cool the far ocean. But this one has been
			announced months in advance, and the record shows exactly what fails, in what order: water
			first, then the rivers, then the gardens, then the frost — and the floods at the end. Here
			is what to do with that warning, and when.
		</p>
	</header>

	<!-- ── the preparation calendar ──────────────────────────────────────────── -->
	<figure class="cal" use:reveal>
		<div class="cal-scroll">
		<svg
			viewBox="0 0 {W} {H}"
			role="img"
			aria-label="The preparation calendar, May 2026 to July 2027. The hard months run from now to about March 2027 — failing rain, falling rivers, frost nights — with one job in each window: follow the warnings from the declaration onward, store water by August, plant for drought and frost before the expected November peak, and prepare for floods before the rain returns around June 2027."
		>
			<!-- zone: the hard months -->
			<rect
				x={xOf(HARD[0])} y="34"
				width={xOf(HARD[1]) - xOf(HARD[0])} height="86"
				fill="color-mix(in srgb, var(--warm) 9%, transparent)"
				rx="8"
			/>
			<text x={xOf(HARD[0]) + 6} y="24" font-size="11.5" font-weight="700" fill="var(--warm)">
				the hard months → {now.calendar.hardestEnd}
			</text>

			<!-- zone: the swing back -->
			<rect
				x={xOf(SWING[0])} y="34"
				width={xOf(SWING[1] + 0.55) - xOf(SWING[0])} height="86"
				fill="color-mix(in srgb, var(--cool) 11%, transparent)"
				rx="8"
			/>
			<text x={Math.max(xOf(SWING[0]) - 4, W - 128)} y="24" font-size="11.5" font-weight="700" fill="var(--cool)">
				{now.calendar.swingback.split('–')[0]} · the swing back
			</text>

			<!-- the axis -->
			<line x1={PAD_L - 18} x2={W - PAD_R + 12} y1={120} y2={120} stroke="var(--ink-light-axis)" stroke-width="1.4" />
			{#each ticks as i (i)}
				<g>
					<line x1={xOf(i)} x2={xOf(i)} y1={116} y2={124} stroke="var(--ink-light-axis)" stroke-width="1" />
					<text x={xOf(i)} y={140} text-anchor="middle" font-size="9.5" fill="var(--ink-light-muted)">
						{monthLabel(i).short}
					</text>
					{#if monthLabel(i).long.startsWith('Jan') || monthLabel(i).long.startsWith('May') || i === 0 || i === N_MONTHS - 1}
						<text x={xOf(i)} y={154} text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--ink-light-secondary)">
							{monthLabel(i).long}
						</text>
					{/if}
				</g>
			{/each}

			<!-- the expected peak -->
			<line x1={xOf(6)} x2={xOf(6)} y1={34} y2={120} stroke="var(--warm)" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.8" />
			<text x={xOf(6) + 7} y={112} text-anchor="start" font-size="10.5" font-weight="800" fill="var(--warm)">expected peak</text>

			<!-- you are here -->
			<g>
				<line x1={xOf(todayIdx)} x2={xOf(todayIdx)} y1={30} y2={132} stroke="var(--ink-light-primary)" stroke-width="2" />
				<circle cx={xOf(todayIdx)} cy={120} r="4.5" fill="var(--ink-light-primary)" />
				<text
					x={xOf(todayIdx) < W - 90 ? xOf(todayIdx) + 6 : xOf(todayIdx) - 6}
					y={44}
					text-anchor={xOf(todayIdx) < W - 90 ? 'start' : 'end'}
					font-size="10.5"
					font-weight="800"
					fill="var(--ink-light-primary)"
				>you are here · {hereLabel}</text>
			</g>

			<!-- the asks, dropped into their months -->
			{#each ASKS as ask (ask.no)}
				{@const y = ask.side === 'top' ? 62 : 92}
				{@const anchor = ask.at >= 13 ? 'end' : 'start'}
				{@const dx = ask.at >= 13 ? -10 : 10}
				<g>
					<circle cx={xOf(ask.at)} cy={y} r="11" fill="var(--paper-raised)" stroke="var(--accent-light)" stroke-width="1.6" />
					<text x={xOf(ask.at)} y={y + 3.5} text-anchor="middle" font-size="10" font-weight="800" fill="var(--accent-light)">
						{ask.no}
					</text>
					<text
						x={xOf(ask.at) + dx}
						y={y + 3.5}
						text-anchor={anchor}
						font-size="10.5"
						font-weight="700"
						fill="var(--ink-light-primary)"
					>{ask.title.toLowerCase()}</text>
				</g>
			{/each}

			<!-- the fifth duty: swing-back flood watch -->
			<g>
				<circle cx={xOf(13)} cy={62} r="11" fill="var(--paper-raised)" stroke="var(--cool)" stroke-width="1.6" />
				<path
					d={`M${xOf(13)} ${54.5} C ${xOf(13) - 4.6} ${61} ${xOf(13) - 5.4} ${64.5} ${xOf(13)} ${67.5} C ${xOf(13) + 5.4} ${64.5} ${xOf(13) + 4.6} ${61} ${xOf(13)} ${54.5} Z`}
					fill="var(--cool)"
				/>
				<text x={xOf(13) - 10} y={65.5} text-anchor="end" font-size="10.5" font-weight="700" fill="var(--ink-light-primary)">
					flood watch
				</text>
			</g>
		</svg>
		</div>
		<figcaption class="cal-foot">
			The four jobs, on the ocean’s calendar. Windows follow chapter nine’s estimate and the
			National Weather Service’s own dates; the needle marks your current month.
		</figcaption>
	</figure>

	<div class="asks">
		{#each ASKS as ask, i (ask.no)}
			<article class="ask" class:done={done[i]} use:reveal={{ delay: i * 80 }}>
				<button
					class="tick"
					class:on={done[i]}
					aria-pressed={done[i]}
					onclick={() => toggle(i)}
					title="Mark as committed (kept in this browser only)"
				>
					<span class="tick-box" aria-hidden="true">{#if done[i]}✓{/if}</span>
					<span class="sr-only">Committed to “{ask.title}”</span>
				</button>
				<div>
					<p class="ask-no display">{ask.no}</p>
					<h3>{ask.title}</h3>
					<p>{ask.body}</p>
				</div>
			</article>
		{/each}
	</div>

	<p class="cta-institutions" use:reveal>
		The same list exists at national scale: fund the weather service and the drought
		early-warning system, pre-position food, fuel and medicine for the river towns, and release
		drought funds on the ocean’s calendar — before the emergency, not after it.
	</p>

	<div class="plan-tools no-print">
		<p class="plan-count" role="status">
			<strong>{nDone} of {ASKS.length}</strong> ticked off{nDone === ASKS.length
				? ' — the full plan.'
				: ''}
		</p>
		<button class="copy-btn" onclick={copyPlan}>
			{copied ? 'Copied ✓' : 'Copy the plan as text'}
		</button>
	</div>

	<p class="cta-close" use:reveal>
		The ocean has already announced this El Niño. 1997 and 2015 wrote the playbook, in hunger
		and frost and flood. This time, Papua New Guinea can use it.
	</p>
</section>

<style>
	.cta {
		max-width: 72rem;
		margin: 0 auto;
		padding: clamp(3.5rem, 10vh, 7rem) 1.5rem;
	}

	/* ── calendar ── */
	.cal {
		margin: 1rem auto 2.75rem;
		max-width: 58rem;
		background: var(--paper-raised);
		border: 1px solid var(--ink-light-grid);
		border-radius: 16px;
		box-shadow:
			0 1px 2px rgba(29, 26, 20, 0.05),
			0 10px 26px rgba(29, 26, 20, 0.09);
		padding: 1.25rem 1.25rem 0.9rem;
	}

	.cal svg {
		display: block;
		width: 100%;
		height: auto;
	}

	/* below ~720px the 940-unit calendar stops being legible, so it keeps its
	   size and swipes horizontally instead of shrinking into noise */
	@media (max-width: 720px) {
		.cal-scroll {
			overflow-x: auto;
			-webkit-overflow-scrolling: touch;
		}

		.cal-scroll svg {
			min-width: 640px;
		}
	}

	.cal-foot {
		font-size: 0.72rem;
		color: var(--ink-light-muted);
		border-top: 1px solid var(--ink-light-grid);
		margin-top: 0.35rem;
		padding: 0.55rem 0.15rem 0.35rem;
	}

	/* ── asks ── */
	.asks {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
		gap: 1.25rem;
	}

	.ask {
		position: relative;
		background: var(--paper-raised);
		border: 1px solid var(--ink-light-grid);
		border-radius: 12px;
		padding: 1.25rem 1.35rem;
		transition: border-color 0.3s ease, opacity 0.3s ease;
	}

	.ask.done {
		border-color: color-mix(in srgb, var(--accent-light) 55%, transparent);
	}

	.ask.done h3::after {
		content: ' · committed';
		font-family: 'Public Sans', system-ui, sans-serif;
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--accent-light);
	}

	.tick {
		position: absolute;
		top: 0.85rem;
		right: 0.85rem;
		width: 44px; /* tap-target floor */
		height: 44px;
		display: grid;
		place-items: center;
		background: none;
		border: 1px solid color-mix(in srgb, currentColor 35%, transparent);
		border-radius: 9px;
		cursor: pointer;
		color: var(--accent-light);
		transition: background-color 0.25s ease, border-color 0.25s ease;
	}

	.tick:hover {
		border-color: currentColor;
	}

	.tick:focus-visible {
		outline: 2px solid var(--accent-light);
		outline-offset: 3px;
	}

	.tick-box {
		font-size: 1rem;
		font-weight: 800;
		line-height: 1;
	}

	.tick.on {
		background: color-mix(in srgb, var(--accent-light) 16%, transparent);
		border-color: var(--accent-light);
	}

	.ask-no {
		font-size: 2rem;
		color: var(--accent-light);
		margin: 0 0 0.15em;
	}

	.ask h3 {
		font-size: 1.15rem;
		margin-bottom: 0.4em;
	}

	.ask p:last-child {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.55;
		color: var(--ink-light-secondary);
	}

	/* ── tools ── */
	.plan-tools {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-top: 1.75rem;
	}

	.plan-count {
		margin: 0;
		font-size: 0.88rem;
		color: var(--ink-light-secondary);
	}

	.copy-btn {
		min-height: 44px;
		font: 600 0.82rem/1.2 'Public Sans', system-ui, sans-serif;
		color: var(--ink-light-primary);
		background: var(--paper-raised);
		border: 1px solid color-mix(in srgb, currentColor 35%, transparent);
		border-radius: 999px;
		padding: 0.6rem 1.2rem;
		cursor: pointer;
		transition: border-color 0.25s ease;
	}

	.copy-btn:hover {
		border-color: currentColor;
	}

	.copy-btn:focus-visible {
		outline: 2px solid var(--accent-light);
		outline-offset: 3px;
	}

	.cta-institutions {
		max-width: 44rem;
		margin: 2rem auto 0;
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--ink-light-secondary);
		text-align: center;
	}

	.cta-close {
		max-width: 42rem;
		margin: 2.75rem auto 0;
		font-family: Fraunces, Georgia, serif;
		font-weight: 700;
		font-size: clamp(1.1rem, 2.4vw, 1.5rem);
		line-height: 1.45;
		text-align: center;
		text-wrap: balance;
	}
</style>
