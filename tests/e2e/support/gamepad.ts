import type { Page } from "@playwright/test";

export const PAD_IDS = {
  xbox: "Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b13)",
  playstation: "DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)",
  nintendo: "Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)",
} as const;

export const BUTTON = {
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

const HOLD_MS = 90;
const RELEASE_MS = 120;

type MockState = {
  connected: boolean;
  id: string;
  buttons: { pressed: boolean; touched: boolean; value: number }[];
  axes: number[];
};

declare global {
  interface Window {
    __gamepad: MockState;
  }
}

export async function installGamepadMock(page: Page) {
  await page.addInitScript(() => {
    const state = {
      connected: false,
      id: "",
      buttons: Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 })),
      axes: [0, 0, 0, 0],
    };
    window.__gamepad = state;
    const snapshot = () => ({
      id: state.id,
      index: 0,
      connected: true,
      mapping: "standard",
      timestamp: performance.now(),
      buttons: state.buttons.map((button) => ({ ...button })),
      axes: [...state.axes],
      vibrationActuator: null,
    });
    Object.defineProperty(navigator, "getGamepads", {
      configurable: true,
      value: () => (state.connected ? [snapshot()] : []),
    });
  });
}

export async function connectGamepad(page: Page, id: string) {
  await page.evaluate((padId) => {
    window.__gamepad.id = padId;
    window.__gamepad.connected = true;
    const event = new Event("gamepadconnected");
    Object.defineProperty(event, "gamepad", { value: navigator.getGamepads()[0] });
    window.dispatchEvent(event);
  }, id);
}

export async function disconnectGamepad(page: Page) {
  await page.evaluate(() => {
    window.__gamepad.connected = false;
    window.dispatchEvent(new Event("gamepaddisconnected"));
  });
}

async function setButton(page: Page, index: number, pressed: boolean) {
  await page.evaluate(
    ([buttonIndex, isPressed]) => {
      window.__gamepad.buttons[buttonIndex as number] = {
        pressed: isPressed as boolean,
        touched: isPressed as boolean,
        value: isPressed ? 1 : 0,
      };
    },
    [index, pressed] as const
  );
}

export async function pressButton(page: Page, index: number) {
  await setButton(page, index, true);
  await page.waitForTimeout(HOLD_MS);
  await setButton(page, index, false);
  await page.waitForTimeout(RELEASE_MS);
}

export async function holdAxis(page: Page, axis: number, value: number, durationMs: number) {
  await page.evaluate(([index, amount]) => (window.__gamepad.axes[index] = amount), [axis, value]);
  await page.waitForTimeout(durationMs);
  await page.evaluate((index) => (window.__gamepad.axes[index] = 0), axis);
}
