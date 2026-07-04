<script>
	/**
	 * ScrollScene — the single scroll-orchestration abstraction.
	 *
	 * Wraps scrollama (one step per scene). The section is a tall scroll
	 * runway (`heightVh`); the visualization lives in a sticky full-viewport
	 * pin. `children` is a snippet called with { progress, active, data }:
	 *   - progress: 0–1, exact pin-relative progress (0 = pin engages at the
	 *     top of the runway, 1 = pin releases at the bottom)
	 *   - active:   scene is on screen — use it to gate rAF loops
	 *   - data:     the scene's JSON, lazy-loaded when the scene approaches
	 *     the viewport (never at page load)
	 * `prose` is the scene's prose equivalent: always in the accessibility
	 * tree, visually revealed by the global reader-mode toggle.
	 */
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import scrollama from 'scrollama';
	import { ui } from '$lib/state.svelte.js';

	let {
		id,
		title,
		heightVh = 300,
		surface = 'dark',
		pin = true,
		dataUrl = null,
		printable = false,
		ondata = null,
		children,
		prose = null
	} = $props();

	let el = $state(null);
	let progress = $state(0);
	let active = $state(false);
	let data = $state(null);
	let dataError = $state(false);

	function computeProgress() {
		// exact pin-relative progress from the runway's position
		const r = el.getBoundingClientRect();
		const total = r.height - window.innerHeight;
		progress = total > 0 ? Math.max(0, Math.min(1, -r.top / total)) : 1;
	}

	onMount(() => {
		const scroller = scrollama();
		scroller
			.setup({ step: el, offset: 0.5, progress: true, threshold: 4 })
			.onStepEnter(() => {
				active = true;
				computeProgress(); // a jump landing mid-scene must not read stale progress
			})
			.onStepExit(() => (active = false))
			.onStepProgress(computeProgress);
		// safety net: scrollama can drop a progress event on large jumps
		// (keyboard paging, anchor jumps); recompute on scroll while active
		let raf = 0;
		const onScroll = () => {
			if (!active || raf) return;
			raf = requestAnimationFrame(() => {
				raf = 0;
				computeProgress();
			});
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		const onResize = () => scroller.resize();
		window.addEventListener('resize', onResize);

		let io = null;
		if (dataUrl) {
			io = new IntersectionObserver(
				(entries) => {
					if (entries.some((e) => e.isIntersecting)) {
						io.disconnect();
						io = null;
						fetch(`${base}${dataUrl}`)
							.then((r) => {
								if (!r.ok) throw new Error(r.statusText);
								return r.json();
							})
							.then((d) => {
								data = d;
								ondata?.(d);
							})
							.catch(() => (dataError = true));
					}
				},
				{ rootMargin: '200% 0px' }
			);
			io.observe(el);
		}

		return () => {
			scroller.destroy();
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onResize);
			io?.disconnect();
		};
	});
</script>

<section
	bind:this={el}
	id="scene-{id}"
	class="scene surface-{surface}"
	class:printable
	class:no-print={!printable}
	style={pin ? `height:${heightVh}vh` : ''}
	aria-label={title}
>
	{#if prose}
		<div class="scene-prose" class:sr-only={!ui.readerMode} class:revealed={ui.readerMode}>
			{@render prose({ data })}
		</div>
	{/if}
	{#if pin}
		<div class="pin">
			{@render children({ progress, active, data })}
		</div>
	{:else}
		{@render children({ progress, active, data })}
	{/if}
	{#if dataError}
		<p class="data-error" role="alert">
			This scene’s data could not be loaded. The prose above tells the same story.
		</p>
	{/if}
</section>

<style>
	.data-error {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		font-size: 0.8rem;
		opacity: 0.8;
	}
</style>
