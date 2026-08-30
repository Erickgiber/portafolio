<script lang="ts">
  import { onMount } from "svelte";
  import { reveal } from "../actions/reveal";
  import { animationsStore } from "../stores/animations.svelte";
  import { i18nStore } from "../stores/i18n.svelte";

  let animationsEnabled = $derived(animationsStore.animationsEnabled);
  let t = $derived(i18nStore.t);

  let prefix = $derived(t.hero.prefix);
  let name = $derived(t.hero.name);
  let fullText = $derived(prefix + name);

  let displayText = $state("");
  let index = 0;
  const typingSpeed = 45;
  let finished = $state(false);
  let typingTimer: ReturnType<typeof setTimeout> | null = null;

  function colorize(text: string, currentPrefix: string) {
    if (!text) return "";
    if (text.length <= currentPrefix.length) return text;
    const typedPrefix = text.slice(0, currentPrefix.length);
    const typedRest = text.slice(currentPrefix.length);
    return `${typedPrefix}<span class="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent font-extrabold">${typedRest}</span>`;
  }

  function startTyping(targetText: string) {
    if (typingTimer) clearTimeout(typingTimer);
    index = 0;
    finished = false;
    displayText = "";

    function step() {
      if (index < targetText.length && animationsEnabled) {
        displayText = targetText.slice(0, index + 1);
        index++;
        typingTimer = setTimeout(step, typingSpeed);
      } else {
        displayText = targetText;
        finished = true;
      }
    }
    step();
  }

  onMount(() => {
    if (animationsEnabled) {
      startTyping(fullText);
    } else {
      displayText = fullText;
      finished = true;
    }
    return () => {
      if (typingTimer) clearTimeout(typingTimer);
    };
  });

  // Reaccionar a cambios de idioma o animaciones
  $effect(() => {
    const currentTarget = fullText;
    if (animationsEnabled) {
      startTyping(currentTarget);
    } else {
      displayText = currentTarget;
      finished = true;
    }
  });
</script>

<section
  id="hero"
  class="relative pt-24 pb-16 px-4 z-10 h-[100lvh] justify-center flex items-center"
  use:reveal={{ direction: "up", distance: 40 }}
>
  <div class="container mx-auto text-center">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight hero-heading">
        <span class="sr-only">{fullText}</span>
        <span class="type-wrapper" aria-hidden="true"
          >{@html colorize(displayText, prefix)}{#if !finished}<span
              class="caret"
              aria-hidden="true">|</span
            >{/if}</span
        >
      </h1>
      <p class="text-xl md:text-2xl text-muted-foreground mb-8 text-pretty">
        {t.hero.subtitle}
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onclick={() =>
            document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
          class="z-20 w-full sm:w-auto px-8 py-3.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all font-medium text-base"
        >
          {t.hero.ctaProjects}
        </button>
        <button
          onclick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
          class="z-20 w-full sm:w-auto px-8 py-3.5 bg-background/80 dark:bg-card/70 backdrop-blur-md border border-border/70 dark:border-white/[0.1] text-foreground rounded-full hover:bg-muted/70 hover:-translate-y-0.5 active:translate-y-0 transition-all font-medium text-base shadow-sm"
        >
          {t.hero.ctaContact}
        </button>
      </div>
    </div>
  </div>
</section>

<style>
  #hero {
    overflow-anchor: none;
  }

  .hero-heading {
    min-height: clamp(3.2rem, 10vw, 6.5rem);
  }
  @media (min-width: 768px) {
    .hero-heading {
      min-height: 7.5rem;
    }
  }
  .type-wrapper {
    display: inline-block;
  }

  .caret {
    display: inline-block;
    margin-left: 0.15rem;
    width: 1ch;
    animation: blink 1s steps(2, start) infinite;
  }
  @keyframes blink {
    0%,
    49% {
      opacity: 1;
    }
    50%,
    100% {
      opacity: 0;
    }
  }
</style>
