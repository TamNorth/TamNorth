<script lang="ts">
	import Page from '$lib/shared/Page.svelte';
	import Canvas2D from '$lib/shared/Canvas2D/Canvas2D.svelte';
	import { paintShapes } from '$lib/shared/Canvas2D/utils.js';

	const GRID_SIZE = 4

	const fillWithCount = (array: number[], start: number = 0) => array.fill(0).map((_, i) => i + start);

	function getHexgridTriangles(size: number) {
		const getStart = (rowNumber: number) => Math.abs(rowNumber) - (2 * size) + 0.5;
		const numOfRows = size * 2;
		const rowNums = fillWithCount(Array(numOfRows), -size)
			.map(rowNum => (rowNum + 0.5));

		const triangleCentres = rowNums.reduce((acc, rowNum) => {
			const rowLength = 2 * (2 * size - Math.abs(rowNum));
			const rowStart = getStart(rowNum);
			const xValues = fillWithCount(Array(rowLength), rowStart);
			return [...acc, ...xValues.reduce((acc, val) => [...acc, { x: val, y: rowNum }], [])];
		}, []);

		let triangleIndex = 0;
		let rowIndex = 0;

		function drawTriangle(isUp, centreCoord) {
			const { x, y } = centreCoord;

			// To-do: deal with magic numbers
			const xScale = 1;
			const yScale = 0.5;

			const v1 = {
				x: x,
				y: isUp ? y - yScale : y + yScale
			};
			const v2 = {
				x: x + xScale,
				y: isUp ? y + yScale : y - yScale
			};
			const v3 = {
				x: x - xScale,
				y: isUp ? y + yScale : y - yScale
			};

			return [v1, v2, v3];
		}

		return triangleCentres.reduce((acc, { x, y }) => {
			// if first triangle in row, reset index to 0
			if (y !== rowIndex) {
				rowIndex = y;
				triangleIndex = 0;
			}

			const id = {y: Math.sign(y) > 0 ? y + 0.5 : y - 0.5, x}

			// check if triangle should point up or down
			const isOdd = !!(triangleIndex % 2);
			const isUp = Math.sign(y) < 0 ? !isOdd : isOdd;

			const triangle = drawTriangle(isUp, { x, y });

			triangleIndex++;

			return [...acc, {id, vertices: triangle, isUp}];
		}, []);
	}

	function mergeShapes(shapes, _remainingIndices: number[] = [], _mergedShapes = []) {
		// const shapesCopy = structuredClone(shapes)
		_remainingIndices = _remainingIndices.length ? _remainingIndices : fillWithCount(Array(shapes.length))
		const selectorNum = Math.floor(Math.random() * _remainingIndices.length)
		const t1Index = _remainingIndices[selectorNum]

		const t1 = shapes[t1Index]
		const {isUp, id: {x: x1, y: y1}} = t1

		function selectPartner(previousTries = []) {
			if (previousTries.length >= 3) return {}
			const directionMap = ["right", "left", t1.isUp ? "down" : "up"].filter(direction => !previousTries.includes(direction))
			const directionNum = Math.floor(Math.random()*directionMap.length);
			const direction = directionMap[directionNum]

			const x2 = direction === "right" ? x1 + 1 : direction === "left" ? x1 - 1 : x1;
			const y2 = direction === "down" ? y1 + 1 : direction === "up" ? y1 - 1 : y1;

			const t2Index = shapes.findIndex(({id}) => id.x === x2 && id.y === y2)

			return t2Index !== -1 && _remainingIndices.includes(t2Index) ? {t2: shapes[t2Index], t2Index, direction} : selectPartner([...previousTries, direction])
		}

		const {t2, t2Index, direction} = selectPartner()

		if (!t2) {
			const newRemainingIndices = _remainingIndices.filter(index => index != t1Index)
			return newRemainingIndices.length ? mergeShapes(shapes, newRemainingIndices, [..._mergedShapes, t1.vertices]) : [..._mergedShapes, t1.vertices]
		}

		const [t1v1, t1v2, t1v3] = t1.vertices
		const [t2v1, t2v2, t2v3] = t2.vertices 

		const mergedVertices = (() => {
			switch (direction) {
				case "left":
					return isUp 
						? [t2v3, t1v1, t1v2, t1v3]
						: [t1v3, t1v2, t1v1, t2v3]
				case "right":
					return isUp
						? [t1v1, t2v2, t1v2, t1v3]
						: [t1v3, t1v2, t2v2, t1v1]
				case "up":
					return [t2v1, t1v2, t1v1, t1v3]
				case "down":
					return [t1v1, t1v2, t2v1, t1v3]
			}
		})()

		const newRemainingIndices = _remainingIndices.filter(index => ![t1Index, t2Index].includes(index))

		return newRemainingIndices.length ? mergeShapes(shapes, newRemainingIndices, [..._mergedShapes, mergedVertices]) : [..._mergedShapes, mergedVertices]
	}

	function interpolate(shapes) {
		const {vertices, edges} = shapes.reduce((acc, shape) => {
			const {mX, mY} = shape.reduce((acc, {x, y}) => {
				acc.mX += x / shape.length
				acc.mY += y / shape.length
				return acc
			}, {mX: 0, mY: 0})
			const middleVertexId = `${mX}/${mY}`
			acc.vertices[middleVertexId] = {x: mX, y: mY}

			for (let i0 = 0; i0 < shape.length; i0++) {
				const i2 = (i0 + 1) % shape.length
				const {x: x0, y: y0} = shape[i0]
				const {x: x2, y: y2} = shape[i2]
				const {x1, y1} = {
					x1: (x0 + x2) / 2,
					y1: (y0 + y2) / 2,
				}
				
				const vertex0Id = `${x0}/${y0}`
				const vertex1Id = `${x1}/${y1}`
				const vertex2Id = `${x2}/${y2}`

				if (!acc.vertices[vertex0Id]) acc.vertices[vertex0Id] = {x: x0, y: y0}
				if (!acc.vertices[vertex1Id]) acc.vertices[vertex1Id] = {x: x1, y: y1}

				const edge0Id = `${vertex0Id}//${vertex1Id}`
				const edge0AltId = `${vertex1Id}//${vertex0Id}`
				const edge1Id = `${vertex1Id}//${vertex2Id}`
				const edge1AltId = `${vertex2Id}//${vertex1Id}`
				const edge2Id = `${vertex1Id}//${middleVertexId}`

				if (!acc.edges[edge0Id] && !acc.edges[edge0AltId]) acc.edges[edge0Id] = [vertex0Id, vertex1Id]
				if (!acc.edges[edge1Id] && !acc.edges[edge1AltId]) acc.edges[edge1Id] = [vertex1Id, vertex2Id]
				acc.edges[edge2Id] = [vertex1Id, middleVertexId]
			}

			return acc
		}, {vertices: {}, edges: {}})

		return {vertices, edges: Object.values(edges)}
	}

	function normaliseGrid(vertices) {
		const xScalingFactor = 0.5
		const yScalingFactor = Math.sin(Math.PI * (2 / 3));

		let newVertices = {}

		for (let vertex in vertices) {
			newVertices[vertex] = {
				x: vertices[vertex].x * xScalingFactor,
				y: vertices[vertex].y * yScalingFactor,
			}
		}
		
		return newVertices
	}

	function getVertexForces({vertices, edges}) {
		const SPRING_LENGTH = 0.2

		const unresolvedForces = edges.reduce((acc, [v1, v2]) => {
			const [end1, end2] = [vertices[v1], vertices[v2]]
			const dY = end1.y - end2.y
			const dX = end1.x - end2.x

			const bearing = Math.atan(dY / dX)
			const length = Math.sqrt(Math.pow(dY, 2) + Math.pow(dX, 2))
			const tension = length - SPRING_LENGTH

			const tensionY = tension * Math.sin(bearing)
			const tensionX = tension * Math.cos(bearing)
			
			if (!acc[v1]) acc[v1] = []
			if (!acc[v2]) acc[v2] = []

			acc[v1] = [...acc[v1], {tensionY, tensionX}]
			acc[v2] = [...acc[v2], {tensionY: -tensionY, tensionX: -tensionX}]
			return acc
		}, {})

		function resolveForces(vertex) {
			return vertex.reduce((acc, {tensionY, tensionX}) => ({
				y: acc.y + tensionY,
				x: acc.x + tensionX,
			}), {x: 0, y: 0})
		}
		
		return Object.entries(unresolvedForces).reduce((acc, [id, vertex]) => ({...acc, [id]: resolveForces(vertex)}), {})
	}

	function getEdgeCoords({vertices, edges}) {
		return edges.map(([v1, v2]) => ({vertices: [vertices[v1], vertices[v2]]}))
	}

	const shapes = getHexgridTriangles(GRID_SIZE)

	const mergedShapes = mergeShapes(shapes)
	const {vertices, edges} = interpolate(mergedShapes)

	const normalisedVertices = normaliseGrid(vertices)
	const formattedEdges = getEdgeCoords({vertices: normalisedVertices, edges})

	const verticesAndEdges = {
		vertices: normalisedVertices, 
		edges: formattedEdges,
	}
	// getVertexForces(verticesAndEdges)


	console.log(getVertexForces({vertices: normalisedVertices, edges}))
	// console.log(edgeCoords)
	// const testShapes = [[
	// 	{x: 0, y: 0},
	// 	{x: 1, y: 0},
	// 	{x: 1, y: 1},
	// 	{x: 0, y: 1},
	// ]]
	// console.log(getEdgeCoords(interpolate(testShapes)))

	const canvasFn = (canvas) => {
		paintShapes(canvas, verticesAndEdges.edges, undefined);
	}
</script>

<Page></Page>
<Canvas2D {canvasFn} />
