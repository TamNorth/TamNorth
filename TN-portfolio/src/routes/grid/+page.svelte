<script lang="ts">
	import Page from '$lib/shared/Page.svelte';
	import Canvas2D from '$lib/shared/Canvas2D/Canvas2D.svelte';
	import Tile from '$lib/shared/Tile.svelte';
	import { untrack } from 'svelte';
	import useTheme from '$lib/hooks/useTheme.svelte.js';
	import { GridManager } from './gridManager.svelte.ts';
	import { CanvasManager } from './canvasManager.svelte.ts';
	import type { Coord, Vertex } from './types.ts';

	const INITIAL_SCALE = 75;
	const DEFAULT_GRID_SIZE = 4;
	const POLYGON_SIDES = 4; //() => Math.floor(Math.random() * 3 + 4);
	const POLYGON_RADIUS = POLYGON_SIDES < 5 ? 0.65 : 0.6;
	const {
		currentTheme: {
			baseColours: {
				// 'colour-warn': colourWarn,
				'colour-error': colourError,
				'colour-info': colourInfo,
				'colour-positive': colourPositive
			}
		}
	} = useTheme();

	/* DEFINITIONS */

	function canvasToGridPos(pos: Coord, scale: number, origin: Coord): Coord {
		return {
			x: (pos?.x - origin.x) / scale,
			y: (pos?.y - origin.y) / scale
		};
	}

	function applyOffset(pos: Coord, offset: Coord): Coord {
		return { x: pos.x - offset.x, y: pos.y - offset.y };
	}

	/* EXECUTION */

	let gridSize = $state(DEFAULT_GRID_SIZE);
	let gridManager = $derived(new GridManager(gridSize));
	let grid = $derived(gridManager.subscribeGrid());
	let scale = $state(INITIAL_SCALE);
	let currentGroupId = $state(1);

	const canvasFn = ({
		canvas,
		overlayCanvas,
		mousePosition,
		mouseClick,
		mouseWheel,
		w,
		h,
		offset
	}: {
		canvas: HTMLCanvasElement;
		overlayCanvas: HTMLCanvasElement;
		mousePosition: Coord;
		mouseClick: { x: number; y: number; button: number } | null;
		mouseWheel: number;
		w: number;
		h: number;
		offset: Coord;
	}) => {
		const origin = $derived({ x: w / 2, y: h / 2 });

		const canvasManager = new CanvasManager(canvas, INITIAL_SCALE / DEFAULT_GRID_SIZE, origin);
		const overlayCanvasManager = new CanvasManager(
			overlayCanvas,
			INITIAL_SCALE / DEFAULT_GRID_SIZE,
			origin
		);

		const scaleToGrid = (pos: Coord): Coord => canvasToGridPos(pos, canvasManager.scale, origin);
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

			function strokeRule({
				context,
				vertices
			}: {
				context: CanvasRenderingContext2D;
				vertices: Vertex[];
			}): void {
				const prevStrokeStyle = context.strokeStyle;

				if (vertices.some(({ locked, group }) => locked || group)) {
					context.strokeStyle = colourError;
					context.stroke();
					context.strokeStyle = prevStrokeStyle;
				} else {
					context.stroke();
				}
			}

			const gridShapes = Object.values(grid);

			if (gridShapes) canvasManager.outlineShapes(gridShapes, `${colourInfo}88`, strokeRule);
		});

		/* Highlight mouse position */

		$effect(() => {
			overlayCanvasManager.clearCanvas(w, h);

			function fillRule({
				context,
				vertices
			}: {
				context: CanvasRenderingContext2D;
				vertices: Vertex[];
			}): void {
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
			canvasManager.scaleCanvas(scale);
			overlayCanvasManager.scaleCanvas(scale);
		});

		$effect(() => {
			scale = (DEFAULT_GRID_SIZE * (INITIAL_SCALE + mouseWheel / 36.8)) / gridSize;
			untrack(() => {
				canvasManager.scaleCanvas(scale);
				overlayCanvasManager.scaleCanvas(scale);
			});
		});

		/* Mouse click effects */

		$effect(() => {
			if (mouseClick) {
				if (mouseClick.button === 0) {
					untrack(() => {
						const newId = gridManager.insertPolygon(
							mouseClickPos as Coord,
							`${currentGroupId}`,
							POLYGON_RADIUS,
							POLYGON_SIDES
						);
						if (newId) currentGroupId++;
					});
				}

				if (mouseClick.button === 2) {
					untrack(() => gridManager.eraseModifications(mouseClickPos as Coord, 1));
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
			Grid size: {gridSize}
			<input type="range" bind:value={gridSize} min="1" max="10" />
		</label>
	</Tile>
	<Tile>
		<label>
			Zoom: {Math.round((100 / INITIAL_SCALE) * scale)}%
			<input type="range" bind:value={scale} min="0" max={2 * INITIAL_SCALE} step="5" />
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
		gap: var(--base-spacing);

		label {
			display: flex;
			flex-direction: column;
			text-align: center;
			gap: var(--base-spacing);
		}
	}
</style>
