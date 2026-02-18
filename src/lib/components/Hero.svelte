<script lang="ts">
  import { onMount } from "svelte";
  import { reveal } from "../actions/reveal";
  import { animationsStore } from "../stores/animations.svelte";
  // Reactivo al store global de animaciones
  let animationsEnabled = $derived(animationsStore.animationsEnabled);

  const prefix = "Hola, soy ";
  const name = "Erick Ramírez";
  const fullText = prefix + name;

  let displayText = $state("");
  let index = 0;
  const typingSpeed = 50; // ms per character
  let finished = $state(false);
  let started = false; // para no relanzar varias veces

  function colorize(text: string) {
    if (!text) return "";
    if (text.length <= prefix.length) return text; // only prefix typed so far
    const typedPrefix = text.slice(0, prefix.length);
    const typedRest = text.slice(prefix.length);
    return `${typedPrefix}<span class=\"text-primary\">${typedRest}</span>`;
  }

  async function type() {
    started = true;
    while (index < fullText.length && animationsEnabled) {
      displayText = fullText.slice(0, index + 1);
      index++;
      await new Promise((r) => setTimeout(r, typingSpeed));
    }
    if (index >= fullText.length || !animationsEnabled) {
      // Si se desactiva en medio, completar inmediatamente
      displayText = fullText;
      finished = true;
    }
  }

  onMount(() => {
    if (animationsEnabled) {
      type();
    } else {
      // Sin animaciones: mostrar todo ya
      displayText = fullText;
      finished = true;
    }
  });

  // Reaccionar a cambios posteriores (si se desactiva mientras escribe, o si se activa antes de terminar)
  $effect(() => {
    if (!animationsEnabled && !finished) {
      displayText = fullText;
      finished = true;
    } else if (animationsEnabled && !started && !finished) {
      // Caso raro: activan animaciones antes de comenzar
      type();
    }
  });
</script>

<section
  id="hero"
  class="relative pt-24 pb-16 px-4 z-10 h-[100lvh] justify-center flex items-center"
  use:reveal={animationsEnabled ? { direction: "up", distance: 50 } : undefined}
  data-animations={animationsEnabled ? "on" : "off"}
>
  <div class="container mx-auto text-center">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight hero-heading">
        <span class="sr-only">Hola, soy Erick Ramírez</span>
        <span class="type-wrapper" aria-hidden="true"
          >{@html colorize(displayText)}{#if !finished}<span class="caret" aria-hidden="true"
              >|</span
            >{/if}</span
        >
      </h1>
      <p class="text-xl md:text-2xl text-muted-foreground mb-8 text-pretty">
        Desarrollador Semi-Full Stack de Venezuela, creando experiencias digitales modernas y
        funcionales
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onclick={() =>
            document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
          class="z-20 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Ver mis proyectos
        </button>
        <button
          onclick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
          class="z-20 px-8 py-3 border bg-white dark:bg-transparent border-border rounded-lg hover:bg-muted transition-colors font-medium"
        >
          Contactarme
        </button>
      </div>
    </div>
  </div>
</section>

<style>
  /* Evita que el navegador "ajuste" la posición del scroll (scroll anchoring)
     cuando cambia incrementalmente la altura del título mientras se escribe.
     Esto era la causa típica del pequeño auto desplazamiento inicial. */
  #hero {
    overflow-anchor: none;
  }

  /* Reserva de altura: asegura que el h1 no cambie su altura mientras se escribe */
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

  :global(html:not(.dark) #hero) {
    background-color: color-mix(in oklab, var(--color-secondary) /* #10b981 */ 5%, transparent);
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
