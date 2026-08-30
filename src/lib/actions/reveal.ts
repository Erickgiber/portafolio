// IntersectionObserver based reveal animation action
// Usage: <div use:reveal={{ delay: 0, distance: 24, direction: 'up' }}></div>
// Respects global animations toggle via documentElement.dataset.animations

interface RevealOptions {
  delay?: number; // ms
  distance?: number; // px translate distance
  duration?: number; // ms
  direction?: "up" | "down" | "left" | "right" | "zoom";
  once?: boolean; // reveal only first time
  replayOnEnable?: boolean; // si animaciones se activan después, volver a animar
}

const observers = new WeakMap<Element, IntersectionObserver>();

export function reveal(node: HTMLElement, options: RevealOptions = {}) {
  const {
    delay = 0,
    distance = 32,
    duration = 550,
    direction = "up",
    once = true,
    replayOnEnable = false,
  } = options;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function isEnabled() {
    return !reduced && document.documentElement.dataset.animations !== "off";
  }

  const axis = (dir: string) => {
    switch (dir) {
      case "up":
        return `translate3d(0, ${distance}px, 0)`;
      case "down":
        return `translate3d(0, -${distance}px, 0)`;
      case "left":
        return `translate3d(${distance}px, 0, 0)`;
      case "right":
        return `translate3d(-${distance}px, 0, 0)`;
      case "zoom":
        return "scale(.95)";
      default:
        return `translate3d(0, ${distance}px, 0)`;
    }
  };

  let revealed = false;
  let cleanupTimer: ReturnType<typeof setTimeout> | null = null;

  function prepareInitial() {
    if (isEnabled()) {
      node.style.opacity = "0";
      node.style.transform = axis(direction);
    } else {
      node.style.opacity = "";
      node.style.transform = "";
    }
  }

  prepareInitial();

  function triggerReveal() {
    node.style.transition = `opacity ${duration}ms cubic-bezier(.4,0,.2,1) ${delay}ms, transform ${duration}ms cubic-bezier(.4,0,.2,1) ${delay}ms`;
    node.style.opacity = "1";
    node.style.transform = "none";
    revealed = true;

    // Limpiar estilos inline de transform y transition tras terminar la animación
    // Esto permite que las reglas CSS nativas de hover (hover:-translate-y-1) funcionen fluidas
    if (cleanupTimer) clearTimeout(cleanupTimer);
    cleanupTimer = setTimeout(
      () => {
        if (revealed && isEnabled()) {
          node.style.removeProperty("transform");
          node.style.removeProperty("transition");
        }
      },
      delay + duration + 50
    );
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!isEnabled()) {
            node.style.opacity = "";
            node.style.transform = "";
            revealed = true;
          } else if (!revealed) {
            triggerReveal();
          }
          if (once && !replayOnEnable && revealed) observer.unobserve(node);
        } else if (!once && isEnabled()) {
          node.style.opacity = "0";
          node.style.transform = axis(direction);
          revealed = false;
        }
      });
    },
    { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
  );

  observer.observe(node);
  observers.set(node, observer);

  function handleAnimationsEnabled() {
    if (revealed && !replayOnEnable) return;
    if (replayOnEnable) {
      revealed = false;
      if (once) {
        try {
          observer.observe(node);
        } catch {}
      }
    }
    const rect = node.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
    if (inViewport && isEnabled()) {
      node.style.opacity = "0";
      node.style.transform = axis(direction);
      void node.offsetWidth;
      triggerReveal();
      if (once && !replayOnEnable) observer.unobserve(node);
    } else if (!revealed && isEnabled()) {
      node.style.opacity = "0";
      node.style.transform = axis(direction);
    }
  }

  window.addEventListener("animations:enabled", handleAnimationsEnabled);

  return {
    destroy() {
      if (cleanupTimer) clearTimeout(cleanupTimer);
      observer.disconnect();
      observers.delete(node);
      window.removeEventListener("animations:enabled", handleAnimationsEnabled);
    },
  };
}
