<script lang="js">
	let { canvasFn = () => {}, height = '', width = '', customStyle } = $props();

	const style = `
        --height: ${height || '100vh'}; 
        --width: ${width || '100vw'};
		--position: ${height || width ? 'auto' : 'fixed'};
		${customStyle}
    `;

	let canvas = $state();
	let overlayCanvas = $state();
	let mousePosition = $state({ x: null, y: null });
	let mouseClick = $state({ x: null, y: null });
	const { x: xOffset, y: yOffset } = $derived(canvas?.getBoundingClientRect() || {});

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
		canvasFn({ canvas, overlayCanvas, mousePosition, mouseClick, w, h });
	});
</script>

<canvas
	bind:this={canvas}
	bind:clientWidth={w}
	bind:clientHeight={h}
	height={h}
	width={w}
	onmousemove={handleMouseMove}
	onclick={handleMouseClick}
	class="canvas"
	{style}
></canvas>
<canvas
	bind:this={overlayCanvas}
	height={h}
	width={w}
	class="overlay"
	style="--x-offset: {xOffset}px; --y-offset: {yOffset}px;"
></canvas>

<style>
	.canvas {
		position: var(--position);
		background-color: var(--background-colour-card);
		height: var(--height);
		width: var(--width);
	}
	.overlay {
		position: absolute;
		left: var(--x-offset);
		top: var(--y-offset);
		height: var(--height);
		width: var(--width);
		pointer-events: none;
	}
</style>
