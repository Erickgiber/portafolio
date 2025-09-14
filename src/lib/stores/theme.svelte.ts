// Implementación como singleton para evitar perder reactividad al desestructurar.
// Se usan $state/$derived (Svelte 5 Runes) y se expone siempre la misma instancia.
function createThemeStore() {
  let theme = $state("light");
  let isDark = $derived(theme === "dark");

  function toggleTheme() {
    theme = isDark ? "light" : "dark";
    updateBodyClass();
  }

  function setTheme(newTheme: "light" | "dark") {
    theme = newTheme;
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
        setTheme(stored);
        return;
      }
    } catch {}

    // 2. Preferencia del sistema
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }

  return { get theme() { return theme; }, get isDark() { return isDark; }, toggleTheme, setTheme, getTheme, initTheme };
}

export const themeStore = createThemeStore();
