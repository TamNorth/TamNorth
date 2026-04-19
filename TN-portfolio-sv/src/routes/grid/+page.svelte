<script lang="ts">
	import Page from '$lib/shared/Page.svelte';
	import Canvas2D from '$lib/shared/Canvas2D/Canvas2D.svelte';
	import { paintShapes } from '$lib/shared/Canvas2D/utils.js';

	const GRID_SIZE = 2

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
				y: isUp ? y + yScale : y - yScale
			};
			const v2 = {
				x: x + xScale,
				y: isUp ? y - yScale : y + yScale
			};
			const v3 = {
				x: x - xScale,
				y: isUp ? y - yScale : y + yScale
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
			const isUp = Math.sign(y) < 0 ? isOdd : !isOdd;

			const triangle = drawTriangle(isUp, { x, y });

			triangleIndex++;

			return [...acc, {id, vertices: triangle, isUp}];
		}, []);
	}

	console.log(getHexgridTriangles(GRID_SIZE).map(({id}) => id));

	function selectMergingPartners(shapes, _remainingIndices: number[] = []) {
		console.log(shapes)
		const shapesCopy = structuredClone(shapes)
		_remainingIndices = _remainingIndices.length ? _remainingIndices : fillWithCount(Array(shapes.length))
		const selectorNum = Math.floor(Math.random() * _remainingIndices.length)
		const t1Index = _remainingIndices[selectorNum]

		const t1 = shapesCopy[t1Index]
		const {x: x1, y: y1} = t1.id

		function selectPartner(previousTries = []) {
			if (previousTries.length >= 3) return {}
			const directionMap = ["right", "left", t1.isUp ? "down" : "up"].filter(direction => !previousTries.includes(direction))
			const directionNum = Math.floor(Math.random()*directionMap.length);
			const direction = directionMap[directionNum]

			const x2 = direction === "right" ? x1 + 1 : direction === "left" ? x1 - 1 : x1;
			const y2 = direction === "down" ? y1 + 1 : direction === "up" ? y1 - 1 : y1;

			const t2Index = shapesCopy.findIndex(({id}) => id.x === x2 && id.y === y2)

			return t2Index !== -1 && !shapesCopy[t2Index].mergePartner ? {t2: shapesCopy[t2Index], t2Index} : selectPartner([...previousTries, direction])
		}

		const {t2, t2Index} = selectPartner()

		if (!t2) {
			t1.mergePartner = null
			const newRemainingIndices = _remainingIndices.filter(index => index != t1Index)
			return newRemainingIndices.length ? selectMergingPartners(shapesCopy, newRemainingIndices) : shapesCopy
		}

		t1.mergePartner = t2.id
		t2.mergePartner = t1.id

		const newRemainingIndices = _remainingIndices.filter(index => ![t1Index, t2Index].includes(index))

		return newRemainingIndices.length ? selectMergingPartners(shapesCopy, newRemainingIndices) : shapesCopy
	}

	function mergeShapes(shape1, shape2) {
	}

	const shapes = getHexgridTriangles(GRID_SIZE)
	const shapesVertices = shapes.map(({vertices}) => vertices)

	selectMergingPartners(shapes)

	const canvasFn = (canvas) => {
		paintShapes(canvas, shapesVertices, 'red');
	}
</script>

<Page></Page>
<Canvas2D {canvasFn} />
