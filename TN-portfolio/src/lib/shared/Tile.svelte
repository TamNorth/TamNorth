<script>
	let { children = () => {}, style = '' } = $props();
</script>

<div class="tile" {style}>
	{@render children()}
</div>

<style>
	.tile {
		display: flex;
		gap: var(--base-spacing);
		padding: var(--base-spacing);
		background-color: var(--background-colour-tile);
	}
</style>
