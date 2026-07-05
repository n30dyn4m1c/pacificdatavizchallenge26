<script>
	/**
	 * Hotspot — the pop-up-book primitive. A dot anchored at (x%, y%)
	 * inside a position:relative stage; tapping opens a compact card
	 * pointing at the spot (on narrow viewports the card anchors to the
	 * bottom of the screen instead of floating). Enrichment only — renders
	 * nothing under ?notap=1.
	 *
	 * `group` is a shared $state({ open: null }) so only one card in a
	 * stage is ever open. `pulse` turns on the shared invite animation
	 * (the parent decides when — e.g. after the reader has been idle).
	 */
	import { dismissable } from './dismiss.js';
	import { ui } from '$lib/state.svelte.js';

	let {
		id,
		x = 50,
		y = 50,
		label,
		group = undefined,
		pulse = false,
		children
	} = $props();

	// standalone fallback group when none is provided
	let ownGroup = $state({ open: null });
	const g = $derived(group ?? ownGroup);

	const open = $derived(g.open === id);
	let button = $state(null);

	function toggle() {
		g.open = open ? null : id;
	}
	function dismiss() {
		g.open = null;
		button?.focus();
	}

	// card side: point down at the spot when the spot sits low, and vice versa
	const side = $derived(y > 52 ? 'above' : 'below');
	const hAlign = $derived(x < 33 ? 'left' : x > 67 ? 'right' : 'center');
</script>

{#if !ui.noTap}
	<div
		class="spot no-print"
		style:left="{x}%"
		style:top="{y}%"
		use:dismissable={{ active: open, onDismiss: dismiss }}
	>
		<button
			bind:this={button}
			class="dot-btn beat-focus"
			aria-expanded={open}
			aria-controls="{id}-card"
			onclick={toggle}
		>
			<span class="dot" class:beat-idle-pulse={pulse && !open} aria-hidden="true"></span>
			<span class="sr-only">{label}</span>
		</button>

		<!-- persistent polite live region: card content is announced on open -->
		<div class="card-region" aria-live="polite">
			{#if open}
				<div class="card-pos side-{side} h-{hAlign}" id="{id}-card" role="region" aria-label={label}>
					<div class="beat-card hotspot-card">
						{@render children()}
					</div>
					<span class="arrow" aria-hidden="true"></span>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.spot {
		position: absolute;
		width: 0;
		height: 0;
	}

	/* 44×44 target around a small visible dot */
	.dot-btn {
		position: absolute;
		left: -22px;
		top: -22px;
		width: 44px;
		height: 44px;
		display: grid;
		place-items: center;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.dot {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: color-mix(in srgb, var(--beat-accent) 85%, white);
		border: 2px solid color-mix(in srgb, var(--beat-surface) 80%, white);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--beat-accent) 35%, transparent);
		transition: transform 0.25s;
	}

	.dot-btn:hover .dot,
	.dot-btn[aria-expanded='true'] .dot {
		transform: scale(1.25);
	}

	.card-pos {
		position: absolute;
		width: min(19rem, 62vw);
		z-index: 30;
	}

	.side-above {
		bottom: 18px;
	}

	.side-below {
		top: 18px;
	}

	.h-center {
		left: 0;
		transform: translateX(-50%);
	}

	.h-left {
		left: -14px;
	}

	.h-right {
		right: -14px;
	}

	.hotspot-card {
		font-size: 0.85rem;
	}

	/* pointer arrow toward the dot */
	.arrow {
		position: absolute;
		width: 10px;
		height: 10px;
		background: var(--beat-surface);
		border: 1px solid var(--beat-line);
		transform: rotate(45deg);
	}

	.side-above .arrow {
		bottom: -5px;
		border-top: none;
		border-left: none;
	}

	.side-below .arrow {
		top: -5px;
		border-bottom: none;
		border-right: none;
	}

	.h-center .arrow {
		left: calc(50% - 5px);
	}

	.h-left .arrow {
		left: 10px;
	}

	.h-right .arrow {
		right: 10px;
	}

	/* narrow viewports: the card anchors to the bottom of the viewport so it
	   never covers the element it describes */
	@media (max-width: 640px) {
		.card-pos,
		.side-above,
		.side-below {
			position: fixed;
			inset: auto 0 0 0;
			width: auto;
			transform: none;
			z-index: 60;
		}

		.hotspot-card {
			border-radius: 12px 12px 0 0;
			border-left-width: 1px;
			border-top: 3px solid var(--beat-accent);
			padding-bottom: max(1rem, env(safe-area-inset-bottom));
		}

		.arrow {
			display: none;
		}
	}
</style>
