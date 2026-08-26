<script>
	/**
	 * LazyLines — code-split wrapper around AnnualLines. The chart (and the
	 * d3-scale/shape modules it pulls) ship in their own chunk, dynamically
	 * imported only when a chart scene actually mounts one — never in the
	 * initial page bundle. A sized skeleton (not a spinner) holds the space
	 * so the swap-in causes no layout shift. Props are forwarded verbatim.
	 */
	import { onMount } from 'svelte';

	let props = $props();
	let Chart = $state(null);
	let failed = $state(false);

	onMount(() => {
		import('./AnnualLines.svelte')
			.then((m) => (Chart = m.default))
			.catch(() => (failed = true));
	});
</script>

{#if Chart}
	<Chart {...props} />
{:else if failed}
	<p class="chart-failed">This chart could not be loaded — the prose and the data table tell the same story.</p>
{:else}
	<div class="chart-skeleton" style:height="{props.height ?? 340}px" aria-hidden="true"></div>
{/if}
