<script>
	let { children = () => {} } = $props();
</script>

<div class="bevel">
	{@render children()}
</div>

<style>
	.bevel {
		border-radius: var(--border-radius-tile);
		box-shadow: var(--external-shadow), var(--bevel-1);

		padding: var(--base-spacing);
		background-color: var(--colour-b-2);
	}
</style>
