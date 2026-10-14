import { brandFor, type GamepadBrand } from "../gamepad/brand";

export type GamepadFrameHandler = (pad: Gamepad, brand: GamepadBrand, elapsed: number) => void;

const MAX_FRAME_MS = 64;

function createGamepadStore() {
  let index = $state<number | null>(null);
  let brand = $state<GamepadBrand>("generic");
  const handlers = new Set<GamepadFrameHandler>();
  let frame = 0;
  let lastTime = 0;
  let listening = false;

  function readPads(): (Gamepad | null)[] {
    return typeof navigator.getGamepads === "function" ? Array.from(navigator.getGamepads()) : [];
  }

  function currentPad(): Gamepad | null {
    const pads = readPads();
    const preferred = index === null ? null : pads[index];
    return preferred?.connected ? preferred : (pads.find((pad) => pad?.connected) ?? null);
  }

  function sync() {
    const pad = currentPad();
    index = pad?.index ?? null;
    brand = pad ? brandFor(pad.id) : "generic";
  }

  function tick(time: number) {
    frame = 0;
    const pad = currentPad();
    if (!pad) {
      sync();
      return;
    }

    const elapsed = lastTime ? Math.min(MAX_FRAME_MS, time - lastTime) : 16;
    lastTime = time;
    handlers.forEach((handler) => handler(pad, brand, elapsed));
    frame = requestAnimationFrame(tick);
  }

  function run() {
    if (!frame && index !== null && handlers.size > 0) {
      lastTime = 0;
      frame = requestAnimationFrame(tick);
    }
  }

  function halt() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function handleConnection() {
    sync();
    if (index === null) {
      halt();
    } else {
      run();
    }
  }

  function listen() {
    if (listening) {
      return;
    }

    listening = true;
    window.addEventListener("gamepadconnected", handleConnection);
    window.addEventListener("gamepaddisconnected", handleConnection);
    handleConnection();
  }

  function unlisten() {
    listening = false;
    halt();
    window.removeEventListener("gamepadconnected", handleConnection);
    window.removeEventListener("gamepaddisconnected", handleConnection);
  }

  function onFrame(handler: GamepadFrameHandler) {
    handlers.add(handler);
    listen();
    run();
    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        unlisten();
      }
    };
  }

  return {
    get connected() {
      return index !== null;
    },
    get brand() {
      return brand;
    },
    onFrame,
  };
}

export const gamepadStore = createGamepadStore();
