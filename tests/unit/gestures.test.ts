import { describe, expect, it } from "vitest";
import {
  IDENTITY,
  MAX_SCALE,
  MIN_SCALE,
  clampPan,
  clampScale,
  classifySwipe,
  wrapIndex,
  zoomAround,
} from "../../src/lib/viewer/gestures";

const content = { width: 800, height: 450 };
const viewport = { width: 1000, height: 600 };

describe("clampScale", () => {
  it("keeps the zoom within limits", () => {
    expect(clampScale(0.2)).toBe(MIN_SCALE);
    expect(clampScale(10)).toBe(MAX_SCALE);
    expect(clampScale(2)).toBe(2);
  });
});

describe("clampPan", () => {
  it("does not allow panning when the image fits", () => {
    const clamped = clampPan({ scale: 1, x: 300, y: -200 }, content, viewport);
    expect(clamped.x).toBe(0);
    expect(clamped.y).toBe(0);
  });

  it("limits panning to the overflowing area when zoomed", () => {
    const clamped = clampPan({ scale: 2, x: 9999, y: -9999 }, content, viewport);
    expect(clamped.x).toBe((800 * 2 - 1000) / 2);
    expect(clamped.y).toBe(-(450 * 2 - 600) / 2);
  });
});

describe("zoomAround", () => {
  it("keeps the point under the cursor in place", () => {
    const focus = { x: 100, y: 50 };
    const zoomed = zoomAround(IDENTITY, 2, focus, content, viewport);
    expect((focus.x - zoomed.x) / zoomed.scale).toBeCloseTo(focus.x);
    expect((focus.y - zoomed.y) / zoomed.scale).toBeCloseTo(focus.y);
  });

  it("returns to the original view when zooming all the way out", () => {
    expect(
      zoomAround({ scale: 3, x: 120, y: -40 }, 0.5, { x: 0, y: 0 }, content, viewport)
    ).toEqual(IDENTITY);
  });
});

describe("classifySwipe", () => {
  it("detects horizontal swipes to change images", () => {
    expect(classifySwipe(-120, 10, 300)).toBe("next");
    expect(classifySwipe(140, -15, 300)).toBe("previous");
  });

  it("detects quick flicks with less distance", () => {
    expect(classifySwipe(-40, 0, 40)).toBe("next");
  });

  it("closes when swiping down", () => {
    expect(classifySwipe(5, 160, 300)).toBe("close");
  });

  it("ignores small, slow or ambiguous movements", () => {
    expect(classifySwipe(-30, 0, 500)).toBeNull();
    expect(classifySwipe(80, 80, 300)).toBeNull();
    expect(classifySwipe(0, -200, 300)).toBeNull();
  });
});

describe("wrapIndex", () => {
  it("wraps in both directions", () => {
    expect(wrapIndex(-1, 4)).toBe(3);
    expect(wrapIndex(4, 4)).toBe(0);
    expect(wrapIndex(2, 4)).toBe(2);
    expect(wrapIndex(3, 0)).toBe(0);
  });
});
