<script lang="js">
	let { canvasFn = () => {}, height = '', width = '', ...attrs } = $props();

	const style = `
        --height: ${height || '100vh'}; 
        --width: ${width || '100vw'};
    `;

	let canvas = $state();
	let mousePosition = $state({ x: 0, y: 0 });
	let mouseClick = $state({ x: 0, y: 0 });

	const handleMouseMove = (e) => {
		mousePosition.x = e.clientX;
		mousePosition.y = e.clientY;
	};

	const handleMouseClick = (e) => {
		mouseClick.x = e.clientX;
		mouseClick.y = e.clientY;
	};

	let w = $state(0);
	let h = $state(0);

	$effect(() => {
		canvasFn({ canvas, mousePosition, mouseClick, w, h });
	});
</script>

<svelte-css-wrapper {style}>
	<canvas
		bind:this={canvas}
		bind:clientWidth={w}
		bind:clientHeight={h}
		height={h}
		width={w}
		onmousemove={handleMouseMove}
		onclick={handleMouseClick}
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
