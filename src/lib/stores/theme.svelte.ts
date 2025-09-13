export const themeStore = () => {
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
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  function initTheme() {
    // Intentar cargar preferencia guardada
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
        return;
      }
    } catch {}
  }

  return { theme, isDark, toggleTheme, setTheme, getTheme, initTheme };
};
