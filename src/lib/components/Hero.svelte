<script lang="ts">
  import { onMount } from 'svelte';

  const prefix = 'Hola, soy ';
  const name = 'Erick Ramírez';
  const fullText = prefix + name;

  let displayText = '';
  let index = 0;
  const typingSpeed = 50; // ms per character
  let finished = false;

  function colorize(text: string) {
    if (!text) return '';
    if (text.length <= prefix.length) return text; // only prefix typed so far
    const typedPrefix = text.slice(0, prefix.length);
    const typedRest = text.slice(prefix.length);
    return `${typedPrefix}<span class=\"text-primary\">${typedRest}</span>`;
  }

  async function type() {
    while (index < fullText.length) {
      displayText = fullText.slice(0, index + 1);
      index++;
      await new Promise(r => setTimeout(r, typingSpeed));
    }
    finished = true;
  }

  onMount(type);
</script>

<section class="pt-24 pb-16 px-4">
  <div class="container mx-auto text-center">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight">
        <span class="sr-only">Hola, soy Erick Ramírez</span>
        <span aria-hidden="true">{@html colorize(displayText)}</span>
        {#if !finished}
          <span class="caret" aria-hidden="true">|</span>
        {/if}
      </h1>
      <p class="text-xl md:text-2xl text-muted-foreground mb-8 text-pretty">
        Desarrollador Semi-Full Stack de Venezuela, creando experiencias digitales modernas y funcionales
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button onclick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })} 
                class="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
          Ver mis proyectos
        </button>
        <button onclick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} 
                class="px-8 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium">
          Contactarme
        </button>
      </div>
    </div>
  </div>
</section>

<style>
  .caret {
    display: inline-block;
    margin-left: 0.15rem;
    width: 1ch;
    animation: blink 1s steps(2, start) infinite;
  }
  @keyframes blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
</style>
