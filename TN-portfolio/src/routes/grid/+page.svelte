<script lang="ts">
	import Page from '$lib/shared/Page.svelte';
	import Canvas2D from '$lib/shared/Canvas2D/Canvas2D.svelte';
	import { fillShapes, outlineShapes, scaleVertex } from '$lib/shared/Canvas2D/utils.js';
	import Tile from '$lib/shared/Tile.svelte';
	import { getIntersect, getLinearParams } from '$lib/utils/mathsUtils.js';

	const INITIAL_SCALE = 300;
	const DEFAULT_GRID_SIZE = 4;

	/* RELAXATION PARAMS */
	const SPRING_LENGTH = 0.2;
	const SPRING_STRENGTH = 0.2;
	const RELAXATION_PASSES = 5;

	/* DEFINITIONS */

	const fillWithCount = (array: number[], start: number = 0) =>
		array.fill(0).map((_, i) => i + start);

	function getHexgridTriangles(size: number) {
		const getStart = (rowNumber: number) => Math.abs(rowNumber) - 2 * size + 0.5;
		const numOfRows = size * 2;
		const rowNums = fillWithCount(Array(numOfRows), -size).map((rowNum) => rowNum + 0.5);

		const triangleCentres = rowNums.reduce((acc, rowNum) => {
			const rowLength = 2 * (2 * size - Math.abs(rowNum));
			const rowStart = getStart(rowNum);
			const xValues = fillWithCount(Array(rowLength), rowStart);
			return [...acc, ...xValues.reduce((acc, val) => [...acc, { x: val, y: rowNum }], [])];
		}, []);

		function drawTriangle(pointsUp, centreCoord) {
			const { x, y } = centreCoord;

			// To-do: deal with magic numbers
			const xScale = 1;
			const yScale = 0.5;

			const v1 = {
				x: x,
				y: pointsUp ? y - yScale : y + yScale
			};
			const v2 = {
				x: x + xScale,
				y: pointsUp ? y + yScale : y - yScale
			};
			const v3 = {
				x: x - xScale,
				y: pointsUp ? y + yScale : y - yScale
			};

			return [v1, v2, v3];
		}

		let triangleIndex = 0;
		let rowIndex = 0;

		return triangleCentres.reduce((acc, { x, y }) => {
			// if first triangle in row, reset index to 0
			if (y !== rowIndex) {
				rowIndex = y;
				triangleIndex = 0;
			}

			const id = { y: Math.sign(y) > 0 ? y + 0.5 : y - 0.5, x };

			// check if triangle should point up or down
			const isOdd = !!(triangleIndex % 2);
			const pointsUp = Math.sign(y) < 0 ? !isOdd : isOdd;

			const triangle = drawTriangle(pointsUp, { x, y });

			triangleIndex++;

			return [...acc, { id, vertices: triangle, pointsUp }];
		}, []);
	}

	function mergeShapes(shapes, _remainingIndices: number[] = [], _mergedShapes = []) {
		// const shapesCopy = structuredClone(shapes)
		_remainingIndices = _remainingIndices.length
			? _remainingIndices
			: fillWithCount(Array(shapes.length));
		const selectorNum = Math.floor(Math.random() * _remainingIndices.length);
		const t1Index = _remainingIndices[selectorNum];

		const t1 = shapes[t1Index];
		const {
			pointsUp,
			id: { x: x1, y: y1 }
		} = t1;

		function selectPartner(previousTries = []) {
			if (previousTries.length >= 3) return {};
			const directionMap = ['right', 'left', t1.pointsUp ? 'down' : 'up'].filter(
				(direction) => !previousTries.includes(direction)
			);
			const directionNum = Math.floor(Math.random() * directionMap.length);
			const direction = directionMap[directionNum];

			const x2 = direction === 'right' ? x1 + 1 : direction === 'left' ? x1 - 1 : x1;
			const y2 = direction === 'down' ? y1 + 1 : direction === 'up' ? y1 - 1 : y1;

			const t2Index = shapes.findIndex(({ id }) => id.x === x2 && id.y === y2);

			return t2Index !== -1 && _remainingIndices.includes(t2Index)
				? { t2: shapes[t2Index], t2Index, direction }
				: selectPartner([...previousTries, direction]);
		}

		const { t2, t2Index, direction } = selectPartner();

		if (!t2) {
			const newRemainingIndices = _remainingIndices.filter((index) => index != t1Index);
			return newRemainingIndices.length
				? mergeShapes(shapes, newRemainingIndices, [..._mergedShapes, t1.vertices])
				: [..._mergedShapes, t1.vertices];
		}

		const [t1v1, t1v2, t1v3] = t1.vertices;
		const [t2v1, t2v2, t2v3] = t2.vertices;

		const mergedVertices = (() => {
			switch (direction) {
				case 'left':
					return pointsUp ? [t2v3, t1v1, t1v2, t1v3] : [t1v3, t1v2, t1v1, t2v3];
				case 'right':
					return pointsUp ? [t1v1, t2v2, t1v2, t1v3] : [t1v3, t1v2, t2v2, t1v1];
				case 'up':
					return [t2v1, t1v2, t1v1, t1v3];
				case 'down':
					return [t1v1, t1v2, t2v1, t1v3];
			}
		})();

		const newRemainingIndices = _remainingIndices.filter(
			(index) => ![t1Index, t2Index].includes(index)
		);

		return newRemainingIndices.length
			? mergeShapes(shapes, newRemainingIndices, [..._mergedShapes, mergedVertices])
			: [..._mergedShapes, mergedVertices];
	}

	function interpolate(shapes, size) {
		const { vertices, edges, quads } = shapes.reduce(
			(acc, shape) => {
				let { mX, mY } = shape.reduce(
					(acc, { x, y }) => {
						acc.mX += x / shape.length;
						acc.mY += y / shape.length;
						return acc;
					},
					{ mX: 0, mY: 0 }
				);
				mX = mX.toFixed(1);
				mY = mY.toFixed(1);
				const middleVertexId = `${mX}/${mY}`;
				acc.vertices[middleVertexId] = { x: mX, y: mY };

				for (let i0 = 0; i0 < shape.length; i0++) {
					const i2 = (i0 + 1) % shape.length;
					const i4 = (i0 + shape.length - 1) % shape.length;
					const { x: x0, y: y0 } = shape[i0];
					const { x: x2, y: y2 } = shape[i2];
					const { x: x4, y: y4 } = shape[i4];
					const { x1, y1 } = {
						x1: (x0 + x2) / 2,
						y1: (y0 + y2) / 2
					};
					const { x3, y3 } = {
						x3: (x0 + x4) / 2,
						y3: (y0 + y4) / 2
					};

					const verticesToAdd = {
						[`${x0}/${y0}`]: { x: x0, y: y0 },
						[`${x1}/${y1}`]: { x: x1, y: y1 },
						[middleVertexId]: { x: mX, y: mY },
						[`${x3}/${y3}`]: { x: x3, y: y3 }
					};

					Object.entries(verticesToAdd).forEach(([id, value]) => {
						const xDistance = Math.abs(value.x);
						const yDistance = Math.abs(value.y);
						const isBoundaryVertex = yDistance === size || xDistance + yDistance === 2 * size;
						if (!acc.vertices[id])
							acc.vertices[id] = isBoundaryVertex ? { ...value, locked: true } : value;
					});

					const gridQuad = [];

					function registerEdge(end1Id, end2Id) {
						gridQuad.push(end1Id);
						const orderedIds = [end1Id, end2Id].sort();
						const edgeId = `${orderedIds[0]}//${orderedIds[1]}`;
						if (!acc.edges[edgeId]) {
							acc.edges[edgeId] = orderedIds;
						}
					}

					const vertexIds = Object.keys(verticesToAdd);

					for (let j = 0; j < vertexIds.length; j++) {
						const k = (j + 1) % vertexIds.length;
						registerEdge(vertexIds[j], vertexIds[k]);
					}

					acc.quads = [...acc.quads, gridQuad];
				}

				return acc;
			},
			{ vertices: {}, edges: {}, quads: [] }
		);

		return { vertices, edges: Object.values(edges), quads };
	}

	function normaliseGrid(vertices) {
		const xScalingFactor = 0.5;
		const yScalingFactor = Math.sin(Math.PI * (2 / 3));

		let newVertices = {};

		for (let vertex in vertices) {
			newVertices[vertex] = {
				...vertices[vertex],
				x: vertices[vertex].x * xScalingFactor,
				y: vertices[vertex].y * yScalingFactor
			};
		}

		return newVertices;
	}

	function getHypotenuse(dX, dY) {
		return Math.sqrt(Math.pow(dY, 2) + Math.pow(dX, 2));
	}

	function getVertexForces({ vertices, edges }) {
		const springLength = SPRING_LENGTH;

		const unresolvedForces = edges.reduce((acc, [v1, v2]) => {
			const [end1, end2] = [vertices[v1], vertices[v2]];
			const dY = end1.y - end2.y; // positive if end1 is lower
			const dX = end1.x - end2.x; // positive if end1 is to the right

			const bearing = Math.atan2(dY, dX);
			const length = getHypotenuse(dX, dY);
			const tension = length - springLength;

			const tensionY = tension * Math.sin(bearing);
			const tensionX = tension * Math.cos(bearing);

			if (!acc[v1]) acc[v1] = [];
			if (!acc[v2]) acc[v2] = [];

			acc[v1] = [...acc[v1], { tensionY: -tensionY, tensionX: -tensionX }];
			acc[v2] = [...acc[v2], { tensionY: tensionY, tensionX: tensionX }];
			return acc;
		}, {});

		function resolveForces(vertex) {
			return vertex.reduce(
				(acc, { tensionY, tensionX }) => ({
					y: acc.y + tensionY,
					x: acc.x + tensionX
				}),
				{ x: 0, y: 0 }
			);
		}

		return Object.entries(unresolvedForces).reduce(
			(acc, [id, vertex]) => ({ ...acc, [id]: resolveForces(vertex) }),
			{}
		);
	}

	function relaxGrid({ vertices, edges }, stepNum = 1) {
		const springStrength = SPRING_STRENGTH;

		const newVertices = structuredClone(vertices);

		for (let i = 0; i < stepNum; i++) {
			const vertexForces = getVertexForces({ vertices: newVertices, edges });

			for (let vertexId in newVertices) {
				let vertex = newVertices[vertexId];
				if (!vertex.locked) {
					vertex.x += vertexForces[vertexId].x * springStrength;
					vertex.y += vertexForces[vertexId].y * springStrength;
				}
			}
		}

		return newVertices;
	}

	function getEdgeCoords({ vertices, edges }) {
		return edges.map(([v1, v2]) => ({ vertices: [vertices[v1], vertices[v2]] }));
	}

	function makeHex(gridSize) {
		const shapes = getHexgridTriangles(gridSize);

		const mergedShapes = mergeShapes(shapes);
		const { vertices, edges, quads } = interpolate(mergedShapes, gridSize);

		const normalisedVertices = normaliseGrid(vertices);
		const relaxedVertices = relaxGrid({ vertices: normalisedVertices, edges }, RELAXATION_PASSES);

		const formattedEdges = getEdgeCoords({ vertices: relaxedVertices, edges });

		return { vertices: relaxedVertices, edges: formattedEdges, quads };
	}

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

	function getQuadsFromVertex(vertexId, quads) {
		return quads.filter((quad) => quad.some((vid) => vid === vertexId));
	}

	function getNearestQuad(mouseClick, quads, vertices, scale, origin) {
		const vertexId = getNearestVertex(mouseClick, vertices, scale, origin);
		const candidateQuads = getQuadsFromVertex(vertexId, quads);
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

	function paintQuad({ context, mousePos, vertices, quads, scale, origin }) {
		const singleQuad = getNearestQuad(mousePos, quads, vertices, scale, origin);
		const shape = { vertices: singleQuad?.map((vertexId) => vertices[vertexId]) };

		return (
			shape.vertices &&
			fillShapes({
				context,
				origin,
				shapes: [shape],
				scale,
				colour: 'blue'
			})
		);
	}

	function paintQuadGroup({ context, mousePos, vertices, quads, scale, origin }) {
		const nearestVertexId = getNearestVertex(mousePos, vertices, scale, origin);
		const selectedQuads = getQuadsFromVertex(nearestVertexId, quads);
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
				colour: 'green'
			})
		);
	}

	function fitPolygon({ polygonSides = 4, quadGroup, vertices }) {
		const vertexCounts = quadGroup.reduce((acc, quad) => {
			quad.forEach((vertexId) => (acc[vertexId] = (acc[vertexId] ?? 0) + 1));
			return acc;
		}, {});

		const { cornerVertexIds, edgeVertexIds, middleVertexId } = Object.entries(vertexCounts).reduce(
			(acc, [id, count]) => {
				if (count === 1) acc.cornerVertexIds.push(id);
				else if (count === 2) acc.edgeVertexIds.push(id);
				else acc.middleVertexId = id;
				return acc;
			},
			{ cornerVertexIds: [], edgeVertexIds: [], middleVertexId: '' }
		);

		const vertexAngles = [...cornerVertexIds, ...edgeVertexIds]
			.reduce((acc, vertexId) => {
				function getBearing(vertex1Id, vertex2Id) {
					const dX = vertices[vertex1Id].x - vertices[vertex2Id].x;
					const dY = vertices[vertex1Id].y - vertices[vertex2Id].y;
					const rotation = dY < 0 ? -2 : 1;
					return (Math.atan(dY / dX) * rotation + 2 * Math.PI) % (2 * Math.PI);
				}
				return [...acc, [vertexId, getBearing(vertexId, middleVertexId)]];
			}, [])
			.sort((a, b) => a[0] - b[0]);

		if (vertexAngles.length < polygonSides) return null;

		const targetAngles = fillWithCount(Array(polygonSides), 0).map(
			(angle) => (vertexAngles[0][1] + (angle * 2 * Math.PI) / polygonSides) % (2 * Math.PI)
		);

		function getClosestVertexToAngle(vertexAngles, targetAngles) {
			let vertexIndex = 1;
			let targetIndex = 1;
			const results = [vertexAngles[0]];

			while (vertexIndex < vertexAngles.length && targetIndex < targetAngles.length) {
				const [id, angle] = vertexAngles[vertexIndex];
				const targetAngle = targetAngles[targetIndex];
				const currentClosestAngle = results[targetIndex]?.[1] ?? 2 * Math.PI;
				const currentAngleDiff = Math.abs(currentClosestAngle - targetAngle);
				const newAngleDiff = Math.abs(angle - targetAngle);

				if (newAngleDiff < currentAngleDiff) {
					if (results[targetIndex]) {
						results[targetIndex] = [id, angle];
					} else {
						results.push([id, angle]);
					}
					vertexIndex++;
				} else {
					targetIndex++;
				}
			}

			return results;
		}

		const selectedVertices = getClosestVertexToAngle(vertexAngles, targetAngles);
		console.log(targetAngles.map((angle, i) => [angle, selectedVertices[i][1]]));
	}

	/* EXECUTION */

	let gridSize = $state(DEFAULT_GRID_SIZE);
	let scale = $derived(INITIAL_SCALE / gridSize);

	const { vertices, edges, quads } = $derived(makeHex(gridSize));

	const canvasFn = ({ canvas, mousePosition, mouseClick, w, h }) => {
		const { x: xOffset, y: yOffset } = canvas.getBoundingClientRect();
		const mousePos = { x: mousePosition.x - xOffset, y: mousePosition.y - yOffset };
		const mouseClickPos = { x: mouseClick.x - xOffset, y: mouseClick.y - yOffset };

		const context = canvas.getContext('2d');
		const origin = $state({ x: w / 2, y: h / 2 });

		$effect(() => {
			context.clearRect(0, 0, w, h);
			outlineShapes({ context, origin, shapes: edges, scale });
		});

		$effect(() => {
			paintQuadGroup({ context, mousePos, vertices, quads, scale, origin });
			paintQuad({ context, mousePos, vertices, quads, scale, origin });
		});

		$effect(() => {
			const selectedVertexId = getNearestVertex(mouseClickPos, vertices, scale, origin);
			const selectedQuads = getQuadsFromVertex(selectedVertexId, quads);
			fitPolygon({ polygonSides: 4, quadGroup: selectedQuads, vertices });
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
