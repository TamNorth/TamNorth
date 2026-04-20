<script>
	let { children = () => {}, href = '/' } = $props();
</script>

<div class="bevel">
	{@render children()}
</div>

<style>
	.bevel {
		--light-direction-x: -3px;
		--light-direction-y: 3px;
		--external-shadow: rgb(0, 0, 0, 50%) var(--light-direction-x) var(--light-direction-y) 5px 1px;

		--inset-highlight-colour: 255, 200, 150;
		--bevel-size: 2px;
		--bevel-blur: var(--bevel-size);

		border-radius: calc(var(--bevel-size) * 0.5);
		box-shadow:
			var(--external-shadow),
			inset rgb(var(--inset-highlight-colour), 20%) calc(var(--bevel-size) * -1) var(--bevel-size)
				var(--bevel-blur) 0,
			inset rgb(0, 0, 0, 50%) var(--bevel-size) calc(var(--bevel-size) * -1) var(--bevel-blur) 0;

		padding: var(--base-spacing);
		background-color: var(--background-colour-tile);
	}
</style>
