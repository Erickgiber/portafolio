// IntersectionObserver based reveal animation action
// Usage: <div use:reveal={{ delay: 0, distance: 24, direction: 'up' }}></div>
// Respects global animations toggle via documentElement.dataset.animations

interface RevealOptions {
  delay?: number; // ms
  distance?: number; // px translate distance
  duration?: number; // ms
  direction?: 'up' | 'down' | 'left' | 'right' | 'zoom';
  once?: boolean; // reveal only first time
}

const observers = new WeakMap<Element, IntersectionObserver>();

export function reveal(node: HTMLElement, options: RevealOptions = {}) {
  const {
    delay = 0,
    distance = 32,
    duration = 600,
    direction = 'up',
    once = true
  } = options;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isEnabled() {
    return !reduced && document.documentElement.dataset.animations !== 'off';
  }

  const axis = (dir: string) => {
    switch (dir) {
      case 'up': return `translate3d(0, ${distance}px, 0)`;
      case 'down': return `translate3d(0, -${distance}px, 0)`;
      case 'left': return `translate3d(${distance}px, 0, 0)`;
      case 'right': return `translate3d(-${distance}px, 0, 0)`;
      case 'zoom': return 'scale(.95)';
      default: return `translate3d(0, ${distance}px, 0)`;
    }
  };

  if (isEnabled()) {
    node.style.opacity = '0';
    node.style.transform = axis(direction);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!isEnabled()) {
          node.style.opacity = '';
          node.style.transform = '';
        } else {
          node.style.transition = `opacity ${duration}ms cubic-bezier(.4,0,.2,1) ${delay}ms, transform ${duration}ms cubic-bezier(.4,0,.2,1) ${delay}ms`;
          node.style.opacity = '1';
          node.style.transform = 'none';
        }
        if (once) observer.unobserve(node);
      } else if (!once && isEnabled()) {
        node.style.opacity = '0';
        node.style.transform = axis(direction);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(node);
  observers.set(node, observer);

  return {
    destroy() {
      observer.disconnect();
      observers.delete(node);
    }
  };
}
