<script>
	// latin subset only — the audience is PNG on slow connections and the
	// piece uses no latin-ext glyphs; the full-family CSS would also ship the
	// latin-ext woff2/woff files. font-display:swap is built into these.
	import '@fontsource/fraunces/latin-700.css';
	import '@fontsource/fraunces/latin-900.css';
	import '@fontsource/public-sans/latin-400.css';
	import '@fontsource/public-sans/latin-600.css';
	import '../app.css';
	import { onMount } from 'svelte';
	import { ui } from '$lib/state.svelte.js';
	import { surfaces, ink, series, impact } from '$lib/palette.js';
	import ChapterNav from '$lib/components/ChapterNav.svelte';
	import ThermalWash from '$lib/components/ThermalWash.svelte';

	let { children } = $props();

	// palette.js → CSS custom properties (single source of truth stays in JS)
	const rootVars = `:root{
		--ocean:${surfaces.ocean};--ocean-raised:${surfaces.oceanRaised};
		--paper:${surfaces.paper};--paper-raised:${surfaces.paperRaised};
		--ink-dark-primary:${ink.dark.primary};--ink-dark-secondary:${ink.dark.secondary};
		--ink-dark-muted:${ink.dark.muted};--ink-dark-grid:${ink.dark.grid};--ink-dark-axis:${ink.dark.axis};
		--ink-light-primary:${ink.light.primary};--ink-light-secondary:${ink.light.secondary};
		--ink-light-muted:${ink.light.muted};--ink-light-grid:${ink.light.grid};--ink-light-axis:${ink.light.axis};
		--accent-dark:${series.dark.accent};--accent-light:${series.light.accent};
		--warm:${impact.light.drought};--cool:${impact.light.frost};
	}`;

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		ui.reducedMotion = mq.matches;
		const onChange = (e) => (ui.reducedMotion = e.matches);
		mq.addEventListener('change', onChange);
		// ?notap=1 — proof-read the scroll-only experience: every optional
		// interactive affordance across the piece renders nothing.
		const params = new URLSearchParams(window.location.search);
		ui.noTap = params.get('notap') === '1';
		// the reader's current month, in PNG time — drives scene 7's window
		// states. ?now=YYYY-MM-DD simulates a date (dev/QA only).
		const nowParam = params.get('now');
		const nowDate = /^\d{4}-\d{2}-\d{2}$/.test(nowParam ?? '')
			? new Date(nowParam + 'T12:00:00Z')
			: new Date();
		const [y, m] = new Intl.DateTimeFormat('en-CA', {
			timeZone: 'Pacific/Port_Moresby',
			year: 'numeric',
			month: '2-digit'
		})
			.format(nowDate)
			.split('-');
		ui.now = { y: +y, m: +m };
		// ?province=<slug> from a shared link — scene 7 preselects it
		ui.province = params.get('province');
		return () => mq.removeEventListener('change', onChange);
	});
</script>

<svelte:head>
	{@html `<style>${rootVars}</style>`}
</svelte:head>

<a class="skip-link no-print" href="#main">Skip to story</a>

<ChapterNav />

<!-- the page breathes with the story: a whisper of the climate's own
     temperature, mapped to where the reader is -->
<ThermalWash />

{@render children()}

<!-- a whisper of paper tooth over the whole surface (never printed) -->
<div class="grain no-print" aria-hidden="true"></div>

<style>
	.skip-link {
		position: absolute;
		left: 0.75rem;
		top: 0.75rem;
		z-index: 200;
		transform: translateY(-200%);
		background: var(--paper-raised);
		color: var(--ink-light-primary);
		padding: 0.55rem 0.9rem;
		border-radius: 999px;
		font: 600 0.8rem/1 'Public Sans', system-ui, sans-serif;
		text-decoration: none;
		box-shadow: 0 2px 10px rgba(29, 26, 20, 0.15);
	}

	.skip-link:focus {
		transform: none;
		outline: 2px solid var(--accent-light);
		outline-offset: 3px;
	}
</style>
