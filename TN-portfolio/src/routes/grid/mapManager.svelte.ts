import { SvelteSet } from 'svelte/reactivity';

type Tile = { cornerIds: Set<string>; quadIds: Set<string>; properties: Set<string> };
type Tiles = Record<string, Tile>;
type Quads = Record<string, string>; // {[quadId]: [tileId]}
type Property = Record<string, undefined | null | string | number>[];

export class MapManager {
	public constructor(private propertyClassMap: Record<string, Property>) {}
	private tiles: Tiles = $state({});

	private quads: Quads = $state({});

	public assign(quadIds: string[], cornerIds: string[], properties: string[]) {}

	public erase(quadId: string): void {
		const tileId = this.quads?.[quadId];
		delete this.quads?.[quadId];
		delete this.tiles?.[tileId];
	}

	public get(quadId: string): Tile | null {
		const tileId = this.quads?.[quadId];
		return this.tiles?.[tileId] || null;
	}
}
