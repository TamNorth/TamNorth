export function getLinearParams(v1, v2) {
    const m = (v1.y - v2.y) / (v1.x - v2.x);
    const c = v1.y - m * v1.x;
    return { m, c, x1: v1.x, x2: v2.x };
}

export function getIntersect(line1, line2) {
    const intersectX = (line1.c - line2.c) / (line2.m - line1.m);
    const line1XRange = [line1.x1, line1.x2].sort();
    const line2XRange = [line2.x1, line2.x2].sort();
    
    return intersectX > line1XRange[0] &&
        intersectX < line1XRange[1] &&
        intersectX > line2XRange[0] &&
        intersectX < line2XRange[1]
        ? { x: intersectX, y: line1.m * intersectX + line1.c }
        : null;
}