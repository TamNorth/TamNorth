<script>
	let { children = () => {} } = $props();
</script>

<div class="card">
	{@render children()}
</div>

<style>
	.card {
		grid-column: 2;
		grid-row: 2;
		padding: var(--base-spacing);
		max-width: var(--page-width);
		background-color: var(--background-colour-card);
	}
</style>
