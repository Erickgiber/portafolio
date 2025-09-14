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
  import SectionProgressBar from "./lib/components/SectionProgressBar.svelte";

  const { initTheme, toggleTheme } = themeStore;

  onMount(() => {
    initTheme();
  });
</script>

<div
  class="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-hidden z-10"
>
  <AnimatedBackground />
  <Header darkMode={themeStore.isDark} {toggleTheme} />
  <SectionProgressBar />
  <main>
    <Hero />
    <About />
    <Skills />
    <Projects />
    <Contact />
  </main>
  <Footer />
</div>
