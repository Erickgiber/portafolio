import type { GamepadBrand } from "./brand";

export type FaceButton = "south" | "east" | "west" | "north";

export type Control =
  | "up"
  | "down"
  | "left"
  | "right"
  | "confirm"
  | "back"
  | "west"
  | "north"
  | "previous"
  | "next";

export type PadSnapshot = {
  buttons: ReadonlyArray<{ pressed: boolean; value: number } | undefined>;
  axes: ReadonlyArray<number>;
  mapping?: string;
};

export const BUTTON_INDEX = {
  south: 0,
  east: 1,
  west: 2,
  north: 3,
  previous: 4,
  next: 5,
  up: 12,
  down: 13,
  left: 14,
  right: 15,
} as const;

export const AXIS_INDEX = { leftX: 0, leftY: 1, rightX: 2, rightY: 3 } as const;

export const STICK_DEADZONE = 0.2;
export const STICK_DIRECTION_THRESHOLD = 0.65;
export const STICK_CURVE = 1.5;
const BUTTON_THRESHOLD = 0.5;

export function confirmButton(brand: GamepadBrand): FaceButton {
  return brand === "nintendo" ? "east" : "south";
}

export function backButton(brand: GamepadBrand): FaceButton {
  return brand === "nintendo" ? "south" : "east";
}

export function isPressed(pad: PadSnapshot, index: number): boolean {
  const button = pad.buttons[index];
  return !!button && (button.pressed || button.value > BUTTON_THRESHOLD);
}

export function axisValue(pad: PadSnapshot, index: number): number {
  return pad.axes[index] ?? 0;
}

export function horizontalAxes(pad: PadSnapshot): number[] {
  return pad.mapping === "standard" ? [AXIS_INDEX.leftX, AXIS_INDEX.rightX] : [AXIS_INDEX.leftX];
}

export function verticalAxes(pad: PadSnapshot): number[] {
  return pad.mapping === "standard" ? [AXIS_INDEX.leftY, AXIS_INDEX.rightY] : [AXIS_INDEX.leftY];
}

export function markCentered(centered: Set<number>, pad: PadSnapshot) {
  pad.axes.forEach((value, index) => {
    if (Math.abs(value) < STICK_DEADZONE) {
      centered.add(index);
    }
  });
}

export function stickValue(
  pad: PadSnapshot,
  indices: ReadonlyArray<number>,
  centered?: ReadonlySet<number>
): number {
  const strongest = indices
    .filter((index) => !centered || centered.has(index))
    .map((index) => axisValue(pad, index))
    .reduce((best, value) => dominant(best, value), 0);
  return shapeStick(strongest);
}

export function readControls(
  pad: PadSnapshot,
  brand: GamepadBrand,
  stickSteersFocus: boolean,
  centered?: ReadonlySet<number>
): Record<Control, boolean> {
  const usable = stickSteersFocus && (!centered || centered.has(AXIS_INDEX.leftX));
  const stickX = usable ? axisValue(pad, AXIS_INDEX.leftX) : 0;
  return {
    up: isPressed(pad, BUTTON_INDEX.up),
    down: isPressed(pad, BUTTON_INDEX.down),
    left: isPressed(pad, BUTTON_INDEX.left) || stickX < -STICK_DIRECTION_THRESHOLD,
    right: isPressed(pad, BUTTON_INDEX.right) || stickX > STICK_DIRECTION_THRESHOLD,
    confirm: isPressed(pad, BUTTON_INDEX[confirmButton(brand)]),
    back: isPressed(pad, BUTTON_INDEX[backButton(brand)]),
    west: isPressed(pad, BUTTON_INDEX.west),
    north: isPressed(pad, BUTTON_INDEX.north),
    previous: isPressed(pad, BUTTON_INDEX.previous),
    next: isPressed(pad, BUTTON_INDEX.next),
  };
}

export function shapeStick(value: number): number {
  const magnitude = Math.abs(value);
  if (magnitude < STICK_DEADZONE) {
    return 0;
  }

  const normalized = Math.min(1, (magnitude - STICK_DEADZONE) / (1 - STICK_DEADZONE));
  return Math.sign(value) * Math.pow(normalized, STICK_CURVE);
}

export function dominant(first: number, second: number): number {
  return Math.abs(first) >= Math.abs(second) ? first : second;
}
