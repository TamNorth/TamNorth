<script>
	let { children = () => {} } = $props();
</script>

<div class="bevel">
	{@render children()}
</div>

<style>
	.bevel {
		border-radius: var(--bevel-border-radius-tile);
		box-shadow: var(--bevel-external-shadow), var(--bevel-1);

		padding: var(--base-spacing);
		background-color: var(--colours-b-2);
	}
</style>
