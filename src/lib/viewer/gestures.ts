export type Size = { width: number; height: number };
export type Point = { x: number; y: number };
export type ViewTransform = { scale: number; x: number; y: number };
export type SwipeIntent = "next" | "previous" | "close" | null;

export const MIN_SCALE = 1;
export const MAX_SCALE = 4;
export const IDENTITY: ViewTransform = { scale: 1, x: 0, y: 0 };

const SWIPE_DISTANCE_PX = 60;
const CLOSE_DISTANCE_PX = 110;
const FLICK_VELOCITY = 0.5;
const FLICK_MIN_DISTANCE_PX = 24;
const AXIS_DOMINANCE = 1.2;

export function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function clampAxis(value: number, limit: number): number {
  const clamped = Math.min(limit, Math.max(-limit, value));
  return clamped === 0 ? 0 : clamped;
}

export function clampPan(transform: ViewTransform, content: Size, viewport: Size): ViewTransform {
  const maxX = Math.max(0, (content.width * transform.scale - viewport.width) / 2);
  const maxY = Math.max(0, (content.height * transform.scale - viewport.height) / 2);
  return {
    scale: transform.scale,
    x: clampAxis(transform.x, maxX),
    y: clampAxis(transform.y, maxY),
  };
}

export function zoomAround(
  transform: ViewTransform,
  nextScale: number,
  focus: Point,
  content: Size,
  viewport: Size
): ViewTransform {
  const scale = clampScale(nextScale);
  if (scale === MIN_SCALE) {
    return IDENTITY;
  }

  const ratio = scale / transform.scale;
  return clampPan(
    {
      scale,
      x: focus.x - (focus.x - transform.x) * ratio,
      y: focus.y - (focus.y - transform.y) * ratio,
    },
    content,
    viewport
  );
}

export function classifySwipe(dx: number, dy: number, elapsedMs: number): SwipeIntent {
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  const velocity = Math.max(absX, absY) / Math.max(1, elapsedMs);
  const flick = velocity > FLICK_VELOCITY;

  if (
    absX > absY * AXIS_DOMINANCE &&
    (absX > SWIPE_DISTANCE_PX || (flick && absX > FLICK_MIN_DISTANCE_PX))
  ) {
    return dx < 0 ? "next" : "previous";
  }

  if (
    dy > 0 &&
    absY > absX * AXIS_DOMINANCE &&
    (absY > CLOSE_DISTANCE_PX || (flick && absY > FLICK_MIN_DISTANCE_PX))
  ) {
    return "close";
  }

  return null;
}

export function wrapIndex(index: number, length: number): number {
  return length > 0 ? ((index % length) + length) % length : 0;
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
