import type { Action } from "svelte/action";

export type ScrollRevealFrom = "up" | "left" | "right";

export interface ScrollRevealOptions {
  from?: ScrollRevealFrom;
  delay?: number;
}

type Tracked = {
  animation: Animation | null;
  delay: number;
  from: ScrollRevealFrom;
};

const RISE_PX = 24;
const SHIFT_PX = 20;
const DURATION_MS = 750;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const TRIGGER_MARGIN = "0px 0px -12% 0px";

const tracked = new Map<Element, Tracked>();
let observer: IntersectionObserver | null = null;

function motionEnabled(): boolean {
  return (
    !matchMedia("(prefers-reduced-motion: reduce)").matches &&
    document.documentElement.dataset.animations !== "off"
  );
}

function startOffset(from: ScrollRevealFrom): string {
  const shift = from === "left" ? -SHIFT_PX : from === "right" ? SHIFT_PX : 0;
  return `translate3d(${shift}px, ${RISE_PX}px, 0)`;
}

function hide(node: Element, item: Tracked) {
  item.animation = node.animate(
    [
      { opacity: 0, transform: startOffset(item.from) },
      { opacity: 1, transform: "none" },
    ],
    { duration: DURATION_MS, delay: item.delay, easing: EASING, fill: "both" }
  );
  item.animation.pause();
}

function show(node: Element) {
  const item = tracked.get(node);
  observer?.unobserve(node);
  if (!item?.animation) {
    return;
  }

  const animation = item.animation;
  animation.onfinish = () => {
    animation.cancel();
    if (item.animation === animation) {
      item.animation = null;
    }
  };
  animation.play();
}

function settle() {
  tracked.forEach((item, node) => {
    item.animation?.cancel();
    item.animation = null;
    observer?.unobserve(node);
  });
}

function connect() {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show(entry.target);
        }
      });
    },
    { rootMargin: TRIGGER_MARGIN }
  );
  window.addEventListener("animations:disabled", settle);
}

function disconnect() {
  observer?.disconnect();
  observer = null;
  window.removeEventListener("animations:disabled", settle);
}

export const scrollReveal: Action<HTMLElement, ScrollRevealOptions | undefined> = (
  node,
  options = {}
) => {
  if (!observer) {
    connect();
  }

  const item: Tracked = {
    animation: null,
    delay: options.delay ?? 0,
    from: options.from ?? "up",
  };
  tracked.set(node, item);

  if (motionEnabled()) {
    hide(node, item);
    observer?.observe(node);
  }

  return {
    destroy() {
      item.animation?.cancel();
      observer?.unobserve(node);
      tracked.delete(node);
      if (tracked.size === 0) {
        disconnect();
      }
    },
  };
};
