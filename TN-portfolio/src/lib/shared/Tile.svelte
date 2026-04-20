<script>
	let { children = () => {} } = $props();
</script>

<div class="bevel">
	{@render children()}
</div>

<style>
	.bevel {
		border-radius: var(--border-radius-tile);
		box-shadow: var(--bevel-and-shadow);

		padding: var(--base-spacing);
		background-color: var(--background-colour-tile);
	}
</style>
