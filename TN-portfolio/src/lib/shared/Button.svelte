<script>
	let { children = () => {}, onClick = () => {} } = $props();
</script>

<button onclick={onClick}>
	{@render children()}
</button>

<style>
	button {
		padding: var(--base-spacing);
		background-color: var(--background-colour-button);
		cursor: pointer;
	}
</style>
