import { fillWithCount, getAveragePosition, getBearing, getIntersect, getLinearParams, getVector, normaliseAngle, resolveVector, sumDimensions } from "$lib/utils/mathsUtils.js";

type Coord = {x: number, y: number}
type Triangle = {id: Coord, vertices: Coord[], pointsUp: boolean}
type Vertex = {readonly x: number, readonly y: number, readonly hidden?: boolean, readonly locked?: boolean, readonly group?: string }
type MutableVertex = {x: number, y: number, hidden?: boolean, locked?: boolean, group?: string }
type Vertices = {readonly [index: string]: Vertex}
type MutableVertices = {[index: string]: MutableVertex}
type Grid = {vertices: Vertices, quads: readonly string[][]}

export class GridManager {
    public constructor(
        private hexSize: number = 6, 
	    private initialScale: number = 300,
        private springLength: number = 0.2,
	    private springStrength: number = 0.3,
	    private relaxationPasses: number = 5,
	    private rotationalDamping: number = 2,
        private relaxationRadius: number = 4,
) {

    }
    private vertices: MutableVertices = {}

    public getVertices(): MutableVertices {
        const verticesCopy: MutableVertices = structuredClone(this.vertices)
        return verticesCopy
    }

    private edges: string[][] = []

    private quads: string[][] = []

    public getQuads(): string[][] {
        const quadsCopy: string[][] = [...this.quads.map(quad => [...quad])]
        return quadsCopy
    }

    private getHexgridTriangles(size: number): Triangle[] {
		const getStart = (rowNumber: number): number => Math.abs(rowNumber) - 2 * size + 0.5;
		const numOfRows = size * 2;
		const rowNums = fillWithCount(Array(numOfRows), -size).map((rowNum: number) => rowNum + 0.5);

		const triangleCentres = rowNums.reduce((acc: number[], rowNum: number) => {
			const rowLength = 2 * (2 * size - Math.abs(rowNum));
			const rowStart = getStart(rowNum);
			const xValues = fillWithCount(Array(rowLength), rowStart);
			return [...acc, ...xValues.reduce((acc: Coord[], val: number) => [...acc, { x: val, y: rowNum }], [])];
		}, []);

		function drawTriangle(pointsUp: boolean, centreCoord: Coord): Coord[] {
			const { x, y } = centreCoord;

			// To-do: deal with magic numbers
			const xScale = 1;
			const yScale = 0.5;

			const v1 = {
				x: x,
				y: pointsUp ? y - yScale : y + yScale
			};
			const v2 = {
				x: x + xScale,
				y: pointsUp ? y + yScale : y - yScale
			};
			const v3 = {
				x: x - xScale,
				y: pointsUp ? y + yScale : y - yScale
			};

			return [v1, v2, v3];
		}

		let triangleIndex = 0;
		let rowIndex = 0;

		return triangleCentres.reduce((acc: Triangle[], { x, y }: Coord) => {
			// if first triangle in row, reset index to 0
			if (y !== rowIndex) {
				rowIndex = y;
				triangleIndex = 0;
			}

			const id = { y: Math.sign(y) > 0 ? y + 0.5 : y - 0.5, x };

			// check if triangle should point up or down
			const isOdd = !!(triangleIndex % 2);
			const pointsUp = Math.sign(y) < 0 ? !isOdd : isOdd;

			const triangle = drawTriangle(pointsUp, { x, y });

			triangleIndex++;

			return [...acc, { id, vertices: triangle, pointsUp }];
		}, []);
	}

    private mergeShapes(shapes: readonly Triangle[], _remainingIndices: number[] = [], _mergedShapes: Coord[][] = []): Coord[][] {
		// const shapesCopy = structuredClone(shapes)
		_remainingIndices = _remainingIndices.length
			? _remainingIndices
			: fillWithCount(Array(shapes.length));
		const selectorNum = Math.floor(Math.random() * _remainingIndices.length);
		const t1Index = _remainingIndices[selectorNum];

		const t1 = shapes[t1Index];
		const {
			pointsUp,
			id: { x: x1, y: y1 }
		} = t1;

		function selectPartner(previousTries: string[] = []): {t2: Triangle, t2Index: number, direction: string} | Record<string, never> {
			if (previousTries.length >= 3) return {};
			const directionMap = ['right', 'left', t1.pointsUp ? 'down' : 'up'].filter(
				(direction) => !previousTries.includes(direction)
			);
			const directionNum = Math.floor(Math.random() * directionMap.length);
			const direction = directionMap[directionNum];

			const x2 = direction === 'right' ? x1 + 1 : direction === 'left' ? x1 - 1 : x1;
			const y2 = direction === 'down' ? y1 + 1 : direction === 'up' ? y1 - 1 : y1;

			const t2Index = shapes.findIndex(({ id }) => id.x === x2 && id.y === y2);

			return t2Index !== -1 && _remainingIndices.includes(t2Index)
				? { t2: shapes[t2Index], t2Index, direction }
				: selectPartner([...previousTries, direction]);
		}

		const { t2, t2Index, direction } = selectPartner();

		if (!t2) {
			const newRemainingIndices = _remainingIndices.filter((index) => index != t1Index);
			return newRemainingIndices.length
				? this.mergeShapes(shapes, newRemainingIndices, [..._mergedShapes, t1.vertices])
				: [..._mergedShapes, t1.vertices];
		}

		const [t1v1, t1v2, t1v3] = t1.vertices;
		const [t2v1, t2v2, t2v3] = t2.vertices;

		const mergedVertices = ((): Coord[] => {
			switch (direction) {
				case 'left':
					return pointsUp ? [t2v3, t1v1, t1v2, t1v3] : [t1v3, t1v2, t1v1, t2v3];
				case 'right':
					return pointsUp ? [t1v1, t2v2, t1v2, t1v3] : [t1v3, t1v2, t2v2, t1v1];
				case 'up':
					return [t2v1, t1v2, t1v1, t1v3];
				default:
					return [t1v1, t1v2, t2v1, t1v3];
			}
		})();

		const newRemainingIndices = _remainingIndices.filter(
			(index) => ![t1Index, t2Index].includes(index)
		);

		return newRemainingIndices.length
			? this.mergeShapes(shapes, newRemainingIndices, [..._mergedShapes, mergedVertices])
			: [..._mergedShapes, mergedVertices];
	}

    private interpolate(shapes: readonly Coord[][], size: number): {vertices: Vertices, edges: readonly string[][], quads: readonly string[][]} {
		const { vertices, edges, quads } = shapes.reduce(
			(acc, shape) => {
				let { mX, mY }: {mX: number, mY: number} = shape.reduce(
					(acc, { x, y }) => {
						acc.mX += x / shape.length;
						acc.mY += y / shape.length;
						return acc;
					},
					{ mX: 0, mY: 0 }
				);
				mX = Number(mX.toFixed(1));
				mY = Number(mY.toFixed(1));
				const middleVertexId = `${mX}/${mY}`;
				acc.vertices[middleVertexId] = { x: mX, y: mY };

				for (let i0 = 0; i0 < shape.length; i0++) {
					const i2 = (i0 + 1) % shape.length;
					const i4 = (i0 + shape.length - 1) % shape.length;
					const { x: x0, y: y0 } = shape[i0];
					const { x: x2, y: y2 } = shape[i2];
					const { x: x4, y: y4 } = shape[i4];
					const { x1, y1 } = {
						x1: (x0 + x2) / 2,
						y1: (y0 + y2) / 2
					};
					const { x3, y3 } = {
						x3: (x0 + x4) / 2,
						y3: (y0 + y4) / 2
					};

					const verticesToAdd = {
						[`${x0}/${y0}`]: { x: x0, y: y0 },
						[`${x1}/${y1}`]: { x: x1, y: y1 },
						[middleVertexId]: { x: mX, y: mY },
						[`${x3}/${y3}`]: { x: x3, y: y3 }
					};

					Object.entries(verticesToAdd).forEach(([id, value]: [string, Coord]) => {
						const xDistance = Math.abs(value.x);
						const yDistance = Math.abs(value.y);
						const isBoundaryVertex = yDistance === size || xDistance + yDistance === 2 * size;
						if (!acc.vertices[id])
							acc.vertices[id] = isBoundaryVertex ? { ...value, locked: true } : value;
					});

					const gridQuad: string[] = [];

					function registerEdge(end1Id: string, end2Id: string): void {
						gridQuad.push(end1Id);
						const orderedIds = [end1Id, end2Id].sort();
						const edgeId = `${orderedIds[0]}//${orderedIds[1]}`;
						if (!acc.edges[edgeId]) {
							acc.edges[edgeId] = orderedIds;
						}
					}

					const vertexIds = Object.keys(verticesToAdd);

					for (let j = 0; j < vertexIds.length; j++) {
						const k = (j + 1) % vertexIds.length;
						registerEdge(vertexIds[j], vertexIds[k]);
					}

					acc.quads = [...acc.quads, gridQuad];
				}

				return acc;
			},
			{ vertices: {}, edges: {}, quads: [] } as {vertices: MutableVertices | Record<string, never>, edges: {[index: string]: string[]} | Record<string, never>, quads: string[][]}
		);

		return { vertices, edges: Object.values(edges), quads };
	}

    private normaliseGrid(vertices: Vertices): Vertices {
		const xScalingFactor = 0.5;
		const yScalingFactor = Math.sin(Math.PI * (2 / 3));

		const newVertices: MutableVertices = {};

		for (const vertex in vertices) {
			newVertices[vertex] = {
				...vertices[vertex],
				x: vertices[vertex].x * xScalingFactor,
				y: vertices[vertex].y * yScalingFactor
			};
		}

		return newVertices;
	}

    private getVertexForces(vertices: Vertices, edges: readonly string[][]): {[index: string]: Coord} {

		const unresolvedForces = edges.reduce((acc, [v1Id, v2Id]) => {
			const [end1, end2] = [vertices[v1Id], vertices[v2Id]];

			if (!acc[v1Id]) acc[v1Id] = [];
			if (!acc[v2Id]) acc[v2Id] = [];

			if (end1.group && end1.group === end2.group) {
				// disregard tensions internal to groups
				acc[v1Id] = [...acc[v1Id], { y: 0, x: 0 }];
				acc[v2Id] = [...acc[v2Id], { y: 0, x: 0 }];
				return acc;
			}

			const { magnitude: length, angle: bearing } = getVector(end1, end2);
			const tension = length - this.springLength;

			const tensionY = tension * Math.sin(bearing);
			const tensionX = tension * Math.cos(bearing);

			acc[v1Id] = [...acc[v1Id], { y: -tensionY, x: -tensionX }];
			acc[v2Id] = [...acc[v2Id], { y: tensionY, x: tensionX }];
			return acc;
		}, {} as {[index: string]: Coord[]});

		return Object.entries(unresolvedForces).reduce(
			(acc, [id, vertex]) => ({ ...acc, [id]: sumDimensions(vertex) }),
			{}
		);
	}

    private getRigidBodyForces(vertices: Vertices, vertexForces: {[index: string]: Coord}): {centre: Coord, angular: number, linear: Coord} {
		const rotationalCentre = getAveragePosition(Object.values(vertices));
		const linearForce = sumDimensions(Object.values(vertexForces));

		const angularForce = Object.entries(vertices).reduce((acc, [vertexId, coords]) => {
			const { magnitude: perpendicularDistance, angle: radialAngle } = getVector(
				coords,
				rotationalCentre
			);
			const tangentAngle = normaliseAngle(radialAngle + Math.PI / 2);
			const forceVector = getVector(vertexForces[vertexId], { x: 0, y: 0 });
			const { parallel: tangentialForce } = resolveVector(forceVector, tangentAngle);
			const torque = tangentialForce * perpendicularDistance;

			return acc + torque;
		}, 0);

		return { centre: rotationalCentre, angular: angularForce, linear: linearForce };
	}

    private relaxGrid(vertices: Vertices, edges: readonly string[][], stepNum = 1): MutableVertices {

		const newVertices: MutableVertices = $state.snapshot(vertices);
		const groupedVertices: {[index: string]: {[index: string]: Vertex}} = {};

		for (let i = 0; i < stepNum; i++) {
			const vertexForces = this.getVertexForces(newVertices, edges);

			for (const vertexId in newVertices) {
				const vertex = newVertices[vertexId];
				if (vertex.group) {
					groupedVertices[vertex.group] = {
						...(groupedVertices?.[vertex.group] || []),
						[vertexId]: vertex
					};
				} else if (!vertex.locked) {
					vertex.x += vertexForces[vertexId].x * this.springStrength;
					vertex.y += vertexForces[vertexId].y * this.springStrength;
				}
			}
		}

		for (let i = 0; i < 10; i++) {
			const vertexForces = this.getVertexForces(newVertices, edges);

			for (const groupId in groupedVertices) {
				const group = groupedVertices[groupId];

				if (
					// if not all grouped nodes available, do not modify
					groupId.split('+').length === Object.keys(group).length &&
					Object.values(group).every((vertex) => !vertex.locked)
				) {
					const { centre, angular, linear } = this.getRigidBodyForces(group, vertexForces);
					const bodyMass = Object.keys(group).length;

					for (const vertexId in group) {
						const vertex = newVertices[vertexId];
						if (!vertex.locked) {
							const { magnitude: radius, angle: bearing } = getVector(vertex, centre);
							vertex.x += (angular / bodyMass) * this.rotationalDamping * radius * -Math.sin(bearing);
							vertex.y += (angular / bodyMass) * this.rotationalDamping * radius * Math.cos(bearing);

							vertex.x += (linear.x / bodyMass) * this.springStrength;
							vertex.y += (linear.y / bodyMass) * this.springStrength;
						}
					}
				}
			}
		}

		return newVertices;
	}

    private getGridOutline(quads: readonly string[][]): Record<string, string[]> {
		// get number of times each vertex is shared by a quad
		const vertexCounts = quads.reduce((acc, quad) => {
			quad.forEach((vertexId) => (acc[vertexId] = (acc[vertexId] ?? 0) + 1));
			return acc;
		}, {} as Record<string, number>);

		// define unshared vertices as quad-group corners,
		return Object.entries(vertexCounts).reduce(
			(acc, [id, count]) => {
				if (count === 1) acc.cornerVertexIds.push(id);
				else if (count === 2) acc.edgeVertexIds.push(id);
				else acc.middleVertexIds.push(id);
				return acc;
			},
			{ cornerVertexIds: [], edgeVertexIds: [], middleVertexIds: [] } as Record<string, string[]>
		);
	}

	public makeHex(hexSize: number = this.hexSize): Grid {
		const shapes = this.getHexgridTriangles(hexSize);

		const mergedShapes = this.mergeShapes(shapes);
		const { vertices, edges, quads } = this.interpolate(mergedShapes, hexSize);

		const normalisedVertices = this.normaliseGrid(vertices);
		const relaxedVertices = this.relaxGrid(normalisedVertices, edges, this.relaxationPasses);

        this.vertices = {...this.vertices, ...relaxedVertices}
        this.edges = [...this.edges, ...edges]
        this.quads = [...this.quads, ...quads]

		return { vertices: this.getVertices(), quads: this.getQuads() };
	}

    private makeSpatialBuckets() {

    }

    public getQuadsFromVertex(vertexId: string, selectionRadius = 1): readonly string[][] {
		let selectedVertices = [vertexId];
		let selectedQuads: readonly string[][] = [];

		for (let i = 0; i < selectionRadius; i++) {
			const newQuads = this.quads
                .filter((quad) => quad.some((vId) => selectedVertices.includes(vId)))
                .map(quad => [...quad]);
			selectedQuads = [...new Set([...selectedQuads, ...newQuads])];
			selectedVertices = newQuads.flat().filter((vId) => !selectedVertices.includes(vId));
		}

		return selectedQuads;
	}

    private fitPolygon( quadGroup: readonly string[][], radius: number, polygonSides = 4 ): Vertices | null {
		// return null if a vertex is locked
		if (
			quadGroup.flat().some((vertexId) => this.vertices[vertexId]?.locked || this.vertices[vertexId]?.group)
		)
			return null;

		const TWO_PI = 2 * Math.PI;

		const { cornerVertexIds, edgeVertexIds, middleVertexIds } = this.getGridOutline(quadGroup);

		const middleVertexId = middleVertexIds[0];

		const middleVertex = this.vertices[middleVertexId];

		// if polygon cannot be fit, return null
		if (!middleVertex || [...cornerVertexIds, ...edgeVertexIds].length < polygonSides) {
			return null;
		}

		// get the angle to fit the first corner of the polygon to
		const firstCornerId = cornerVertexIds[0];
		const firstCornerAngle = getBearing(this.vertices[firstCornerId], middleVertex);

		// get bearing of each vertex from middle vertex...
		const vertexAngles: [string, number][] = [...cornerVertexIds, ...edgeVertexIds]
			.map((vertexId) => {
				const vertex = this.vertices[vertexId];
				return [vertexId, getBearing(vertex, middleVertex)] as [string, number];
			})
			// ...in order, starting at first corner angle
			.sort((a, b) => {
				const angleA = a[1] >= firstCornerAngle ? a[1] : a[1] + TWO_PI;
				const angleB = b[1] >= firstCornerAngle ? b[1] : b[1] + TWO_PI;
				return angleA - angleB;
			});

		const targetAngles = fillWithCount(Array(polygonSides), 0).map((index: number) => {
			const angleInterval = TWO_PI / polygonSides;
			return normaliseAngle(firstCornerAngle + index * angleInterval);
		});

		function getClosestVerticesToAngle(vertexAngles: [string, number][], targetAngles: number[]) {
			let vertexIndex = 1;
			let targetIndex = 1;
			const results: [[string, number]] = [[vertexAngles[0][0], 0]];

			while (vertexIndex < vertexAngles.length && targetIndex < targetAngles.length) {
				const [id, angle] = vertexAngles[vertexIndex];
				const targetAngle = targetAngles[targetIndex];
				const currentClosestAngleIndex = results[targetIndex]?.[1];
				const currentClosestAngle = vertexAngles[currentClosestAngleIndex]?.[1] ?? TWO_PI;
				const currentAngleDiff = Math.abs(currentClosestAngle - targetAngle);
				const newAngleDiff = Math.abs(angle - targetAngle);

				if (
					newAngleDiff < currentAngleDiff ||
					vertexAngles.length - vertexIndex <= targetAngles.length - targetIndex - 2
				) {
					if (results[targetIndex]) {
						results[targetIndex] = [id, vertexIndex];
					} else {
						results.push([id, vertexIndex]);
					}
					vertexIndex++;
				} else {
					targetIndex++;
				}
			}

			return results;
		}

		function resolveToPolygon(
            targetAngles: number[], 
            cornerVertices: [string, number][], 
            vertexAngles: [string, number][], 
            origin: Coord, 
            radius: number, 
            groupId: string
        ) {
			const { x: x0, y: y0 } = origin;

			// Trackers:

			// polygon corner angle trackers, used to rotate polygon-edge vertices to correct edge:
			const remainingTargetAngles = [...targetAngles];
			// polygon-to-fit angles e.g. [0, pi/2, pi, 3pi/4]
			let prevTargetAngle = targetAngles[targetAngles.length - 1];
			// tracks through target angles e.g. 3pi/4 => 0 => pi/2 => pi => 3pi/4

			// corner index trackers, used to space polygon-edge vertices evenly:
			const remainingCornerIndices = cornerVertices.map(([_, index]) => index);
			// vertexAngle array indices e.g. [0, 3, 5, 8]
			let prevCornerIndex =
				vertexAngles.length - remainingCornerIndices[remainingCornerIndices.length - 1];
			// starts at number of edge vertices between last & first corner

			// corner position trackers, used to place polygon-corner vertices and get polygon-edge linear equations:
			let prevCorner = {
				x: x0 + radius * Math.cos(prevTargetAngle),
				y: y0 + radius * Math.sin(prevTargetAngle)
			};
			let nextCorner = {
				x: x0 + radius * Math.cos(targetAngles[0]),
				y: y0 + radius * Math.sin(targetAngles[0])
			};

			return vertexAngles.reduce((acc, [id, _], i) => {
				// check if vertex angle is closest match to polygon corner
				if (cornerVertices.find(([cornerId, _]) => id === cornerId)) {
					// if corner vertex:
					// shift reference corners forward by one
					prevCornerIndex = remainingCornerIndices.shift();
					prevTargetAngle = remainingTargetAngles.shift();
					prevCorner = nextCorner;
					nextCorner = {
						x: x0 + radius * Math.cos(remainingTargetAngles[0] ?? targetAngles[0]),
						y: y0 + radius * Math.sin(remainingTargetAngles[0] ?? targetAngles[0])
					};
					// move vertex to polygon corner
					return { ...acc, [id]: { ...prevCorner, group: groupId } };
				} else {
					// if edge vertex, move to polygon edge:
					// calculate intermediate angle between last & next polygon corner
					const ratio =
						(i - prevCornerIndex) /
						Math.abs((remainingCornerIndices[0] ?? vertexAngles.length) - prevCornerIndex);
					const relativeAngle = normaliseAngle(
						(remainingTargetAngles[0] ?? targetAngles[0] + TWO_PI) - prevTargetAngle
					);
					const absoluteAngle = prevTargetAngle + ratio * relativeAngle;
					// calculate point along polygon edge at intermediate angle
					const polygonEdge = getLinearParams(prevCorner, nextCorner);
					const lineFromOrigin = getLinearParams(origin, {
						x: origin.x + radius * 3 * Math.cos(absoluteAngle),
						y: origin.y + radius * 3 * Math.sin(absoluteAngle)
					});
					const intercept = getIntersect(polygonEdge, lineFromOrigin);
					// move to edge-intercept
					return { ...acc, [id]: { ...intercept, group: groupId } };
				}
			}, {});
		}

		const cornerVertices = getClosestVerticesToAngle(vertexAngles, targetAngles);

		const groupId = [...cornerVertexIds, ...edgeVertexIds, middleVertexId].join('+');

		const polygon = resolveToPolygon(
			targetAngles,
			cornerVertices,
			vertexAngles,
			this.vertices[middleVertexId],
			radius,
			groupId
		);

		return {
			...polygon,
			[middleVertexId]: { ...this.vertices[middleVertexId], group: groupId, hidden: true }
		};
	}

    private relaxSubgrid(vertices: Vertices, edges: string[][], quadsToRelax: readonly string[][], stepNums = 10): Vertices {
		const verticesToRelax: MutableVertices = {
			...quadsToRelax
				.flat()
				.reduce((acc, vertexId) => ({ ...acc, [vertexId]: {...vertices[vertexId]} }), {})
		};

		const { cornerVertexIds, edgeVertexIds } = this.getGridOutline(quadsToRelax);

		const verticesToUnlock: string[] = [];

		for (const vertexId in verticesToRelax) {
			if (
				[...cornerVertexIds, ...edgeVertexIds].includes(vertexId) &&
				!verticesToRelax[vertexId].locked
			) {
				verticesToRelax[vertexId].locked = true;
				verticesToUnlock.push(vertexId);
			}
		}

		const relaxedVertices = this.relaxGrid(
				verticesToRelax,
				edges.filter((edge) =>
					edge.every((vId) => Object.keys(verticesToRelax).includes(vId))
				),
			stepNums
		);

		verticesToUnlock.forEach((vertexId) => (relaxedVertices[vertexId].locked = false));

		return relaxedVertices;
	}

    public insertPolygon(vertexId: string, polygonRadius: number, polygonSides: number): Vertices {
			const selectedQuads = this.getQuadsFromVertex(vertexId);
			const verticesToAdd = this.fitPolygon(
				selectedQuads,
				polygonRadius,
				polygonSides
			);

			const quadsToRelax = this.getQuadsFromVertex(vertexId, this.relaxationRadius);

			const verticesToRelax = {
				...quadsToRelax
					.flat()
					.reduce((acc, vertexId) => ({ ...acc, [vertexId]: this.vertices[vertexId] }), {}),
				...verticesToAdd
			};

			const relaxedVertices = this.relaxSubgrid(verticesToRelax, this.edges, quadsToRelax);

            this.vertices = {...this.vertices, ...relaxedVertices}

            return this.getVertices()
        }
}