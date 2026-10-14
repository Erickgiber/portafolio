import type Lenis from "lenis";

type ScrollOptions = {
  immediate?: boolean;
  duration?: number;
};

let smoothScroller: Lenis | null = null;

export function motionEnabled(): boolean {
  return (
    !matchMedia("(prefers-reduced-motion: reduce)").matches &&
    document.documentElement.dataset.animations !== "off"
  );
}

export function useSmoothScroller(scroller: Lenis | null) {
  smoothScroller = scroller;
}

export function scrollPageTo(top: number, { immediate = false, duration }: ScrollOptions = {}) {
  if (smoothScroller) {
    smoothScroller.scrollTo(
      top,
      immediate ? { immediate, force: true } : { duration, force: true }
    );
    return;
  }

  window.scrollTo({ top, behavior: immediate || !motionEnabled() ? "instant" : "smooth" });
}

export function scrollPageBy(delta: number, immediate = false) {
  if (smoothScroller) {
    smoothScroller.scrollTo(smoothScroller.targetScroll + delta, { immediate, force: true });
    return;
  }

  window.scrollBy({ top: delta, behavior: "instant" });
}

export function lockPageScroll(): () => void {
  const root = document.documentElement;
  const previous = root.style.overflow;
  smoothScroller?.stop();
  root.style.overflow = "hidden";
  return () => {
    root.style.overflow = previous;
    smoothScroller?.start();
  };
}
