<script>
	let { children = () => {}, colour = 'red', onClick = () => {}, size = 2 } = $props();

	let active = $state(false);
	let lightColour = $state('');

	function getRgb(red, green, blue) {
		return (
			(red & 0xf0 ? '#' : red & 0xf ? '#0' : '#00') +
			((red << 16) | (green << 8) | blue).toString(16)
		);
	}

	const COLOUR_MAP = {
		grey: [30, 30, 30],
		red: [255, 0, 0],
		green: [0, 255, 0],
		blue: [0, 0, 255],
		cyan: [0, 255, 255],
		yellow: [0, 255, 255],
		magenta: [255, 0, 255]
	};

	$effect(() => (lightColour = getRgb(...(COLOUR_MAP[colour] ?? COLOUR_MAP['red']))));
</script>

<button
	type="button"
	class="clickable {active ? 'active' : ''}"
	onclick={onClick}
	style="--light-base-colour: {lightColour}; --size-factor: {size};"
>
	{@render children()}
</button>

<style>
	button {
		--light-base-colour: rgb(255, 0, 0);
		background-color: color-mix(in hsl, var(--light-base-colour) 75%, black);

		border-radius: 50%;
		box-shadow:
			var(--external-shadow),
			var(--bevel-2),
			inset rgb(0, 0, 0, 0.6) 0 0 20px 10px;

		height: calc(var(--base-spacing) * var(--size-factor));
		aspect-ratio: 1;

		&:active,
		&.active {
			background-color: var(--light-base-colour);
			--external-shadow: color-mix(in hsl, var(--light-base-colour) 50%, transparent) 0 0 15px 5px;
		}
	}
</style>
