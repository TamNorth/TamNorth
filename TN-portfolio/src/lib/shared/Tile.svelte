<script>
	let { children = () => {} } = $props();
</script>

<div class="container">
	{@render children()}
</div>

<style>
	div {
		padding: var(--base-spacing);
		background-color: var(--colours-b2);
	}
</style>
