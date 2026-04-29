export type Coord = { x: number; y: number };
export type Shape = { vertices: Vertex[]; colour?: string };
export type Shapes = Shape[];
export type Vertex = {
	readonly x: number;
	readonly y: number;
	readonly hidden?: boolean;
	readonly locked?: boolean;
	readonly groupId?: string | null;
	readonly group?: string[];
};
export type Vertices = { readonly [index: string]: Vertex };
