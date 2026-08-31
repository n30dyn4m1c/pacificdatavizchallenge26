<script>
	/**
	 * Data-table fallback that every chart's prose equivalent carries.
	 * Deliberately a plain table with no toggle of its own: it renders
	 * inside ScrollScene's prose layer, which is visually hidden (sr-only)
	 * but fully readable by assistive technology — so nothing here may be
	 * focusable, or keyboard users would tab into invisible controls.
	 */
	let { caption, columns, rows } = $props();
</script>

<table class="data-table">
	<caption class="sr-only">{caption}</caption>
	<thead>
		<tr>
			{#each columns as c (c)}
				<th scope="col">{c}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each rows as row, i (i)}
			<tr>
				{#each row as cell, j (j)}
					<td>{cell}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.data-table {
		border-collapse: collapse;
		width: 100%;
		max-width: 44rem;
		font-size: 0.8rem;
		margin-top: 0.5rem;
	}

	th,
	td {
		text-align: left;
		padding: 0.25rem 0.6rem 0.25rem 0;
		border-bottom: 1px solid color-mix(in srgb, currentColor 20%, transparent);
		font-variant-numeric: tabular-nums;
	}
</style>
