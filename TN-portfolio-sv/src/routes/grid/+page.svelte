<script lang="ts">
	import Page from '$lib/shared/Page.svelte';
	import Canvas2D from '$lib/shared/Canvas2D/Canvas2D.svelte';
	import { paintShapes } from '$lib/shared/Canvas2D/utils.js';

	const GRID_SIZE = 3

	const rowHeightScaleFactor = Math.sin(Math.PI * (2 / 3));
	const fillWithCount = (array: number[], start: number) => array.fill(0).map((_, i) => i + start);

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

			const id = [Math.sign(y) > 0 ? y + 0.5 : y - 0.5, x]

			// check if triangle should point up or down
			const isOdd = !!(triangleIndex % 2);
			const isUp = Math.sign(y) < 0 ? isOdd : !isOdd;

			const triangle = drawTriangle(isUp, { x, y });

			triangleIndex++;

			return [...acc, {id, vertices: triangle}];
		}, []);
	}

	console.log(getHexgridTriangles(GRID_SIZE).map(({id}) => id));

	const shapes = getHexgridTriangles(GRID_SIZE).map(({vertices}) => vertices)
</script>

<Page></Page>
<Canvas2D canvasFn={(canvas) => paintShapes(canvas, shapes, 'red')} />
