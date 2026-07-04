<script>
	import '@fontsource/fraunces/700.css';
	import '@fontsource/fraunces/900.css';
	import '@fontsource/public-sans/400.css';
	import '@fontsource/public-sans/600.css';
	import '../app.css';
	import { onMount } from 'svelte';
	import { ui } from '$lib/state.svelte.js';
	import { surfaces, ink, series } from '$lib/palette.js';

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
	}`;

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		ui.reducedMotion = mq.matches;
		const onChange = (e) => (ui.reducedMotion = e.matches);
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});
</script>

<svelte:head>
	{@html `<style>${rootVars}</style>`}
</svelte:head>

<button
	class="reader-toggle no-print"
	aria-pressed={ui.readerMode}
	onclick={() => (ui.readerMode = !ui.readerMode)}
>
	{ui.readerMode ? 'Hide' : 'Read'} scene text
</button>

{@render children()}

<style>
	.reader-toggle {
		position: fixed;
		top: 0.75rem;
		right: 0.75rem;
		z-index: 100;
		font: 600 0.72rem/1 'Public Sans', system-ui, sans-serif;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-dark-primary);
		background: color-mix(in srgb, var(--ocean) 65%, transparent);
		border: 1px solid color-mix(in srgb, currentColor 35%, transparent);
		border-radius: 999px;
		padding: 0.55rem 0.9rem;
		cursor: pointer;
		backdrop-filter: blur(4px);
	}

	.reader-toggle:hover {
		border-color: currentColor;
	}
</style>
