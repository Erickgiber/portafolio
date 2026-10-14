import { flushSync } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import { gamepadLayers, type GamepadLayer } from "../../src/lib/stores/gamepadLayers.svelte";

const releases: (() => void)[] = [];

function push(layer: GamepadLayer) {
  const release = gamepadLayers.push(layer);
  releases.push(release);
  return release;
}

function action(label: string) {
  return { label: () => label, run: () => {} };
}

afterEach(() => {
  releases.splice(0).forEach((release) => release());
});

describe("gamepadLayers", () => {
  it("can be pushed from an effect without re-running it in a loop", () => {
    let open = $state(false);
    let runs = 0;
    const stop = $effect.root(() => {
      $effect(() => {
        if (!open) {
          return;
        }
        runs += 1;
        return gamepadLayers.push({ actions: {} });
      });
    });

    flushSync();
    open = true;
    flushSync();
    expect(runs).toBe(1);
    expect(gamepadLayers.layers).toHaveLength(1);

    open = false;
    flushSync();
    expect(gamepadLayers.layers).toHaveLength(0);
    stop();
  });

  it("resolves each action from the topmost layer that defines it", () => {
    push({ actions: { back: action("base back"), west: action("base west") } });
    push({ actions: { back: action("menu back") } });
    expect(gamepadLayers.action("back")?.label()).toBe("menu back");
    expect(gamepadLayers.action("west")?.label()).toBe("base west");
  });

  it("stops falling through at an exclusive layer", () => {
    push({ actions: { west: action("base west") } });
    push({ exclusive: true, actions: { back: action("viewer back") } });
    expect(gamepadLayers.action("west")).toBeUndefined();
    expect(gamepadLayers.action("back")?.label()).toBe("viewer back");
  });

  it("removes only the released layer", () => {
    push({ actions: { back: action("first") } });
    const release = gamepadLayers.push({ actions: { back: action("second") } });
    release();
    expect(gamepadLayers.layers).toHaveLength(1);
    expect(gamepadLayers.action("back")?.label()).toBe("first");
  });
});
