<script lang="ts">
	import Page from '$lib/shared/Page.svelte';
	import Canvas2D from '$lib/shared/Canvas2D/Canvas2D.svelte';
	import Tile from '$lib/shared/Tile.svelte';
	import { fillShapes, outlineShapes, scaleVertex } from '$lib/shared/Canvas2D/utils.js';
	import { untrack } from 'svelte';
	import useTheme from '$lib/hooks/useTheme.svelte.js';
	import { GridManager } from './engine.svelte.ts';

	const INITIAL_SCALE = 300;
	const DEFAULT_GRID_SIZE = 4;
	const POLYGON_SIDES = 4; //() => Math.floor(Math.random() * 3 + 4);
	const POLYGON_RADIUS = POLYGON_SIDES < 5 ? 0.65 : 0.6;

	/* DEFINITIONS */

	function paintQuad({ context, mousePos, scale, origin, colour, fillRule }) {
		const singleQuad = gridManager.getNearestQuad(mousePos, scale, origin);

		return (
			singleQuad &&
			fillShapes({
				context,
				origin,
				shapes: [singleQuad],
				scale,
				colour,
				fillRule
			})
		);
	}

	function paintQuadGroup({ context, mousePos, scale, origin, colour, fillRule }) {
		const selectedQuads = gridManager.getShapesFromVertex(mousePos);

		return (
			selectedQuads.length &&
			fillShapes({
				context,
				origin,
				shapes: selectedQuads,
				scale,
				colour,
				fillRule
			})
		);
	}

	function canvasToGridPos(pos, scale, origin) {
		return {
			x: (pos?.x - origin.x) / scale,
			y: (pos?.y - origin.y) / scale
		};
	}

	/* EXECUTION */

	let gridSize = $state(DEFAULT_GRID_SIZE);
	let scale = $derived(INITIAL_SCALE / gridSize);

	let gridManager = $derived(new GridManager(gridSize));
	let grid = $derived(gridManager.subscribeGrid());

	const canvasFn = ({ canvas, overlayCanvas, mousePosition, mouseClick, w, h, offset }) => {
		const origin = $derived({ x: w / 2, y: h / 2 });
		const mousePos = $derived(
			canvasToGridPos(
				{ x: mousePosition.x - offset.x, y: mousePosition.y - offset.y },
				scale,
				origin
			)
		);
		let mouseClickPos = $derived(
			typeof mouseClick.x === 'number'
				? canvasToGridPos({ x: mouseClick.x - offset.x, y: mouseClick.y - offset.y }, scale, origin)
				: null
		);
		const context = $derived(canvas.getContext('2d'));
		const overlayContext = $derived(overlayCanvas.getContext('2d'));

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

		/* PAINT CANVAS */

		$effect(() => {
			overlayContext.clearRect(0, 0, w, h);

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

			paintQuadGroup({
				context: overlayContext,
				mousePos,
				scale,
				origin,
				colour: `${colourPositive}88`,
				fillRule
			});
			paintQuad({
				context: overlayContext,
				mousePos,
				scale,
				origin,
				colour: `${colourInfo}88`,
				fillRule
			});
		});

		$effect(() => {
			if (mouseClickPos) gridManager.insertPolygon(mouseClickPos, POLYGON_RADIUS, POLYGON_SIDES);
		});

		$effect(() => {
			context.clearRect(0, 0, w, h);

			untrack(() => {
				// important! breaks reactivity dependency cycle in fitPolygon $effect
				mouseClickPos = null;
			});

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

			if (grid.length)
				outlineShapes({
					context,
					origin,
					shapes: grid,
					scale,
					colour: colourInfo,
					strokeRule
				});
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
