<script lang="ts">
  import { onMount } from "svelte";
  import Header from "./lib/components/Header.svelte";
  import Hero from "./lib/components/Hero.svelte";
  import About from "./lib/components/About.svelte";
  import Skills from "./lib/components/Skills.svelte";
  import Projects from "./lib/components/Projects.svelte";
  import Contact from "./lib/components/Contact.svelte";
  import Footer from "./lib/components/Footer.svelte";
  import { themeStore } from "./lib/stores/theme.svelte";
  import AnimatedBackground from "./lib/components/AnimatedBackground.svelte";
  import { animationsStore } from "./lib/stores/animations.svelte";

  let { initAnimations } = animationsStore();

  // themeStore ahora es una instancia singleton con getters reactivos
  // Accedemos a sus propiedades vía themeStore.isDark en markup y lógica
  const { initTheme, toggleTheme } = themeStore;

  onMount(() => {
    initTheme();
    initAnimations();
  });
</script>

<div
  class="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-hidden z-10"
>
  <AnimatedBackground />
  <Header darkMode={themeStore.isDark} {toggleTheme} />
  <main>
    <Hero />
    <About />
    <Skills />
    <Projects />
    <Contact />
  </main>
  <Footer />
</div>
