// Store para controlar animaciones globales (Svelte 5 runes style inside components will consume this)
// Provee: animationsEnabled (boolean), toggleAnimations(), initAnimations()
// Respeta 'prefers-reduced-motion' del usuario y persiste preferencia en localStorage

export const animationsStore = () => {
  let animationsEnabled = $state(true);

  function enable() {
    animationsEnabled = true;
    try { localStorage.setItem('animations', 'on'); } catch {}
    document.documentElement.dataset.animations = 'on';
  }
  function disable() {
    animationsEnabled = false;
    try { localStorage.setItem('animations', 'off'); } catch {}
    document.documentElement.dataset.animations = 'off';
  }
  function toggleAnimations() {
    animationsEnabled ? disable() : enable();
  }
  function initAnimations() {
    // Prefiere reducido
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      disable();
    }
    try {
      const stored = localStorage.getItem('animations');
      if (stored === 'off') disable();
      else if (stored === 'on') enable();
    } catch {}
  }
  return { animationsEnabled, toggleAnimations, enable, disable, initAnimations };
};
