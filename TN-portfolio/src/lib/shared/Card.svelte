<script>
	let { children = () => {}, visible = true } = $props();

	const style = `
		--background-colour: ${visible ? '--background-colour-card' : 'none'}
	`;
</script>

<div class="card" {style}>
	{@render children()}
</div>

<style>
	.card {
		grid-column: 2;
		grid-row: 2;
		padding: var(--base-spacing);
		max-width: var(--page-width);
		background-color: var(--background-colour);
	}
</style>
