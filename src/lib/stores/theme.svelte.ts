// Implementación como singleton para evitar perder reactividad al desestructurar.
// Se usan $state/$derived (Svelte 5 Runes) y se expone siempre la misma instancia.
function createThemeStore() {
  let theme = $state("light");
  let isDark = $derived(theme === "dark");
  let themingTimer: number | null = null;

  function beginUniformTransition() {
    try {
      const root = document.documentElement;
      if (root.dataset.animations === 'off') return; // no transición si animaciones off
      root.classList.add('theming');
      if (themingTimer) clearTimeout(themingTimer);
      themingTimer = window.setTimeout(() => {
        root.classList.remove('theming');
        themingTimer = null;
      }, 320); // ligeramente > a 260ms para asegurar fin
    } catch {}
  }

  function toggleTheme() {
    theme = isDark ? "light" : "dark";
    beginUniformTransition();
    updateBodyClass();
  }

  function setTheme(newTheme: "light" | "dark") {
    theme = newTheme;
    beginUniformTransition();
    updateBodyClass();
  }

  function getTheme() {
    return theme;
  }

  function updateBodyClass() {
    if (typeof document === "undefined") return; // SSR safety
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  function initTheme() {
    // 1. Preferencia guardada
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") {
        // En inicialización no queremos animación: aplicar directamente
        theme = stored;
        updateBodyClass();
        return;
      }
    } catch {}

    // 2. Preferencia del sistema
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      // Igual que arriba, sin animación inicial
      theme = prefersDark ? "dark" : "light";
      updateBodyClass();
    }
  }

  return { get theme() { return theme; }, get isDark() { return isDark; }, toggleTheme, setTheme, getTheme, initTheme };
}

export const themeStore = createThemeStore();
