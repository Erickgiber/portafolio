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
    duration = 600,
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

  // Guardar si ya fue revelado
  let revealed = false;

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

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!isEnabled()) {
            // si se intersecta pero animaciones off, quedará visible sin transición
            node.style.opacity = "";
            node.style.transform = "";
            revealed = true; // marcar como ya mostrada (sin animación)
          } else if (!revealed) {
            node.style.transition = `opacity ${duration}ms cubic-bezier(.4,0,.2,1) ${delay}ms, transform ${duration}ms cubic-bezier(.4,0,.2,1) ${delay}ms`;
            node.style.opacity = "1";
            node.style.transform = "none";
            revealed = true;
          }
          if (once && !replayOnEnable && revealed) observer.unobserve(node);
        } else if (!once && isEnabled()) {
          node.style.opacity = "0";
          node.style.transform = axis(direction);
          revealed = false;
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(node);
  observers.set(node, observer);

  function handleAnimationsEnabled() {
    if (revealed && !replayOnEnable) return; // ya mostrada y no se pide replay
    if (replayOnEnable) {
      // Resetear para un nuevo ciclo
      revealed = false;
      if (once) {
        // si once=true pero queremos replay, aseguramos observar de nuevo
        try {
          observer.observe(node);
        } catch {}
      }
    }
    // Verificar si el elemento está ahora visible para animar inmediatamente
    const rect = node.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight * 0.8 && rect.bottom > 0; // margen similar a threshold
    if (inViewport && isEnabled()) {
      node.style.transition = `opacity ${duration}ms cubic-bezier(.4,0,.2,1) ${delay}ms, transform ${duration}ms cubic-bezier(.4,0,.2,1) ${delay}ms`;
      // Asegurar estado inicial antes de animar (en caso de que haya quedado sin estilos)
      node.style.opacity = "0";
      node.style.transform = axis(direction);
      // Forzar un reflow rápido para que transición se aplique
      void node.offsetWidth; // trigger reflow
      node.style.opacity = "1";
      node.style.transform = "none";
      revealed = true;
      if (once && !replayOnEnable) observer.unobserve(node);
    } else if (!revealed && isEnabled()) {
      // Aún fuera de viewport: asegurar estado oculto
      node.style.opacity = "0";
      node.style.transform = axis(direction);
    }
  }

  window.addEventListener("animations:enabled", handleAnimationsEnabled);

  return {
    destroy() {
      observer.disconnect();
      observers.delete(node);
      window.removeEventListener("animations:enabled", handleAnimationsEnabled);
    },
  };
}
