<script lang="ts">
	import Page from '$lib/shared/Page.svelte';
	import Canvas2D from '$lib/shared/Canvas2D/Canvas2D.svelte';
	import { fillShapes, outlineShapes, scaleVertex } from '$lib/shared/Canvas2D/utils.js';
	import Tile from '$lib/shared/Tile.svelte';
	import {
		getAveragePosition,
		getBearing,
		getHypotenuse,
		getIntersect,
		getLinearParams,
		getVector,
		normaliseAngle,
		resolveVector,
		sumDimensions
	} from '$lib/utils/mathsUtils.js';
	import { untrack } from 'svelte';
	import useTheme from '$lib/hooks/useTheme.svelte.js';

	const INITIAL_SCALE = 300;
	const DEFAULT_GRID_SIZE = 4;
	const POLYGON_SIDES = 6; //() => Math.floor(Math.random() * 3 + 4);
	const RELAXATION_RADIUS = 4;

	/* RELAXATION PARAMS */
	const SPRING_LENGTH = 0.2;
	const SPRING_STRENGTH = 0.3;
	const RELAXATION_PASSES = 5;
	const ROTATIONAL_DAMPING = 2;

	/* DEFINITIONS */

	const fillWithCount = (array: number[], start: number = 0) =>
		array.fill(0).map((_, i) => i + start);

	function getHexgridTriangles(size: number) {
		const getStart = (rowNumber: number) => Math.abs(rowNumber) - 2 * size + 0.5;
		const numOfRows = size * 2;
		const rowNums = fillWithCount(Array(numOfRows), -size).map((rowNum) => rowNum + 0.5);

		const triangleCentres = rowNums.reduce((acc, rowNum) => {
			const rowLength = 2 * (2 * size - Math.abs(rowNum));
			const rowStart = getStart(rowNum);
			const xValues = fillWithCount(Array(rowLength), rowStart);
			return [...acc, ...xValues.reduce((acc, val) => [...acc, { x: val, y: rowNum }], [])];
		}, []);

		function drawTriangle(pointsUp, centreCoord) {
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

		return triangleCentres.reduce((acc, { x, y }) => {
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

	function mergeShapes(shapes, _remainingIndices: number[] = [], _mergedShapes = []) {
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

		function selectPartner(previousTries = []) {
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
				? mergeShapes(shapes, newRemainingIndices, [..._mergedShapes, t1.vertices])
				: [..._mergedShapes, t1.vertices];
		}

		const [t1v1, t1v2, t1v3] = t1.vertices;
		const [t2v1, t2v2, t2v3] = t2.vertices;

		const mergedVertices = (() => {
			switch (direction) {
				case 'left':
					return pointsUp ? [t2v3, t1v1, t1v2, t1v3] : [t1v3, t1v2, t1v1, t2v3];
				case 'right':
					return pointsUp ? [t1v1, t2v2, t1v2, t1v3] : [t1v3, t1v2, t2v2, t1v1];
				case 'up':
					return [t2v1, t1v2, t1v1, t1v3];
				case 'down':
					return [t1v1, t1v2, t2v1, t1v3];
			}
		})();

		const newRemainingIndices = _remainingIndices.filter(
			(index) => ![t1Index, t2Index].includes(index)
		);

		return newRemainingIndices.length
			? mergeShapes(shapes, newRemainingIndices, [..._mergedShapes, mergedVertices])
			: [..._mergedShapes, mergedVertices];
	}

	function interpolate(shapes, size) {
		const { vertices, edges, quads } = shapes.reduce(
			(acc, shape) => {
				let { mX, mY } = shape.reduce(
					(acc, { x, y }) => {
						acc.mX += x / shape.length;
						acc.mY += y / shape.length;
						return acc;
					},
					{ mX: 0, mY: 0 }
				);
				mX = mX.toFixed(1);
				mY = mY.toFixed(1);
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

					Object.entries(verticesToAdd).forEach(([id, value]) => {
						const xDistance = Math.abs(value.x);
						const yDistance = Math.abs(value.y);
						const isBoundaryVertex = yDistance === size || xDistance + yDistance === 2 * size;
						if (!acc.vertices[id])
							acc.vertices[id] = isBoundaryVertex ? { ...value, locked: true } : value;
					});

					const gridQuad = [];

					function registerEdge(end1Id, end2Id) {
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
			{ vertices: {}, edges: {}, quads: [] }
		);

		return { vertices, edges: Object.values(edges), quads };
	}

	function normaliseGrid(vertices) {
		const xScalingFactor = 0.5;
		const yScalingFactor = Math.sin(Math.PI * (2 / 3));

		let newVertices = {};

		for (let vertex in vertices) {
			newVertices[vertex] = {
				...vertices[vertex],
				x: vertices[vertex].x * xScalingFactor,
				y: vertices[vertex].y * yScalingFactor
			};
		}

		return newVertices;
	}

	function getVertexForces({ vertices, edges }) {
		const springLength = SPRING_LENGTH;

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
			const tension = length - springLength;

			const tensionY = tension * Math.sin(bearing);
			const tensionX = tension * Math.cos(bearing);

			acc[v1Id] = [...acc[v1Id], { y: -tensionY, x: -tensionX }];
			acc[v2Id] = [...acc[v2Id], { y: tensionY, x: tensionX }];
			return acc;
		}, {});

		return Object.entries(unresolvedForces).reduce(
			(acc, [id, vertex]) => ({ ...acc, [id]: sumDimensions(vertex) }),
			{}
		);
	}

	function getRigidBodyForces(vertices, vertexForces) {
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

	function relaxGrid({ vertices, edges }, stepNum = 1) {
		const springStrength = SPRING_STRENGTH;

		const newVertices = $state.snapshot(vertices);
		let groupedVertices = {};

		for (let i = 0; i < stepNum; i++) {
			const vertexForces = getVertexForces({ vertices: newVertices, edges });

			for (let vertexId in newVertices) {
				let vertex = newVertices[vertexId];
				if (vertex.group) {
					groupedVertices[vertex.group] = {
						...(groupedVertices?.[vertex.group] || []),
						[vertexId]: vertex
					};
				} else if (!vertex.locked) {
					vertex.x += vertexForces[vertexId].x * springStrength;
					vertex.y += vertexForces[vertexId].y * springStrength;
				}
			}
		}

		for (let i = 0; i < 10; i++) {
			const vertexForces = getVertexForces({ vertices: newVertices, edges });

			for (let groupId in groupedVertices) {
				const group = groupedVertices[groupId];

				if (
					// if not all grouped nodes available, do not modify
					groupId.split('+').length === Object.keys(group).length &&
					Object.values(group).every((vertex) => !vertex.locked)
				) {
					const { centre, angular, linear } = getRigidBodyForces(group, vertexForces);
					const bodyMass = Object.keys(group).length;

					for (let vertexId in group) {
						let vertex = newVertices[vertexId];
						if (!vertex.locked) {
							const { magnitude: radius, angle: bearing } = getVector(vertex, centre);
							vertex.x += (angular / bodyMass) * ROTATIONAL_DAMPING * radius * -Math.sin(bearing);
							vertex.y += (angular / bodyMass) * ROTATIONAL_DAMPING * radius * Math.cos(bearing);

							vertex.x += (linear.x / bodyMass) * springStrength;
							vertex.y += (linear.y / bodyMass) * springStrength;
						}
					}
				}
			}
		}

		return newVertices;
	}

	function getGridOutline(quads) {
		// get number of times each vertex is shared by a quad
		const vertexCounts = quads.reduce((acc, quad) => {
			quad.forEach((vertexId) => (acc[vertexId] = (acc[vertexId] ?? 0) + 1));
			return acc;
		}, {});

		// define unshared vertices as quad-group corners,
		const { cornerVertexIds, edgeVertexIds, middleVertexIds } = Object.entries(vertexCounts).reduce(
			(acc, [id, count]) => {
				if (count === 1) acc.cornerVertexIds.push(id);
				else if (count === 2) acc.edgeVertexIds.push(id);
				else acc.middleVertexIds.push(id);
				return acc;
			},
			{ cornerVertexIds: [], edgeVertexIds: [], middleVertexIds: [] }
		);

		return { cornerVertexIds, edgeVertexIds, middleVertexIds };
	}

	function relaxSubgrid(quadsToRelax, vertices, stepNums = 10) {
		const verticesToRelax = {
			...quadsToRelax
				.flat()
				.reduce((acc, vertexId) => ({ ...acc, [vertexId]: vertices[vertexId] }), {})
		};

		const { cornerVertexIds, edgeVertexIds } = getGridOutline(quadsToRelax);

		let verticesToUnlock = [];

		for (let vertexId in verticesToRelax) {
			if (
				[...cornerVertexIds, ...edgeVertexIds].includes(vertexId) &&
				!verticesToRelax[vertexId].locked
			) {
				verticesToRelax[vertexId].locked = true;
				verticesToUnlock.push(vertexId);
			}
		}

		const relaxedVertices = relaxGrid(
			{
				vertices: verticesToRelax,
				edges: edges.filter((edge) =>
					edge.every((vId) => Object.keys(verticesToRelax).includes(vId))
				)
			},
			stepNums
		);

		verticesToUnlock.forEach((vertexId) => (relaxedVertices[vertexId].locked = false));

		return relaxedVertices;
	}

	function getEdgeCoords({ vertices, edges }) {
		return edges.map(([v1, v2]) => ({ vertices: [vertices[v1], vertices[v2]] }));
	}

	function makeHex(gridSize) {
		const shapes = getHexgridTriangles(gridSize);

		const mergedShapes = mergeShapes(shapes);
		const { vertices, edges, quads } = interpolate(mergedShapes, gridSize);

		const normalisedVertices = normaliseGrid(vertices);
		const relaxedVertices = relaxGrid({ vertices: normalisedVertices, edges }, RELAXATION_PASSES);

		return { vertices: relaxedVertices, edges, quads };
	}

	function getNearestVertex(mouseClick, vertices, scale, origin) {
		const startingVertexId = '0/0';
		const startingPos = scaleVertex(vertices[startingVertexId], scale, origin);
		const startingDistance = getHypotenuse(
			startingPos.x - mouseClick.x,
			startingPos.y - mouseClick.y
		);

		function loop(vertexId, currentDistance) {
			const [idY, idX] = vertexId.split('/').map((id) => Number(id));
			const neighbourIds = [1, 0.5, 0.3, 0.7]
				.reduce(
					(acc, delta) => [
						...acc,
						[idY + delta, idX],
						[idY - delta, idX],
						[idY, idX + delta],
						[idY, idX - delta],
						[idY + delta, idX + delta],
						[idY + delta, idX - delta],
						[idY - delta, idX - delta],
						[idY - delta, idX + delta]
					],
					[]
				)
				.map((id) => id.join('/'));

			const { id: closestNeighbour, distance: newDistance } = neighbourIds.reduce(
				(acc, id) => {
					if (!vertices[id]) return acc;
					const position = scaleVertex(vertices[id], scale, origin);
					const distance = getHypotenuse(position.x - mouseClick.x, position.y - mouseClick.y);
					if (distance < acc?.distance) return { id, distance };
					return acc;
				},
				{ id: vertexId, distance: currentDistance }
			);

			return closestNeighbour === vertexId ? vertexId : loop(closestNeighbour, newDistance);
		}

		return loop(startingVertexId, startingDistance);
	}

	function getQuadsFromVertex(vertexId, quads, selectionRadius = 1) {
		let selectedVertices = [vertexId];
		let selectedQuads = [];

		for (let i = 0; i < selectionRadius; i++) {
			const newQuads = quads.filter((quad) => quad.some((vId) => selectedVertices.includes(vId)));
			selectedQuads = [...new Set([...selectedQuads, ...newQuads])];
			selectedVertices = newQuads.flat().filter((vId) => !selectedVertices.includes(vId));
		}

		return selectedQuads;
	}

	function getNearestQuad(mouseClick, quads, vertices, scale, origin) {
		const vertexId = getNearestVertex(mouseClick, vertices, scale, origin);
		const candidateQuads = getQuadsFromVertex(vertexId, quads);
		function checkIfInsideQuad(quad, mouseClick) {
			const quadLines = quad.map((vertexId, i) => {
				const j = (i + 1) % quad.length;
				const v1 = scaleVertex(vertices[vertexId], scale, origin);
				const v2 = scaleVertex(vertices[quad[j]], scale, origin);
				return getLinearParams(v1, v2);
			});

			const lineFromOrigin = getLinearParams({ x: 0, y: 0 }, mouseClick);

			const intersectingLines = quadLines.filter((line) => !!getIntersect(line, lineFromOrigin));
			return intersectingLines.length % 2 === 1;
		}

		return candidateQuads.find((quad) => checkIfInsideQuad(quad, mouseClick));
	}

	function paintQuad({ context, mousePos, vertices, quads, scale, origin, colour, fillRule }) {
		const singleQuad = getNearestQuad(mousePos, quads, vertices, scale, origin);
		const shape = { vertices: singleQuad?.map((vertexId) => vertices[vertexId]) };

		return (
			shape.vertices &&
			fillShapes({
				context,
				origin,
				shapes: [shape],
				scale,
				colour,
				fillRule
			})
		);
	}

	function paintQuadGroup({ context, mousePos, vertices, quads, scale, origin, colour, fillRule }) {
		const nearestVertexId = getNearestVertex(mousePos, vertices, scale, origin);
		const selectedQuads = getQuadsFromVertex(nearestVertexId, quads);
		const shapes = selectedQuads?.map((quad) => {
			return { vertices: quad.map((vertexId) => vertices[vertexId]) };
		});

		return (
			shapes &&
			fillShapes({
				context,
				origin,
				shapes,
				scale,
				colour,
				fillRule
			})
		);
	}

	function fitPolygon({ polygonSides = 4, quadGroup, vertices, radius }) {
		// return null if a vertex is locked
		if (
			quadGroup.flat().some((vertexId) => vertices[vertexId]?.locked || vertices[vertexId]?.group)
		)
			return null;

		const TWO_PI = 2 * Math.PI;

		const { cornerVertexIds, edgeVertexIds, middleVertexIds } = getGridOutline(quadGroup);

		const middleVertexId = middleVertexIds[0];

		const middleVertex = vertices[middleVertexId];

		// if polygon cannot be fit, return null
		if (!middleVertex || [...cornerVertexIds, ...edgeVertexIds].length < polygonSides) {
			return null;
		}

		// get the angle to fit the first corner of the polygon to
		const firstCornerId = cornerVertexIds[0];
		const firstCornerAngle = getBearing(vertices[firstCornerId], middleVertex);

		// get bearing of each vertex from middle vertex...
		const vertexAngles = [...cornerVertexIds, ...edgeVertexIds]
			.map((vertexId) => {
				const vertex = vertices[vertexId];
				return [vertexId, getBearing(vertex, middleVertex)];
			})
			// ...in order, starting at first corner angle
			.sort((a, b) => {
				const angleA = a[1] >= firstCornerAngle ? a[1] : a[1] + TWO_PI;
				const angleB = b[1] >= firstCornerAngle ? b[1] : b[1] + TWO_PI;
				return angleA - angleB;
			});

		const targetAngles = fillWithCount(Array(polygonSides), 0).map((index) => {
			const angleInterval = TWO_PI / polygonSides;
			return normaliseAngle(firstCornerAngle + index * angleInterval);
		});

		function getClosestVertexToAngle(vertexAngles, targetAngles) {
			let vertexIndex = 1;
			let targetIndex = 1;
			const results = [[vertexAngles[0][0], 0]];

			while (vertexIndex < vertexAngles.length && targetIndex < targetAngles.length) {
				const [id, angle] = vertexAngles[vertexIndex];
				const targetAngle = targetAngles[targetIndex];
				const currentClosestAngleIndex = results[targetIndex]?.[1];
				const currentClosestAngle = vertexAngles[currentClosestAngleIndex]?.[1] ?? TWO_PI;
				const currentAngleDiff = Math.abs(currentClosestAngle - targetAngle);
				const newAngleDiff = Math.abs(angle - targetAngle);

				if (
					newAngleDiff < currentAngleDiff ||
					vertexAngles.length - vertexIndex <= targetAngles.length - targetIndex - 1
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

		function resolveToPolygon(targetAngles, cornerVertices, vertexAngles, origin, radius, groupId) {
			const { x: x0, y: y0 } = origin;

			// Trackers:

			// polygon corner angle trackers, used to rotate polygon-edge vertices to correct edge:
			const remainingTargetAngles = [...targetAngles];
			// polygon-to-fit angles e.g. [0, pi/2, pi, 3pi/4]
			let prevTargetAngle = targetAngles[targetAngles.length - 1];
			// tracks through target angles e.g. 3pi/4 => 0 => pi/2 => pi => 3pi/4

			// corner index trackers, used to space polygon-edge vertices evenly:
			const remainingCornerIndices = cornerVertices.map(([id, index]) => index);
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

		const cornerVertices = getClosestVertexToAngle(vertexAngles, targetAngles);

		const groupId = [...cornerVertexIds, ...edgeVertexIds, middleVertexId].join('+');

		const polygon = resolveToPolygon(
			targetAngles,
			cornerVertices,
			vertexAngles,
			vertices[middleVertexId],
			radius,
			groupId
		);

		return {
			...polygon,
			[middleVertexId]: { ...vertices[middleVertexId], group: groupId, hidden: true }
		};
	}

	/* EXECUTION */

	let gridSize = $state(DEFAULT_GRID_SIZE);
	let scale = $derived(INITIAL_SCALE / gridSize);

	let { vertices: originalVertices, edges, quads } = $derived(makeHex(gridSize));

	const canvasFn = ({ canvas, overlayCanvas, mousePosition, mouseClick, w, h, offset }) => {
		const mousePos = $derived({ x: mousePosition.x - offset.x, y: mousePosition.y - offset.y });
		let mouseClickPos = $derived(
			typeof mouseClick.x === 'number'
				? { x: mouseClick.x - offset.x, y: mouseClick.y - offset.y }
				: null
		);
		const context = $derived(canvas.getContext('2d'));
		const overlayContext = $derived(overlayCanvas.getContext('2d'));
		const origin = $derived({ x: w / 2, y: h / 2 });

		let newVertices = $state({});
		let vertices = $derived({ ...originalVertices, ...newVertices });

		const {
			currentTheme: {
				baseColours: {
					'colour-warn': colourWarn,
					'colour-error': colourError,
					'colour-info': colourInfo,
					'colour-positive': colourPositive
				}
			}
		} = useTheme();

		$effect(() => {
			if (!mouseClickPos) return;

			const selectedVertexId = getNearestVertex(mouseClickPos, vertices, scale, origin);
			const selectedQuads = getQuadsFromVertex(selectedVertexId, quads);
			const verticesToAdd = fitPolygon({
				polygonSides: POLYGON_SIDES,
				quadGroup: selectedQuads,
				vertices: vertices,
				radius: 0.65
			});

			const quadsToRelax = getQuadsFromVertex(selectedVertexId, quads, RELAXATION_RADIUS);

			const verticesToRelax = {
				...quadsToRelax
					.flat()
					.reduce((acc, vertexId) => ({ ...acc, [vertexId]: vertices[vertexId] }), {}),
				...verticesToAdd
			};

			const relaxedVertices = relaxSubgrid(quadsToRelax, verticesToRelax);

			for (let vertexId in relaxedVertices) {
				if (relaxedVertices[vertexId]) newVertices[vertexId] = relaxedVertices[vertexId];
			}
		});

		/* PAINT CANVAS */

		$effect(() => {
			overlayContext.clearRect(0, 0, w, h);

			function fillRule({ context, vertices }) {
				const prevFillStyle = context.fillStyle;

				if (vertices.some(({ locked, group }) => locked || group)) {
					context.fillStyle = `${colourError}88`;
					context.fill();
					context.fillStyle = prevFillStyle;
				} else {
					context.fill();
				}
			}

			paintQuadGroup({
				context: overlayContext,
				mousePos,
				vertices,
				quads,
				scale,
				origin,
				colour: `${colourPositive}88`,
				fillRule
			});
			paintQuad({
				context: overlayContext,
				mousePos,
				vertices,
				quads,
				scale,
				origin,
				colour: `${colourInfo}88`,
				fillRule
			});
		});

		$effect(() => {
			const watch = gridSize;
			newVertices = [];
		});

		$effect(() => {
			context.clearRect(0, 0, w, h);

			untrack(() => {
				// important! breaks reactivity dependency cycle in fitPolygon $effect
				mouseClickPos = null;
			});

			const shapes = quads.map((quad) => ({
				vertices: quad.map((vertexId) => vertices[vertexId])
			}));

			function strokeRule({ context, vertices }) {
				const prevStrokeStyle = context.strokeStyle;

				if (vertices.some(({ locked, group }) => locked || group)) {
					context.strokeStyle = colourError;
					context.stroke();
					context.strokeStyle = prevStrokeStyle;
				} else {
					context.stroke();
				}
			}

			outlineShapes({
				context,
				origin,
				shapes,
				scale,
				colour: colourInfo,
				strokeRule
			});
		});
	};
</script>

<Page><Canvas2D {canvasFn} height="100vh" width="40rem" customStyle="grid-column: 2;" /></Page>

<div class="toolbar">
	<Tile>
		<label>
			<input type="range" bind:value={gridSize} min="1" max="10" />
			Grid size: {gridSize}
		</label>
	</Tile>
</div>

<style>
	.toolbar {
		position: fixed;
		right: 0;
		margin: var(--header-height) var(--base-spacing) 0;
		display: flex;
		flex-direction: column;
	}
</style>
