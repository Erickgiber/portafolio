// Store singleton para controlar animaciones globales (similar a themeStore)
// Expone siempre la misma instancia y mantiene reactividad al desestructurar usando getters.
// API: animationsStore.animationsEnabled (boolean), toggleAnimations(), enable(), disable(), initAnimations()
// Respeta 'prefers-reduced-motion' y guarda preferencia en localStorage.

function createAnimationsStore() {
  let animationsEnabled = $state(true);

  function persist(value: 'on' | 'off') {
    try { localStorage.setItem('animations', value); } catch {}
    document.documentElement.dataset.animations = value;
  }

  function enable() {
    animationsEnabled = true;
    persist('on');
    try { window.dispatchEvent(new CustomEvent('animations:enabled')); } catch {}
  }

  function disable() {
    animationsEnabled = false;
    persist('off');
    try { window.dispatchEvent(new CustomEvent('animations:disabled')); } catch {}
  }

  function toggleAnimations() {
    animationsEnabled ? disable() : enable();
  }

  function initAnimations() {
    // 1. Respeto a prefers-reduced-motion
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      disable();
    }
    // 2. Preferencia guardada
    try {
      const stored = localStorage.getItem('animations');
      if (stored === 'off') {
        disable();
      } else if (stored === 'on') {
        enable();
      } else {
        // Si no hay guardada, sincronizar dataset actual
        persist(animationsEnabled ? 'on' : 'off');
      }
    } catch {}

    // 3. Listener opcional para cambios del media query
    // (Si el usuario cambia su preferencia del SO en tiempo real)
    try {
      media.addEventListener?.('change', (e) => {
        if (e.matches) {
          // Usuario pide reducir movimiento -> desactivar
            disable();
        }
      });
    } catch {}
  }

  return {
    get animationsEnabled() { return animationsEnabled; },
    toggleAnimations,
    enable,
    disable,
    initAnimations
  };
}

export const animationsStore = createAnimationsStore();
