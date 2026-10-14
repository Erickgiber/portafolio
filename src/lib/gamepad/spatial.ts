export type NavigationDirection = "up" | "down" | "left" | "right";

export type Box = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

const ORTHOGONAL_WEIGHT = 2;
const HORIZONTAL_ROW_TOLERANCE = 1.5;

function gap(start: number, end: number, otherStart: number, otherEnd: number): number {
  return Math.max(0, otherStart - end, start - otherEnd);
}

export function directionalScore(
  from: Box,
  to: Box,
  direction: NavigationDirection
): number | null {
  const vertical = direction === "up" || direction === "down";
  const forward = direction === "down" || direction === "right";
  const fromCenter = vertical ? (from.top + from.bottom) / 2 : (from.left + from.right) / 2;
  const toCenter = vertical ? (to.top + to.bottom) / 2 : (to.left + to.right) / 2;
  if (forward ? toCenter <= fromCenter : toCenter >= fromCenter) {
    return null;
  }

  const primary = vertical
    ? forward
      ? to.top - from.bottom
      : from.top - to.bottom
    : forward
      ? to.left - from.right
      : from.left - to.right;
  const orthogonal = vertical
    ? gap(from.left, from.right, to.left, to.right)
    : gap(from.top, from.bottom, to.top, to.bottom);

  if (!vertical && orthogonal > (from.bottom - from.top) * HORIZONTAL_ROW_TOLERANCE) {
    return null;
  }

  return Math.max(0, primary) + orthogonal * ORTHOGONAL_WEIGHT;
}

export function closestInDirection<T>(
  from: Box,
  candidates: ReadonlyArray<{ item: T; box: Box }>,
  direction: NavigationDirection
): { item: T; box: Box; score: number } | null {
  let best: { item: T; box: Box; score: number } | null = null;
  for (const candidate of candidates) {
    const score = directionalScore(from, candidate.box, direction);
    if (score !== null && (!best || score < best.score)) {
      best = { ...candidate, score };
    }
  }
  return best;
}
