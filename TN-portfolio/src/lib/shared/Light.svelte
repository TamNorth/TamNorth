<script>
	let { children = () => {}, colour = 'red' } = $props();

	let active = $state(false);
	let lightColour = $state('');

	function rgb(red, green, blue) {
		return (
			(red & 0xf0 ? '#' : red & 0xf ? '#0' : '#00') +
			((red << 16) | (green << 8) | blue).toString(16)
		);
	}

	lightColour =
		colour === 'red'
			? rgb(255, 0, 0)
			: colour === 'green'
				? rgb(0, 255, 0)
				: colour === 'blue'
					? rgb(0, 255, 0)
					: colour === 'cyan'
						? rgb(0, 255, 255)
						: colour === 'yellow'
							? rgb(255, 255, 0)
							: colour === 'magenta'
								? rgb(255, 0, 255)
								: rgb(255, 255, 255);
</script>

<div
	class="light {active ? 'active' : ''}"
	onclick={() => (active = !active)}
	style="--light-base-colour: {lightColour};"
>
	{@render children()}
</div>

<style>
	.light {
		--light-base-colour: rgb(255, 0, 0);
		--light-bevel-size: 2px;
		--bevel-blur: var(--light-bevel-size);
		--light-colour: color-mix(in hsl, var(--light-base-colour) 75%, black);
		background-color: var(--light-colour);

		border-radius: 50%;
		box-shadow:
			var(--external-shadow),
			inset rgb(var(--inset-highlight-colour), 20%) calc(var(--light-bevel-size) * -1)
				var(--light-bevel-size) var(--bevel-blur) var(--light-bevel-size),
			inset rgb(0, 0, 0, 50%) var(--light-bevel-size) calc(var(--light-bevel-size) * -1)
				var(--bevel-blur) 0,
			inset rgb(0, 0, 0, 0.6) 0 0 20px 10px;

		/* padding: var(--base-spacing); */
		/* background-color: rgb(var(--light-colour)); */

		height: 3rem;
		width: 3rem;
		cursor: pointer;

		&.active {
			--light-colour: var(--light-base-colour);
			--external-shadow: color-mix(in hsl, var(--light-base-colour) 50%, transparent) 0 0 15px 5px;
		}
	}
</style>
