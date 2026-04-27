const TWO_PI = 2 * Math.PI;
        
export function getLinearParams(v1, v2) {
    const m = (v1.y - v2.y) / (v1.x - v2.x);
    const c = v1.y - m * v1.x;
    return { m, c, x1: v1.x, x2: v2.x };
}

export function getIntersect(line1, line2) {
    const intersectX = (line1.c - line2.c) / (line2.m - line1.m);
    const line1XRange = [line1.x1, line1.x2].sort((a, b) => a-b);
    const line2XRange = [line2.x1, line2.x2].sort((a, b) => a-b);
    
    return intersectX > line1XRange[0] &&
        intersectX < line1XRange[1] &&
        intersectX > line2XRange[0] &&
        intersectX < line2XRange[1]
        ? { x: intersectX, y: line1.m * intersectX + line1.c }
        : null;
}

export function normaliseAngle(angle) {
    return (angle + TWO_PI) % TWO_PI
}

export function getBearing(v1, v2) {
    const dX = v1.x - v2.x;
    const dY = v1.y - v2.y;
    return normaliseAngle(Math.atan2(dY, dX));
}

export function getHypotenuse(dX, dY) {
    return Math.sqrt(Math.pow(dY, 2) + Math.pow(dX, 2));
}

export function getDistance(v1, v2) {
    const dX = v1.x - v2.x;
    const dY = v1.y - v2.y;
    return Math.sqrt(Math.pow(dY, 2) + Math.pow(dX, 2));
}

export function getVector(v1, v2) {
    const angle = getBearing(v1, v2)
    const magnitude = getDistance(v1, v2)
    return {angle, magnitude}
}

export function resolveVector(vector, angle) {
    const angleDiff = vector.angle - angle
    const parallelMagnitude = vector.magnitude * Math.cos(angleDiff)
    const perpendicularMagnitude = vector.magnitude * Math.sin(angleDiff)
    return {parallel: parallelMagnitude, perpendicular: perpendicularMagnitude}
}

export function sumDimensions(positions) {
    return positions.reduce(
        (acc, { x, y }) => {
            acc.x += x;
            acc.y += y;
            return acc;
        },
        { x: 0, y: 0 }
    );
}

export function getAveragePosition(vertices) {
    const vertexCount = vertices.length
    return vertices.reduce((acc, {x, y}) => ({
        x: acc.x + x / vertexCount,
        y: acc.y + y / vertexCount,
    }), {x: 0, y: 0})
}

	// function getRgb(red, green, blue) {
	// 	return (
	// 		(red & 0xf0 ? '#' : red & 0xf ? '#0' : '#00') +
	// 		((red << 16) | (green << 8) | blue).toString(16)
	// 	);
	// }