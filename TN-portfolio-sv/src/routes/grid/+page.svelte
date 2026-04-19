<script lang="ts">
	import Page from '$lib/shared/Page.svelte';
	import Canvas2D from '$lib/shared/Canvas2D/Canvas2D.svelte';
	import { paintShapes } from '$lib/shared/Canvas2D/utils.js';

	const GRID_SIZE = 4

	const rowHeightScaleFactor = Math.sin(Math.PI * (2 / 3));
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

	function selectMergingPartners(shapes, _remainingIndices: number[] = [], _mergedShapes = []) {
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
			return newRemainingIndices.length ? selectMergingPartners(shapes, newRemainingIndices, [..._mergedShapes, t1.vertices]) : [..._mergedShapes, t1.vertices]
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

		return newRemainingIndices.length ? selectMergingPartners(shapes, newRemainingIndices, [..._mergedShapes, mergedVertices]) : [..._mergedShapes, mergedVertices]
	}

	function mergeShapes(shape1, shape2) {
	}

	const shapes = getHexgridTriangles(GRID_SIZE)
	const shapesVertices = shapes.map(({vertices}) => vertices)

	const mergedShapes = selectMergingPartners(shapes)
	console.log(mergedShapes)

	const canvasFn = (canvas) => {
		paintShapes(canvas, mergedShapes, undefined);
	}
</script>

<Page></Page>
<Canvas2D {canvasFn} />
