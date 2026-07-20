<script>
	/**
	 * ScrollProgress — a hairline reading rail fixed to the top edge: how far
	 * into the story the reader is, sensed rather than read. Solid accent (the
	 * piece's neutral narrative accent, not an ENSO arm), rAF-throttled, and
	 * hidden until the reader leaves the hero so the opening screen stays
	 * clean. Purely decorative (aria-hidden); wayfinding only.
	 */
	import { onMount } from 'svelte';

	let p = $state(0);
	let shown = $state(false);

	onMount(() => {
		let raf = 0;
		const update = () => {
			raf = 0;
			const total = document.documentElement.scrollHeight - window.innerHeight;
			p = total > 0 ? Math.min(1, window.scrollY / total) : 0;
			shown = window.scrollY > window.innerHeight * 0.5;
		};
		const onScroll = () => {
			if (!raf) raf = requestAnimationFrame(update);
		};
		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			cancelAnimationFrame(raf);
		};
	});
</script>

<div class="progress-rail no-print" class:shown aria-hidden="true">
	<div class="progress-fill" style:transform="scaleX({p})"></div>
</div>

<style>
	.progress-rail {
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

	.progress-rail.shown {
		opacity: 1;
	}

	.progress-fill {
		height: 100%;
		background: var(--accent-light);
		transform-origin: 0 50%;
		will-change: transform;
	}
</style>
