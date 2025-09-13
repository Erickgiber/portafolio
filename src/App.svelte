<script>
  import { onMount } from 'svelte';
  import Header from './lib/components/Header.svelte';
  import Hero from './lib/components/Hero.svelte';
  import About from './lib/components/About.svelte';
  import Skills from './lib/components/Skills.svelte';
  import Projects from './lib/components/Projects.svelte';
  import Contact from './lib/components/Contact.svelte';
  import Footer from './lib/components/Footer.svelte';

  let darkMode = $state(false);

  onMount(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      darkMode = savedTheme === 'dark';
    } else {
      darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    updateTheme();
  });

  function toggleTheme() {
    darkMode = !darkMode;
    updateTheme();
  }

  function updateTheme() {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
</script>

<div class="min-h-screen bg-background text-foreground transition-colors duration-300">
  <Header {darkMode} {toggleTheme} />
  <main>
    <Hero />
    <About />
    <Skills />
    <Projects />
    <Contact />
  </main>
  <Footer />
</div>
