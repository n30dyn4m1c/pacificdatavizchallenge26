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

{#if !ui.noTap}
	<button
		class="reader-toggle no-print"
		aria-pressed={ui.readerMode}
		onclick={() => (ui.readerMode = !ui.readerMode)}
	>
		{ui.readerMode ? 'Hide' : 'Read'} scene text
	</button>
{/if}

{@render children()}

<style>
	.reader-toggle {
		position: fixed;
		top: max(0.75rem, env(safe-area-inset-top));
		right: max(0.75rem, env(safe-area-inset-right));
		z-index: 100;
		display: inline-flex;
		align-items: center;
		min-height: 44px; /* tap-target floor */
		font: 600 0.72rem/1 'Public Sans', system-ui, sans-serif;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-light-primary);
		/* opaque enough to stay legible where it floats over scene headers */
		background: color-mix(in srgb, var(--paper-raised) 90%, transparent);
		border: 1px solid color-mix(in srgb, currentColor 35%, transparent);
		border-radius: 999px;
		padding: 0.55rem 0.9rem;
		cursor: pointer;
		backdrop-filter: blur(6px);
		box-shadow: 0 2px 10px rgba(29, 26, 20, 0.15);
	}

	.reader-toggle:hover {
		border-color: currentColor;
	}

	.reader-toggle:focus-visible {
		outline: 2px solid var(--accent-light);
		outline-offset: 3px;
	}
</style>
