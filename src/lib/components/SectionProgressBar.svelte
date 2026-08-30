<script lang="ts">
  import { onMount } from "svelte";
  import { animationsStore } from "../stores/animations.svelte";
  let animationsEnabled = $derived(animationsStore.animationsEnabled);

  let progress = $state(0); // 0 -> 1
  let scrolledPast = $state(false); // becomes true after pequeño scroll (> threshold)
  const THRESHOLD = 30; // px

  // Tooltip positioning (clamped to avoid edges)
  let tooltipLeftPercent = $derived(Math.min(95, Math.max(5, progress * 100)));

  function updateProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const totalScrollable = docHeight - winHeight;
    progress = totalScrollable > 0 ? Math.min(1, Math.max(0, scrollTop / totalScrollable)) : 1;
    // show immediately if no scrollable area
    scrolledPast = scrollTop > THRESHOLD || totalScrollable <= 0;
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        updateProgress();
        ticking = false;
      });
    }
  }

  onMount(() => {
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateProgress);
    };
  });
</script>

<div
  class="fixed top-0 left-0 right-0 z-50 pointer-events-none"
  role="progressbar"
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={Math.round(progress * 100)}
  aria-label="Progreso de scroll"
  data-animations={animationsEnabled ? "on" : "off"}
>
  <div
    class="group relative h-[3px] sm:h-1 w-full bg-border/60 dark:bg-border/40 overflow-visible pointer-events-auto"
    aria-describedby="scroll-progress-tooltip"
    style={`${animationsEnabled ? "transition:opacity .4s ease, transform .45s cubic-bezier(.4,0,.2,1);" : ""} ${scrolledPast ? "opacity:1;transform:translateY(0);" : "opacity:0;transform:translateY(-100%);"}`}
  >
    <!-- Track con fondo primario suave -->
    <div class="absolute inset-0 overflow-hidden bg-primary/10 dark:bg-primary/15 backdrop-blur-sm">
      <!-- Filled bar con degradado primario a secundario y aura de brillo -->
      <div
        class="h-full w-full origin-left bg-gradient-to-r from-primary via-accent to-secondary shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary)_60%,transparent)]"
        style={`transform:scaleX(${progress});${animationsEnabled ? "transition:transform .35s cubic-bezier(.4,0,.2,1);" : ""}`}
      ></div>
    </div>

    <!-- Tooltip adaptativo a light y dark -->
    <div
      id="scroll-progress-tooltip"
      role="tooltip"
      class="pointer-events-none absolute top-full mt-1.5 px-2.5 py-0.5 rounded-lg bg-card/95 backdrop-blur-md border border-primary/25 text-[11px] text-primary font-semibold shadow-lg shadow-primary/10 opacity-0 scale-75 origin-top transition duration-150 ease-out group-hover:opacity-100 group-hover:scale-100 select-none"
      style={`left:${tooltipLeftPercent}%;transform:translate(-50%,0) scale(var(--scale,1));${animationsEnabled ? "" : "transition:none;"}`}
    >
      {Math.round(progress * 100)}%
    </div>
  </div>
</div>
