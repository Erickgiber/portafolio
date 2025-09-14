<script lang="ts">
  import { reveal } from "../actions/reveal";
  import { visibilityProgress } from "../actions/visibilityProgress";

  let visibilityRatio = 0; // bound to custom event to debug / if needed

  function handleVisibility(e: CustomEvent<{ ratio: number }>) {
    visibilityRatio = e.detail.ratio;
  }
</script>

<section
  id="about"
  class="relative py-16 px-4 dark:bg-muted/20 z-10 about-visibility"
  use:reveal={{
    direction: "up",
    distance: 40,
    replayOnEnable: true,
    delay: 80,
  }}
>
  <div class="container mx-auto z-10">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">Sobre mí</h2>
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div
            class="w-72 h-72 md:w-96 md:h-96 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center img-observer media-anim"
            use:visibilityProgress={{
              threshold: Array.from({ length: 40 }, (_, i) => i / 39),
              rootMargin: "-20% 0px -20% 0px",
            }}
            on:visibilityprogress={handleVisibility}
            use:reveal={{
              direction: "up",
              distance: 40,
              replayOnEnable: true,
              delay: 150,
            }}
          >
            <div
              class="z-20 w-64 h-64 md:w-82 md:h-82 bg-background rounded-full flex items-center justify-center overflow-hidden"
            >
              <span class="text-6xl font-bold text-primary">
                <img
                  src="/erick-ramirez.jpg"
                  alt="Erick Ramírez"
                  class="w-full h-full object-cover rounded-full"
                />
              </span>
            </div>
          </div>
        </div>
        <div class="space-y-6">
          <p class="text-lg text-muted-foreground leading-relaxed">
            Soy un desarrollador apasionado por la tecnología y la innovación.
            Con experiencia en desarrollo tanto frontend como backend, me
            especializo en crear soluciones web modernas y eficientes.
          </p>
          <p class="text-lg text-muted-foreground leading-relaxed">
            Desde Venezuela, trabajo con las últimas tecnologías para construir
            aplicaciones que no solo funcionen bien, sino que también brinden
            una excelente experiencia de usuario.
          </p>
          <div class="flex flex-wrap gap-4">
            <div class="flex items-center space-x-2">
              <svg
                class="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span class="text-muted-foreground">Venezuela</span>
            </div>
            <div class="flex items-center space-x-2">
              <svg
                class="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 6V9a2 2 0 00-2-2H10a2 2 0 00-2 2v3.1M15 13l-3-3-3 3"
                />
              </svg>
              <span class="text-muted-foreground">Semi-Full Stack</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  /* The section has the CSS variable --visibility-ratio set by the action (0 -> 1). */
  .about-visibility {
    /* fallback */
    --visibility-ratio: 0;
  }

  /* We map ratio to grayscale. When ratio = 0 -> grayscale(100%), ratio = 1 -> grayscale(0%). */
  /* Animación aplicada al contenedor completo (bg + imagen) */
  .media-anim {
    --visibility-ratio: var(--visibility-ratio, 0);
    /* Solo transición de color (grayscale -> color) y saturación + sombra progresiva */
    filter: grayscale(calc(100% - (var(--visibility-ratio) * 100%)))
      saturate(calc(0.9 + (var(--visibility-ratio) * 0.25)));
    box-shadow:
      0 0 0 0 rgba(0, 0, 0, 0.05),
      0 8px 20px -6px rgba(0, 0, 0, calc(0.08 + (var(--visibility-ratio) * 0.18)));
    transition:
      filter 300ms linear,
      box-shadow 380ms ease;
    will-change: filter, box-shadow;
  }

  /* Cuando las animaciones globales están desactivadas */
  :root[data-animations="off"] .media-anim {
    filter: none !important;
    box-shadow: none !important;
    transition: none !important;
  }

  /* Progressive enhancement: if prefers-reduced-motion, remove transition */
  @media (prefers-reduced-motion: reduce) {
    .media-anim {
      transition: none !important;
    }
  }
</style>
