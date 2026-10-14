import { describe, expect, it } from "vitest";
import {
  closestInDirection,
  directionalScore,
  edgeAnchor,
  type Box,
} from "../../src/lib/gamepad/spatial";

function box(left: number, top: number, width = 100, height = 40): Box {
  return { left, top, right: left + width, bottom: top + height };
}

describe("directionalScore", () => {
  const origin = box(100, 100);

  it("rejects candidates behind the movement direction", () => {
    expect(directionalScore(origin, box(100, 0), "down")).toBeNull();
    expect(directionalScore(origin, box(100, 300), "up")).toBeNull();
    expect(directionalScore(origin, box(0, 100), "right")).toBeNull();
  });

  it("prefers aligned candidates over diagonal ones", () => {
    const aligned = directionalScore(origin, box(100, 200), "down");
    const diagonal = directionalScore(origin, box(400, 180), "down");
    expect(aligned).not.toBeNull();
    expect(diagonal).not.toBeNull();
    expect(aligned!).toBeLessThan(diagonal!);
  });

  it("only moves sideways within the same row", () => {
    expect(directionalScore(origin, box(300, 100), "right")).not.toBeNull();
    expect(directionalScore(origin, box(300, 400), "right")).toBeNull();
  });
});

describe("closestInDirection", () => {
  it("picks the nearest candidate in the requested direction", () => {
    const result = closestInDirection(
      box(0, 0),
      [
        { item: "far", box: box(0, 400) },
        { item: "near", box: box(0, 80) },
        { item: "above", box: box(0, -100) },
      ],
      "down"
    );
    expect(result?.item).toBe("near");
  });

  it("returns null when nothing lies in that direction", () => {
    expect(
      closestInDirection(box(0, 0), [{ item: "above", box: box(0, -100) }], "down")
    ).toBeNull();
  });
});

describe("edgeAnchor", () => {
  const width = 1000;
  const height = 800;

  it("continues downward from the top of the screen", () => {
    const result = closestInDirection(
      edgeAnchor("down", width, height),
      [
        { item: "lower", box: box(400, 600) },
        { item: "upper", box: box(100, 120) },
      ],
      "down"
    );
    expect(result?.item).toBe("upper");
  });

  it("continues upward from the bottom of the screen", () => {
    const result = closestInDirection(
      edgeAnchor("up", width, height),
      [
        { item: "upper", box: box(100, 120) },
        { item: "lower", box: box(400, 600) },
      ],
      "up"
    );
    expect(result?.item).toBe("lower");
  });

  it("allows sideways movement across the whole screen height", () => {
    const result = closestInDirection(
      edgeAnchor("right", width, height),
      [{ item: "only", box: box(500, 700) }],
      "right"
    );
    expect(result?.item).toBe("only");
  });
});
