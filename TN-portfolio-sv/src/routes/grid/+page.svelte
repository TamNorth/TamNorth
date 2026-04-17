<script lang="ts">
	import Page from '$lib/shared/Page.svelte';
	import Canvas2D from '$lib/shared/Canvas2D/Canvas2D.svelte';

	// const rowHeight = Math.sin(Math.PI * (2 / 3));
	const fillWithCount = (array: number[], start: number) => array.fill(0).map((_, i) => i + start);

	function getHexGrid(size: number) {
		const getStart = (rowNumber: number) => Math.abs(rowNumber) / 2 - size;
		const numOfRows = size * 2 + 1;
		const rowNums = fillWithCount(Array(numOfRows), -size);

		return rowNums.reduce((acc, rowNum) => {
			const rowLength = size * 2 + 1 - Math.abs(rowNum);
			const rowStart = getStart(rowNum);
			const xValues = fillWithCount(Array(rowLength), rowStart);
			return [...acc, ...xValues.reduce((acc, val) => [...acc, { x: val, y: rowNum }], [])];
		}, []);
	}

	console.log(getHexGrid(2));

	function paintCoords(canvas, coords, colour = 'green') {
		const origin = { x: canvas.width / 2, y: canvas.height / 2 };
		console.log(canvas.height);

		const ctx = canvas.getContext('2d');
		ctx.fillStyle = colour;
		const gridScale = coords.reduce((acc, {y}) => y > acc ? y : acc, 0)
		const scaleFactor = canvas.height / 2 / (gridScale + 1);

		function paintVertex(coord) {
			const width = 10;
			const height = 10;
			const xCoord = coord.x * scaleFactor + origin.x - width / 2;
			const yCoord = coord.y * scaleFactor + origin.y - width / 2;
			ctx.fillRect(xCoord, yCoord, width, height);
		}

		coords.forEach(paintVertex);
	}
</script>

<Page></Page>
<Canvas2D canvasFn={(canvas) => paintCoords(canvas, getHexGrid(5), "red")} />
