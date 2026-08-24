<script>
	/**
	 * ChapterNav — the reading rail, and the piece's only chrome.
	 *
	 * A nine-chapter scrollytelling piece is a long walk: forty-odd screens of
	 * pinned graphics with no way to see how far in you are, no way to go back
	 * to the chart you half-remember, and no way to skip ahead. A hairline
	 * progress bar answered "how far", badly, and nothing answered the rest.
	 *
	 * This is one element that does all three jobs: a hairline fill along the
	 * top edge, the name of the chapter you are in, and — on demand — a
	 * contents panel that jumps. It stays out of the way (hidden over the
	 * hero, collapsed to a 3px rule while reading) and it never animates
	 * anything the reader did not ask for.
	 *
	 * Anchors are the chapter headers (`id="ch-*"`, set in each scene) plus
	 * the two closing sections, so a jump always lands on a title rather than
	 * mid-pin.
	 */
	import { onMount } from 'svelte';
	import { ui } from '$lib/state.svelte.js';

	const CHAPTERS = [
		{ id: 'ch-1', n: 'One', name: 'The map' },
		{ id: 'ch-engine', n: '', name: 'The engine beneath' },
		{ id: 'ch-2', n: 'Two', name: 'The far ocean' },
		{ id: 'ch-3', n: 'Three', name: 'The rain' },
		{ id: 'ch-4', n: 'Four', name: 'The island' },
		{ id: 'ch-5', n: 'Five', name: 'The gardens' },
		{ id: 'ch-6', n: 'Six', name: 'The long record' },
		{ id: 'ch-7', n: 'Seven', name: 'The ledger' },
		{ id: 'ch-8', n: 'Eight', name: 'The watchers' },
		{ id: 'ch-9', n: 'Nine', name: 'Now' },
		{ id: 'ch-ask', n: '', name: 'The ask' },
		{ id: 'ch-record', n: '', name: 'The whole record' }
	];

	let p = $state(0);
	let shown = $state(false);
	let open = $state(false);
	let current = $state(-1);
	let nav = $state(null);

	const label = $derived(
		current < 0
			? ''
			: CHAPTERS[current].n
				? `Chapter ${CHAPTERS[current].n.toLowerCase()} · ${CHAPTERS[current].name.toLowerCase()}`
				: CHAPTERS[current].name
	);

	onMount(() => {
		let raf = 0;
		const update = () => {
			raf = 0;
			const total = document.documentElement.scrollHeight - window.innerHeight;
			p = total > 0 ? Math.min(1, window.scrollY / total) : 0;
			shown = window.scrollY > window.innerHeight * 0.5;

			// current chapter = the last anchor whose header has passed the
			// top of the viewport
			let seen = -1;
			for (let i = 0; i < CHAPTERS.length; i++) {
				const el = document.getElementById(CHAPTERS[i].id);
				if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.35) seen = i;
			}
			current = seen;
		};
		const onScroll = () => {
			if (!raf) raf = requestAnimationFrame(update);
		};
		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);

		const onKey = (e) => {
			if (e.key === 'Escape') open = false;
		};
		const onPointer = (e) => {
			if (open && nav && !nav.contains(e.target)) open = false;
		};
		window.addEventListener('keydown', onKey);
		window.addEventListener('pointerdown', onPointer);

		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			window.removeEventListener('keydown', onKey);
			window.removeEventListener('pointerdown', onPointer);
			cancelAnimationFrame(raf);
		};
	});

	function jump(id) {
		open = false;
		document.getElementById(id)?.scrollIntoView({ block: 'start' });
	}
</script>

<div class="rail no-print" class:shown aria-hidden="true">
	<div class="rail-fill" style:transform="scaleX({p})"></div>
</div>

{#if shown && !ui.noTap}
	<nav class="chapter-nav no-print" bind:this={nav} aria-label="Chapters">
		<button
			class="nav-toggle"
			aria-expanded={open}
			aria-controls="chapter-list"
			onclick={() => (open = !open)}
		>
			<span class="nav-mark" aria-hidden="true"></span>
			<span class="nav-label">{label || 'Contents'}</span>
		</button>

		<ul id="chapter-list" class="nav-list" hidden={!open}>
			{#each CHAPTERS as c, i (c.id)}
				<li>
					<button class="nav-item" class:here={i === current} onclick={() => jump(c.id)}>
						<span class="nav-n">{c.n || '—'}</span>
						<span>{c.name}</span>
					</button>
				</li>
			{/each}
		</ul>
	</nav>
{/if}

<style>
	.rail {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		z-index: 110;
		background: color-mix(in srgb, var(--ink-light-axis) 30%, transparent);
		opacity: 0;
		transition: opacity 0.4s ease;
		pointer-events: none;
	}

	.rail.shown {
		opacity: 1;
	}

	.rail-fill {
		height: 100%;
		background: var(--accent-light);
		transform-origin: 0 50%;
		will-change: transform;
	}

	.chapter-nav {
		position: fixed;
		top: max(0.75rem, env(safe-area-inset-top));
		left: max(0.75rem, env(safe-area-inset-left));
		z-index: 120;
	}

	.nav-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		min-height: 44px;
		max-width: min(20rem, 52vw);
		font: 600 0.72rem/1.2 'Public Sans', system-ui, sans-serif;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-light-primary);
		background: color-mix(in srgb, var(--paper-raised) 90%, transparent);
		border: 1px solid color-mix(in srgb, currentColor 35%, transparent);
		border-radius: 999px;
		padding: 0.55rem 0.95rem;
		cursor: pointer;
		backdrop-filter: blur(6px);
		box-shadow: 0 2px 10px rgba(29, 26, 20, 0.15);
	}

	.nav-toggle:hover {
		border-color: currentColor;
	}

	.nav-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* three stacked rules — a table of contents, at 10px */
	.nav-mark {
		flex: 0 0 auto;
		width: 12px;
		height: 8px;
		border-top: 2px solid currentColor;
		border-bottom: 2px solid currentColor;
		box-sizing: content-box;
	}

	.nav-list {
		list-style: none;
		margin: 0.5rem 0 0;
		padding: 0.4rem;
		width: 15rem;
		background: var(--paper-raised);
		border: 1px solid var(--ink-light-grid);
		border-radius: 12px;
		box-shadow: 0 18px 44px rgba(29, 26, 20, 0.18);
		max-height: min(70svh, 34rem);
		overflow-y: auto;
	}

	.nav-item {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		width: 100%;
		text-align: left;
		background: none;
		border: 0;
		border-radius: 8px;
		padding: 0.5rem 0.6rem;
		font: 400 0.88rem/1.3 'Public Sans', system-ui, sans-serif;
		color: var(--ink-light-secondary);
		cursor: pointer;
	}

	.nav-item:hover {
		background: color-mix(in srgb, var(--accent-light) 9%, transparent);
		color: var(--ink-light-primary);
	}

	.nav-item.here {
		color: var(--ink-light-primary);
		font-weight: 700;
	}

	.nav-n {
		flex: 0 0 3.1rem;
		font-size: 0.64rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-light-muted);
	}

	.nav-toggle:focus-visible,
	.nav-item:focus-visible {
		outline: 2px solid var(--accent-light);
		outline-offset: 2px;
	}

	@media (max-width: 560px) {
		.nav-toggle {
			max-width: 60vw;
			font-size: 0.66rem;
		}
	}
</style>
