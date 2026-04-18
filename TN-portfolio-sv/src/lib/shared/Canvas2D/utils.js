export function paintShapes(canvas, shapes, colour = 'green') {
		const origin = { x: canvas.width / 2, y: canvas.height / 2 };

		const ctx = canvas.getContext('2d');
		ctx.strokeStyle = colour;
		const gridScale = shapes.reduce((acc, shape) => {
			const y1 = shape[0].y;
			return y1 > acc ? y1 : acc;
		}, 0);
		const scaleFactor = canvas.height / 2 / (gridScale + 1);

		function outlineShape(shape) {
			ctx.beginPath();
			let firstVertex = null;

			shape.forEach((coord) => {
				const xCoord = (coord.x * scaleFactor) + origin.x;
				const yCoord = (coord.y * scaleFactor) + origin.y;
				if (!firstVertex) {
					ctx.moveTo(xCoord, yCoord);
					firstVertex = { x: xCoord, y: yCoord };
				} else {
					ctx.lineTo(xCoord, yCoord);
				}
			});

			ctx.lineTo(firstVertex.x, firstVertex.y);
			ctx.stroke();
		}

		shapes.forEach(outlineShape);
	}
    
    export function rainbowMist(canvas) {
	const ctx = canvas.getContext('2d');
	let frame;

	function loop() {
		frame = requestAnimationFrame(loop);
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

		for (let p = 0; p < imageData.data.length; p += 4) {
			const i = p / 4;
			const x = i % canvas.width;
			const y = (i / canvas.height) >>> 0;
			const t = window.performance.now();

			const r = 64 + (128 * x) / canvas.width + 64 * Math.sin(t / 1000);
			const g = 64 + (128 * y) / canvas.height + 64 * Math.cos(t / 1400);
			const b = 128;

			imageData.data[p + 0] = r;
			imageData.data[p + 1] = g;
			imageData.data[p + 2] = b;
			imageData.data[p + 3] = 255;
		}

		ctx.putImageData(imageData, 0, 0);
	}

	loop();

	return () => {
		cancelAnimationFrame(frame);
	};
}

export function paintCoords(canvas, coords, colour = 'green') {
	const origin = { x: canvas.width / 2, y: canvas.height / 2 };

	const ctx = canvas.getContext('2d');
	ctx.fillStyle = colour;
	const gridScale = coords.reduce((acc, { y }) => (y > acc ? y : acc), 0);
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

export function getHexGrid(size) {
	const fillWithCount = (array, start) => array.fill(0).map((_, i) => i + start);
    const getStart = (rowNumber) => Math.abs(rowNumber) / 2 - size;
    const numOfRows = size * 2 + 1;
    const rowNums = fillWithCount(Array(numOfRows), -size);

    return rowNums.reduce((acc, rowNum) => {
        const rowLength = size * 2 + 1 - Math.abs(rowNum);
        const rowStart = getStart(rowNum);
        const xValues = fillWithCount(Array(rowLength), rowStart);
        return [...acc, ...xValues.reduce((acc, val) => [...acc, { x: val, y: rowNum }], [])];
    }, []);
}
