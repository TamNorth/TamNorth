import type { Coord, Shape, Shapes, Vertex, Vertices } from './types.ts';

export class CanvasManager {
	public constructor(
		private canvas: HTMLCanvasElement,
		private initialScale: number,
		private origin: Coord = { x: 0, y: 0 },
		private defaultColour: string = 'red'
	) {
		this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
		this.scale = this.initialScale;
	}

	private context: CanvasRenderingContext2D;

	public scale: number = $state(1);

	/** PUBLIC METHODS */

	/** transform canvas */

	public scaleCanvas(newScale: number) {
		this.scale = newScale;
	}

	/** paint canvas */

	public fillShapes(shapes: Shapes, colour?: string, fillRule?): void {
		const defaultColour = 'red';

		shapes.forEach(({ vertices, colour: shapeColour }) => {
			this.context.fillStyle = colour ?? shapeColour ?? defaultColour;

			this.makePath(vertices);

			if (fillRule) {
				fillRule({ context: this.context, vertices });
			} else {
				this.context.fill();
			}
		});
	}

	public outlineShapes(shapes: Shapes, colour: string, strokeRule?) {
		shapes.forEach(({ vertices, colour: shapeColour }) => {
			this.context.strokeStyle = colour ?? shapeColour ?? this.defaultColour;

			this.makePath(vertices);

			if (strokeRule) {
				strokeRule({ context: this.context, vertices });
			} else {
				this.context.stroke();
			}
		});
	}

	public clearCanvas(w: number, h: number, x: number = 0, y: number = 0) {
		this.context.clearRect(x, y, w, h);
	}

	/** PRIVATE METHODS */

	private makePath(vertices: Vertex[]) {
		this.context.beginPath();
		let firstVertex: Coord | null = null;
		let paint = false;

		vertices.forEach(({ hidden = false, ...coord }, i) => {
			const { x, y } = this.scaleCoord(coord);
			if (!x || !y) return;

			if (!hidden && i === 0) firstVertex = { x, y };

			if (hidden) {
				paint = false;
			} else if (!paint) {
				this.context.moveTo(x, y);
				paint = true;
			} else {
				this.context.lineTo(x, y);
			}
		});

		if (paint && firstVertex) this.context.lineTo(firstVertex.x, firstVertex.y);
	}

	private scaleCoord(coord: Coord) {
		return {
			x: coord?.x * this.scale + this.origin.x,
			y: coord?.y * this.scale + this.origin.y
		};
	}
}
