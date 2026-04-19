<script lang="js">
	import { onMount } from 'svelte';

	let { canvasFn = () => {}, height = '', width = '', ...attrs } = $props();

	const style = `
        --height: ${height || '100vh'}; 
        --width: ${width || '100vw'};
    `;

	let canvas = $state();
	let mousePosition = $state({ x: 0, y: 0 });
	const handleMouseMove = (e) => {
		mousePosition.x = e.clientX;
		mousePosition.y = e.clientY;
	};

	// let canvasHeight = $state()
	// let canvasWidth = $state()

	onMount(() => {
		canvasFn(canvas, mousePosition);
		// canvasHeight = window.innerHeight
		// canvasWidth = window.innerWidth
	});
</script>

<svelte-css-wrapper {style}>
	<canvas
		bind:this={canvas}
		// height={canvasHeight}
		// width={canvasWidth}
		onmousemove={handleMouseMove}
		{...attrs}
	></canvas>
</svelte-css-wrapper>

<style>
	canvas {
		border: solid var(--text-colour-base);
		position: fixed;
		background-color: var(--background-colour-card);
		height: var(--height);
		width: var(--width);
	}
</style>
