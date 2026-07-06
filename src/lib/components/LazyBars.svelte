<script>
	/**
	 * LazyBars — code-split wrapper around AnnualBars (scene 3). Same contract
	 * as LazyLines: the chart chunk loads only when the scene mounts it, with
	 * a sized skeleton holding the space until then.
	 */
	import { onMount } from 'svelte';

	let props = $props();
	let Chart = $state(null);

	onMount(() => {
		import('./AnnualBars.svelte').then((m) => (Chart = m.default));
	});
</script>

{#if Chart}
	<Chart {...props} />
{:else}
	<div class="chart-skeleton" style:height="{props.height ?? 360}px" aria-hidden="true"></div>
{/if}
