import type { Action } from "svelte/action";

export type ScrollRevealSide = "left" | "right";

export interface ScrollRevealOptions {
  from?: ScrollRevealSide;
  distance?: number;
  lag?: number;
}

type Tracked = {
  node: HTMLElement;
  from: ScrollRevealSide;
  distance: number;
  lag: number;
};

const DEFAULT_DISTANCE = 96;
const REVEAL_SPAN = 0.45;
const MIN_SCALE = 0.94;

const tracked = new Set<Tracked>();
let frame = 0;

function motionEnabled(): boolean {
  return (
    !matchMedia("(prefers-reduced-motion: reduce)").matches &&
    document.documentElement.dataset.animations !== "off"
  );
}

function easeOutCubic(value: number): number {
  return 1 - Math.pow(1 - value, 3);
}

function clear(item: Tracked) {
  item.node.style.removeProperty("transform");
  item.node.style.removeProperty("opacity");
}

function update() {
  frame = 0;
  if (!motionEnabled()) {
    tracked.forEach(clear);
    return;
  }

  const viewport = window.innerHeight;
  const progresses = Array.from(tracked, (item) => {
    const entered = (viewport - item.node.getBoundingClientRect().top) / (viewport * REVEAL_SPAN);
    return Math.min(1, Math.max(0, entered - item.lag));
  });

  Array.from(tracked).forEach((item, index) => {
    const eased = easeOutCubic(progresses[index]);
    const direction = item.from === "left" ? -1 : 1;
    const offset = (1 - eased) * item.distance * direction;
    const scale = MIN_SCALE + (1 - MIN_SCALE) * eased;
    item.node.style.transform =
      eased === 1 ? "" : `translate3d(${offset.toFixed(2)}px, 0, 0) scale(${scale.toFixed(4)})`;
    item.node.style.opacity = eased === 1 ? "" : eased.toFixed(4);
  });
}

function schedule() {
  if (!frame) {
    frame = requestAnimationFrame(update);
  }
}

function listen() {
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("animations:enabled", schedule);
  window.addEventListener("animations:disabled", schedule);
}

function unlisten() {
  cancelAnimationFrame(frame);
  frame = 0;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  window.removeEventListener("animations:enabled", schedule);
  window.removeEventListener("animations:disabled", schedule);
}

export const scrollReveal: Action<HTMLElement, ScrollRevealOptions | undefined> = (
  node,
  options = {}
) => {
  const item: Tracked = {
    node,
    from: options.from ?? "left",
    distance: options.distance ?? DEFAULT_DISTANCE,
    lag: options.lag ?? 0,
  };

  if (tracked.size === 0) {
    listen();
  }
  tracked.add(item);
  update();

  return {
    update(next: ScrollRevealOptions = {}) {
      item.from = next.from ?? "left";
      item.distance = next.distance ?? DEFAULT_DISTANCE;
      item.lag = next.lag ?? 0;
      schedule();
    },
    destroy() {
      tracked.delete(item);
      clear(item);
      if (tracked.size === 0) {
        unlisten();
      }
    },
  };
};
