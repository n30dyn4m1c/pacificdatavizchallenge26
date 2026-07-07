<script>
	/**
	 * LazyMirror — code-split wrapper around MirrorBars (the reveal). Same
	 * contract as LazyLines: the chart chunk loads only when the scene mounts
	 * it, with a sized skeleton holding the space until then.
	 */
	import { onMount } from 'svelte';

	let props = $props();
	let Chart = $state(null);

	onMount(() => {
		import('./MirrorBars.svelte').then((m) => (Chart = m.default));
	});
</script>

{#if Chart}
	<Chart {...props} />
{:else}
	<div class="chart-skeleton" style:height="{props.height ?? 470}px" aria-hidden="true"></div>
{/if}
