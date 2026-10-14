import { describe, expect, it } from "vitest";
import {
  BUTTON_INDEX,
  STICK_DEADZONE,
  backButton,
  confirmButton,
  dominant,
  horizontalAxes,
  markCentered,
  readControls,
  shapeStick,
  stickValue,
  verticalAxes,
  type PadSnapshot,
} from "../../src/lib/gamepad/controls";

function pad(pressed: number[] = [], axes: number[] = [0, 0, 0, 0]): PadSnapshot {
  return {
    buttons: Array.from({ length: 17 }, (_, index) => ({
      pressed: pressed.includes(index),
      value: pressed.includes(index) ? 1 : 0,
    })),
    axes,
  };
}

describe("button layout per brand", () => {
  it("confirms with the bottom button and goes back with the right one on Xbox and PlayStation", () => {
    for (const brand of ["xbox", "playstation", "generic"] as const) {
      expect(confirmButton(brand)).toBe("south");
      expect(backButton(brand)).toBe("east");
    }
  });

  it("follows the Nintendo convention of A to confirm and B to go back", () => {
    expect(confirmButton("nintendo")).toBe("east");
    expect(backButton("nintendo")).toBe("south");
  });
});

describe("readControls", () => {
  it("maps the standard layout to actions", () => {
    const controls = readControls(
      pad([BUTTON_INDEX.south, BUTTON_INDEX.next, BUTTON_INDEX.down]),
      "xbox",
      true
    );
    expect(controls.confirm).toBe(true);
    expect(controls.next).toBe(true);
    expect(controls.down).toBe(true);
    expect(controls.back).toBe(false);
    expect(controls.previous).toBe(false);
  });

  it("swaps confirm and back on Nintendo controllers", () => {
    const southOnly = readControls(pad([BUTTON_INDEX.south]), "nintendo", true);
    expect(southOnly.back).toBe(true);
    expect(southOnly.confirm).toBe(false);

    const eastOnly = readControls(pad([BUTTON_INDEX.east]), "nintendo", true);
    expect(eastOnly.confirm).toBe(true);
  });

  it("treats analog values above the threshold as pressed", () => {
    const snapshot = pad();
    const buttons = [...snapshot.buttons];
    buttons[BUTTON_INDEX.west] = { pressed: false, value: 0.8 };
    expect(readControls({ ...snapshot, buttons }, "xbox", true).west).toBe(true);
  });

  it("steers focus horizontally with the left stick only when allowed", () => {
    const tilted = pad([], [0.9, 0, 0, 0]);
    expect(readControls(tilted, "xbox", true).right).toBe(true);
    expect(readControls(tilted, "xbox", false).right).toBe(false);
  });

  it("tolerates controllers that report fewer buttons", () => {
    const controls = readControls(
      { buttons: [{ pressed: true, value: 1 }], axes: [] },
      "xbox",
      true
    );
    expect(controls.confirm).toBe(true);
    expect(controls.up).toBe(false);
  });
});

describe("shapeStick", () => {
  it("ignores drift inside the deadzone", () => {
    expect(shapeStick(STICK_DEADZONE * 0.9)).toBe(0);
    expect(shapeStick(-STICK_DEADZONE * 0.5)).toBe(0);
  });

  it("reaches full speed at full tilt in both directions", () => {
    expect(shapeStick(1)).toBe(1);
    expect(shapeStick(-1)).toBe(-1);
  });

  it("grows monotonically and never exceeds one", () => {
    let previous = 0;
    for (let value = STICK_DEADZONE; value <= 1.2; value += 0.05) {
      const shaped = shapeStick(value);
      expect(shaped).toBeGreaterThanOrEqual(previous);
      expect(shaped).toBeLessThanOrEqual(1);
      previous = shaped;
    }
  });
});

describe("dominant", () => {
  it("keeps the axis with the largest magnitude", () => {
    expect(dominant(0.2, -0.7)).toBe(-0.7);
    expect(dominant(0.5, 0.1)).toBe(0.5);
  });
});

describe("stick calibration", () => {
  function snapshot(axes: number[], mapping: string): PadSnapshot {
    return { ...pad([], axes), mapping };
  }

  it("only trusts the right stick on the standard mapping", () => {
    expect(verticalAxes(snapshot([0, 0, 0, 0], "standard"))).toEqual([1, 3]);
    expect(verticalAxes(snapshot([0, 0, 0, 0], ""))).toEqual([1]);
    expect(horizontalAxes(snapshot([0, 0, 0, 0], ""))).toEqual([0]);
  });

  it("does not scroll from a trigger resting at -1 on a non-standard mapping", () => {
    const resting = snapshot([0, 0, 0, -1, -1, 0], "");
    const centered = new Set<number>();
    markCentered(centered, resting);
    expect(stickValue(resting, verticalAxes(resting), centered)).toBe(0);
  });

  it("ignores an axis that has never been centered since connecting", () => {
    const resting = snapshot([0, 0, 0, -1], "standard");
    const centered = new Set<number>();
    markCentered(centered, resting);
    expect(centered.has(3)).toBe(false);
    expect(stickValue(resting, verticalAxes(resting), centered)).toBe(0);

    markCentered(centered, snapshot([0, 0, 0, 0.05], "standard"));
    expect(stickValue(resting, verticalAxes(resting), centered)).toBe(-1);
  });

  it("uses a centered left stick right away", () => {
    const centered = new Set<number>();
    markCentered(centered, snapshot([0, 0, 0, 0], "standard"));
    const pushed = snapshot([0, 1, 0, 0], "standard");
    expect(stickValue(pushed, verticalAxes(pushed), centered)).toBe(1);
  });

  it("does not steer focus with an uncentered horizontal axis", () => {
    const drifting = snapshot([0.9, 0, 0, 0], "standard");
    expect(readControls(drifting, "xbox", true, new Set()).right).toBe(false);
    expect(readControls(drifting, "xbox", true, new Set([0])).right).toBe(true);
  });
});
