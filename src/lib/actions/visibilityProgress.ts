// Action: visibilityProgress
// Usage: <section use:visibilityProgress on:visibilityprogress={(e) => e.detail.ratio}>...</section>
// Adds a CSS variable --visibility-ratio (0 -> 1) to the node, updated with IntersectionObserver entry.intersectionRatio.
// Dispatches a `visibilityprogress` CustomEvent with detail { ratio } on each change.

export interface VisibilityProgressDetail {
  ratio: number; // 0 to 1
  entry: IntersectionObserverEntry;
}

import type { Action } from "svelte/action";

export const visibilityProgress: Action<HTMLElement, IntersectionObserverInit | undefined> = (
  node,
  options = { threshold: buildThresholds() }
) => {
  // Normalize options to always have a decent threshold array for smooth progression
  const normalized: IntersectionObserverInit = {
    ...options,
    threshold: options?.threshold ?? buildThresholds(),
  };
  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    const ratio = entry.intersectionRatio;
    node.style.setProperty("--visibility-ratio", ratio.toString());
    node.dispatchEvent(
      new CustomEvent<VisibilityProgressDetail>("visibilityprogress", {
        detail: { ratio, entry },
      })
    );
  }, normalized);

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    },
  };
};

// Create a fine-grained array of thresholds for a smoother transition.
function buildThresholds(steps = 50) {
  const arr: number[] = [];
  for (let i = 0; i <= steps; i++) arr.push(i / steps);
  return arr;
}
