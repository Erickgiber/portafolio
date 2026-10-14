import { untrack } from "svelte";

export type GamepadAction = "back" | "west" | "north" | "shoulders";

export type GamepadLayerAction = {
  label: () => string;
  run: (direction: -1 | 1) => void;
};

export type GamepadLayer = {
  scope?: () => HTMLElement | null | undefined;
  exclusive?: boolean;
  actions: Partial<Record<GamepadAction, GamepadLayerAction>>;
  stick?: (x: number, y: number, elapsed: number) => void;
  stickLabel?: () => string;
};

function createGamepadLayers() {
  let layers = $state.raw<GamepadLayer[]>([]);

  function push(layer: GamepadLayer) {
    layers = [...untrack(() => layers), layer];
    return () => {
      layers = untrack(() => layers).filter((current) => current !== layer);
    };
  }

  function action(name: GamepadAction): GamepadLayerAction | undefined {
    for (let index = layers.length - 1; index >= 0; index--) {
      const found = layers[index].actions[name];
      if (found || layers[index].exclusive) {
        return found;
      }
    }
    return undefined;
  }

  function top(): GamepadLayer | undefined {
    return layers.at(-1);
  }

  function scope(): HTMLElement | null {
    for (let index = layers.length - 1; index >= 0; index--) {
      const element = layers[index].scope?.();
      if (element) {
        return element;
      }
    }
    return null;
  }

  return {
    get layers() {
      return layers;
    },
    push,
    action,
    top,
    scope,
  };
}

export const gamepadLayers = createGamepadLayers();
