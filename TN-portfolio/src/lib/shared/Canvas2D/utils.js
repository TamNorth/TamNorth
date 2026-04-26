function makePath(context, vertices, scale, origin) {
	context.beginPath();
	let firstVertex = null;
	let paint = false

	vertices.forEach(({hidden = false, ...coord}) => {
		const {x, y} = scaleVertex(coord, scale, origin)
		if (!x || !y) return;

		firstVertex = firstVertex ?? { x, y }

		if (hidden) {
			paint = false
		} else if (!paint) {
			context.moveTo(x, y);
			paint = true
		} else {
			context.lineTo(x, y);
		}
	});

	if (paint) context.lineTo(firstVertex.x, firstVertex.y);
}

export function outlineShapes({context, origin, shapes, scale = 1, colour}) {
	const defaultColour = 'red';

	shapes.forEach(({ vertices, colour: shapeColour }) => {
		context.strokeStyle = colour ?? shapeColour ?? defaultColour;

		makePath(context, vertices, scale, origin)
		
		context.stroke();
	})
}

export function fillShapes({context, origin, shapes, scale = 1, colour}) {
	const defaultColour = 'red';

	shapes.forEach(({ vertices, colour: shapeColour }) => {
		context.fillStyle = colour ?? shapeColour ?? defaultColour;

		makePath(context, vertices, scale, origin)

		context.fill();
	})
}

export function paintVertices({context, origin, vertices, scale = 1, colour: colourOverride}) {
	const rectSize = 10
	const rectHalfSize = rectSize / 2
	const defaultColour = 'red';

	vertices.filter(vertex => vertex).forEach(({ x: x0, y: y0, colour = null }) => {
		if (!x0 || !y0) return;
		context.fillStyle = colourOverride ?? colour ?? defaultColour;

		const {x, y} = scaleVertex({x: x0, y: y0}, scale, origin)

		context.fillRect(x - rectHalfSize, y - rectHalfSize, rectSize, rectSize);
	})
}

export function scaleVertex(vertex, scale, origin) {
	return {
		x: vertex?.x * scale + origin.x,
		y: vertex?.y * scale + origin.y,
	}
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
