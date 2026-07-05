<script>
	/**
	 * CompareToggle — a two-option segmented control that swaps a
	 * visualization's data series. The default option is always the
	 * narratively-correct one: under ?notap=1 the control renders nothing
	 * and the visualization simply shows the default.
	 *
	 * Radiogroup semantics with roving tabindex; arrow keys move between
	 * options, Enter/Space selects the focused one.
	 */
	import { ui } from '$lib/state.svelte.js';

	let { label, options = [], value = $bindable(), idle = true } = $props();

	const index = $derived(Math.max(0, options.findIndex((o) => o.value === value)));

	let buttons = [];

	function select(i) {
		value = options[i].value;
	}

	function onKeydown(e, i) {
		const move = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
		if (move !== undefined) {
			e.preventDefault();
			const next = (i + move + options.length) % options.length;
			select(next);
			buttons[next]?.focus();
		} else if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			select(i);
		}
	}
</script>

{#if !ui.noTap}
	<div
		class="compare no-print"
		class:beat-idle-pulse={idle}
		role="radiogroup"
		aria-label={label}
	>
		{#each options as o, i (o.value)}
			<button
				bind:this={buttons[i]}
				class="seg beat-focus"
				role="radio"
				aria-checked={i === index}
				tabindex={i === index ? 0 : -1}
				onclick={() => select(i)}
				onkeydown={(e) => onKeydown(e, i)}
			>
				{o.label}
			</button>
		{/each}
		<span
			class="thumb"
			aria-hidden="true"
			style:transform="translateX({index * 100}%)"
			style:width="calc((100% - 8px) / {options.length})"
		></span>
	</div>
{/if}

<style>
	.compare {
		position: relative;
		display: inline-flex;
		padding: 4px;
		gap: 0;
		border: 1px solid color-mix(in srgb, var(--beat-accent) 45%, transparent);
		border-radius: 999px;
		background: color-mix(in srgb, var(--beat-surface) 82%, transparent);
	}

	.seg {
		position: relative;
		z-index: 1;
		min-height: 36px; /* + container padding ⇒ ≥44px total target height */
		min-width: 44px;
		font: 600 0.75rem/1.2 'Public Sans', system-ui, sans-serif;
		letter-spacing: 0.04em;
		padding: 0.45rem 0.95rem;
		border: none;
		border-radius: 999px;
		background: transparent;
		color: var(--beat-ink-2);
		cursor: pointer;
		transition: color 0.25s;
		flex: 1 1 0;
		white-space: nowrap;
	}

	.seg[aria-checked='true'] {
		color: var(--beat-ink);
	}

	.thumb {
		position: absolute;
		top: 4px;
		bottom: 4px;
		left: 4px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--beat-accent) 26%, var(--beat-surface));
		border: 1px solid var(--beat-accent);
		transition: transform 0.3s cubic-bezier(0.3, 0.9, 0.3, 1);
	}

	@media (prefers-reduced-motion: reduce) {
		.thumb {
			transition: none;
		}
	}
</style>
