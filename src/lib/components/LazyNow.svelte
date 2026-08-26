<script>
	/**
	 * LazyNow — code-split wrapper around NinoMonths (chapter nine). Same
	 * contract as LazyEnso: the chart chunk loads only when the scene mounts
	 * it, with a sized skeleton holding the space until then.
	 */
	import { onMount } from 'svelte';

	let props = $props();
	let Chart = $state(null);
	let failed = $state(false);

	onMount(() => {
		import('./NinoMonths.svelte')
			.then((m) => (Chart = m.default))
			.catch(() => (failed = true));
	});
</script>

{#if Chart}
	<Chart {...props} />
{:else if failed}
	<p class="chart-failed">This chart could not be loaded — the prose and the data table tell the same story.</p>
{:else}
	<div class="chart-skeleton" style:height="{props.height ?? 470}px" aria-hidden="true"></div>
{/if}
