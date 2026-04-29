<script lang="ts">
	import Page from '$lib/shared/Page.svelte';
	import Canvas2D from '$lib/shared/Canvas2D/Canvas2D.svelte';
	import Tile from '$lib/shared/Tile.svelte';
	import { fillShapes, outlineShapes, scaleVertex } from '$lib/shared/Canvas2D/utils.js';
	import { untrack } from 'svelte';
	import useTheme from '$lib/hooks/useTheme.svelte.js';
	import { GridManager } from './gridManager.svelte.ts';
	import { CanvasManager } from './canvasManager.svelte.ts';

	const INITIAL_SCALE = 300;
	const DEFAULT_GRID_SIZE = 4;
	const POLYGON_SIDES = 4; //() => Math.floor(Math.random() * 3 + 4);
	const POLYGON_RADIUS = POLYGON_SIDES < 5 ? 0.65 : 0.6;
	const {
		currentTheme: {
			baseColours: {
				'colour-warn': colourWarn,
				'colour-error': colourError,
				'colour-info': colourInfo,
				'colour-positive': colourPositive
			}
		}
	} = useTheme();

	/* DEFINITIONS */

	function canvasToGridPos(pos, scale, origin) {
		return {
			x: (pos?.x - origin.x) / scale,
			y: (pos?.y - origin.y) / scale
		};
	}

	function applyOffset(pos, offset) {
		return { x: pos.x - offset.x, y: pos.y - offset.y };
	}

	/* EXECUTION */

	let gridSize = $state(DEFAULT_GRID_SIZE);
	let gridManager = $derived(new GridManager(gridSize));
	let grid = $derived(gridManager.subscribeGrid());

	const canvasFn = ({
		canvas,
		overlayCanvas,
		mousePosition,
		mouseClick,
		mouseWheel,
		w,
		h,
		offset
	}) => {
		const origin = $derived({ x: w / 2, y: h / 2 });

		const canvasManager = new CanvasManager(canvas, INITIAL_SCALE / DEFAULT_GRID_SIZE, origin);
		const overlayCanvasManager = new CanvasManager(
			overlayCanvas,
			INITIAL_SCALE / DEFAULT_GRID_SIZE,
			origin
		);

		const scaleToGrid = (pos) => canvasToGridPos(pos, canvasManager.scale, origin);
		const mousePos = $derived(scaleToGrid(applyOffset(mousePosition, offset)));
		let mouseClickPos = $derived(mouseClick ? scaleToGrid(applyOffset(mouseClick, offset)) : null);

		/* PAINT CANVAS */

		/* Draw grid */

		$effect(() => {
			canvasManager.clearCanvas(w, h);
			// untrack(() => {
			// 	// important! breaks reactivity dependency cycle in fitPolygon $effect
			// 	mouseClickPos = null;
			// });

			function strokeRule({ context, vertices }) {
				const prevStrokeStyle = context.strokeStyle;

				if (vertices.some(({ locked, group }) => locked || group)) {
					context.strokeStyle = colourError;
					context.stroke();
					context.strokeStyle = prevStrokeStyle;
				} else {
					context.stroke();
				}
			}

			if (grid.length) canvasManager.outlineShapes(grid, `${colourInfo}88`, strokeRule);
		});

		/* Highlight mouse position */

		$effect(() => {
			overlayCanvasManager.clearCanvas(w, h);

			function fillRule({ context, vertices }) {
				const prevFillStyle = context.fillStyle;

				if (vertices.some(({ locked, group }) => locked || group)) {
					context.fillStyle = `${colourError}88`;
					context.fill();
					context.fillStyle = prevFillStyle;
				} else {
					context.fill();
				}
			}

			const multiQuads = gridManager.getShapesFromPosition(mousePos, 1);

			if (multiQuads) overlayCanvasManager.fillShapes(multiQuads, `${colourPositive}88`, fillRule);

			const singleQuad = gridManager.getShapesFromPosition(mousePos);

			if (singleQuad) overlayCanvasManager.fillShapes(singleQuad, `${colourInfo}88`, fillRule);
		});

		/* Zoom on mouse wheel */

		$effect(() => {
			const zoom = (INITIAL_SCALE + mouseWheel / 20) / gridSize;
			canvasManager.scaleCanvas(zoom);
			overlayCanvasManager.scaleCanvas(zoom);
		});

		/* Mouse click effects */

		$effect(() => {
			if (mouseClickPos) {
				if (mouseClick.button === 0) {
					untrack(() => {
						gridManager.insertPolygon(mouseClickPos, POLYGON_RADIUS, POLYGON_SIDES);
					});
				}

				if (mouseClick.button === 2) {
					untrack(() => gridManager.eraseModifications(mouseClickPos, 1));
				}

				mouseClickPos = null;
			}
		});
	};
</script>

<Page><Canvas2D {canvasFn} height="100vh" width="40rem" customStyle="grid-column: 2;" /></Page>

<div class="toolbar">
	<Tile>
		<label>
			<input type="range" bind:value={gridSize} min="1" max="10" />
			Grid size: {gridSize}
		</label>
	</Tile>
</div>

<style>
	.toolbar {
		position: fixed;
		right: 0;
		margin: var(--header-height) var(--base-spacing) 0;
		display: flex;
		flex-direction: column;
	}
</style>
