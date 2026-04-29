<script lang="ts">
	import Page from '$lib/shared/Page.svelte';
	import Canvas2D from '$lib/shared/Canvas2D/Canvas2D.svelte';
	import Tile from '$lib/shared/Tile.svelte';
	import { fillShapes, outlineShapes, scaleVertex } from '$lib/shared/Canvas2D/utils.js';
	import { getHypotenuse, getIntersect, getLinearParams } from '$lib/utils/mathsUtils.js';
	import { untrack } from 'svelte';
	import useTheme from '$lib/hooks/useTheme.svelte.js';
	import { GridManager } from './engine.svelte.ts';

	const INITIAL_SCALE = 300;
	const DEFAULT_GRID_SIZE = 4;
	const POLYGON_SIDES = 4; //() => Math.floor(Math.random() * 3 + 4);
	const POLYGON_RADIUS = POLYGON_SIDES < 5 ? 0.65 : 0.6;

	/* DEFINITIONS */

	function getNearestVertex(mouseClick, vertices, scale, origin) {
		const startingVertexId = '0/0';
		const startingPos = scaleVertex(vertices[startingVertexId], scale, origin);
		const startingDistance = getHypotenuse(
			startingPos.x - mouseClick.x,
			startingPos.y - mouseClick.y
		);

		function loop(vertexId, currentDistance) {
			const [idY, idX] = vertexId.split('/').map((id) => Number(id));
			const neighbourIds = [1, 0.5, 0.3, 0.7]
				.reduce(
					(acc, delta) => [
						...acc,
						[idY + delta, idX],
						[idY - delta, idX],
						[idY, idX + delta],
						[idY, idX - delta],
						[idY + delta, idX + delta],
						[idY + delta, idX - delta],
						[idY - delta, idX - delta],
						[idY - delta, idX + delta]
					],
					[]
				)
				.map((id) => id.join('/'));

			const { id: closestNeighbour, distance: newDistance } = neighbourIds.reduce(
				(acc, id) => {
					if (!vertices[id]) return acc;
					const position = scaleVertex(vertices[id], scale, origin);
					const distance = getHypotenuse(position.x - mouseClick.x, position.y - mouseClick.y);
					if (distance < acc?.distance) return { id, distance };
					return acc;
				},
				{ id: vertexId, distance: currentDistance }
			);

			return closestNeighbour === vertexId ? vertexId : loop(closestNeighbour, newDistance);
		}

		return loop(startingVertexId, startingDistance);
	}

	function getNearestQuad(mouseClick, vertices, scale, origin) {
		const vertexId = getNearestVertex(mouseClick, vertices, scale, origin);
		const candidateQuads = gridManager.getQuadsFromVertex(vertexId);
		function checkIfInsideQuad(quad, mouseClick) {
			const quadLines = quad.map((vertexId, i) => {
				const j = (i + 1) % quad.length;
				const v1 = scaleVertex(vertices[vertexId], scale, origin);
				const v2 = scaleVertex(vertices[quad[j]], scale, origin);
				return getLinearParams(v1, v2);
			});

			const lineFromOrigin = getLinearParams({ x: 0, y: 0 }, mouseClick);

			const intersectingLines = quadLines.filter((line) => !!getIntersect(line, lineFromOrigin));
			return intersectingLines.length % 2 === 1;
		}

		return candidateQuads.find((quad) => checkIfInsideQuad(quad, mouseClick));
	}

	function paintQuad({ context, mousePos, vertices, scale, origin, colour, fillRule }) {
		const singleQuad = getNearestQuad(mousePos, vertices, scale, origin);
		const shape = { vertices: singleQuad?.map((vertexId) => vertices[vertexId]) };

		return (
			shape.vertices &&
			fillShapes({
				context,
				origin,
				shapes: [shape],
				scale,
				colour,
				fillRule
			})
		);
	}

	function paintQuadGroup({ context, mousePos, vertices, scale, origin, colour, fillRule }) {
		const nearestVertexId = getNearestVertex(mousePos, vertices, scale, origin);
		const selectedQuads = gridManager.getQuadsFromVertex(nearestVertexId);
		const shapes = selectedQuads?.map((quad) => {
			return { vertices: quad.map((vertexId) => vertices[vertexId]) };
		});

		return (
			shapes &&
			fillShapes({
				context,
				origin,
				shapes,
				scale,
				colour,
				fillRule
			})
		);
	}

	/* EXECUTION */

	let gridSize = $state(DEFAULT_GRID_SIZE);
	let scale = $derived(INITIAL_SCALE / gridSize);

	let gridManager = $derived(new GridManager(gridSize));
	let grid = $derived(gridManager.subscribeGrid());
	$inspect(grid);
	let { vertices: originalVertices, quads } = gridManager.makeHex();

	const canvasFn = ({ canvas, overlayCanvas, mousePosition, mouseClick, w, h, offset }) => {
		const mousePos = $derived({ x: mousePosition.x - offset.x, y: mousePosition.y - offset.y });
		let mouseClickPos = $derived(
			typeof mouseClick.x === 'number'
				? { x: mouseClick.x - offset.x, y: mouseClick.y - offset.y }
				: null
		);
		const context = $derived(canvas.getContext('2d'));
		const overlayContext = $derived(overlayCanvas.getContext('2d'));
		const origin = $derived({ x: w / 2, y: h / 2 });

		let newVertices = $state({});
		let vertices = $derived({ ...originalVertices, ...newVertices });

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

		$effect(() => {
			if (!mouseClickPos) return;

			const selectedVertexId = getNearestVertex(mouseClickPos, vertices, scale, origin);

			const relaxedVertices = gridManager.insertPolygon(
				selectedVertexId,
				POLYGON_RADIUS,
				POLYGON_SIDES
			);

			for (let vertexId in relaxedVertices) {
				if (relaxedVertices[vertexId]) newVertices[vertexId] = relaxedVertices[vertexId];
			}
		});

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
				vertices,
				scale,
				origin,
				colour: `${colourPositive}88`,
				fillRule
			});
			paintQuad({
				context: overlayContext,
				mousePos,
				vertices,
				scale,
				origin,
				colour: `${colourInfo}88`,
				fillRule
			});
		});

		$effect(() => {
			const watch = gridSize;
			newVertices = [];
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
