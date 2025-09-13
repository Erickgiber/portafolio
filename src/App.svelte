<script lang="ts">
  /**
   * Gestión de tema con runes (Svelte 5) directamente en el componente raíz.
   * NOTA: Las runes ($state, $derived, $effect) sólo pueden usarse dentro de componentes
   * (o archivos .svelte). Por eso se eliminó el antiguo store en TypeScript.
   * Si más adelante necesitas acceder al tema sin pasar props, puedes:
   *   1. Usar setContext/getContext para exponer { theme, isDark, toggleTheme, setTheme, getTheme }
   *   2. O crear un wrapper <ThemeProvider> que contenga esta lógica y envolver la app.
   */
  import { onMount } from "svelte";
  import Header from "./lib/components/Header.svelte";
  import Hero from "./lib/components/Hero.svelte";
  import About from "./lib/components/About.svelte";
  import Skills from "./lib/components/Skills.svelte";
  import Projects from "./lib/components/Projects.svelte";
  import Contact from "./lib/components/Contact.svelte";
  import Footer from "./lib/components/Footer.svelte";
  import { themeStore } from "./lib/stores/theme.svelte";

  let { initTheme, isDark, toggleTheme } = themeStore();

  onMount(() => {
    initTheme();
  });
</script>

<div
  class="min-h-screen bg-background text-foreground transition-colors duration-300"
>
  <Header darkMode={isDark} toggleTheme={toggleTheme} />
  <main>
    <Hero />
    <About />
    <Skills />
    <Projects />
    <Contact />
  </main>
  <Footer />
</div>
