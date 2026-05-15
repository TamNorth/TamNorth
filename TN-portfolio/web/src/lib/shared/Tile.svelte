<script>
	let { children = () => {} } = $props();
</script>

<div class="tile">
	{@render children()}
</div>

<style>
	.tile {
		padding: var(--base-spacing);
		background-color: var(--colours-b2);
	}
</style>
