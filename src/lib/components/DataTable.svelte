<script>
	/** Collapsible data-table fallback that every chart links to. */
	let { caption, columns, rows } = $props();
</script>

<details class="data-table-details">
	<summary>View this chart’s data as a table</summary>
	<table>
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
</details>
