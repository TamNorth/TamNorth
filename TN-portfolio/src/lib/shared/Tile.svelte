<script>
	let { children = () => {} } = $props();
</script>

<div class="bevel">
	{@render children()}
</div>

<style>
	.bevel {
		--shadow-length: 2px;
		--shadow-direction-x: -1;
		--shadow-direction-y: 1;
		--external-shadow:
			rgb(0, 0, 0, 50%) calc(var(--shadow-length) * var(--shadow-direction-x))
				calc(var(--shadow-length) * var(--shadow-direction-y)) 3px 0,
			rgb(0, 0, 0, 50%) 0 0 1px 1px;

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
