<script lang="ts">
  import { onMount } from 'svelte';
  import { animationsStore } from '../stores/animations.svelte';
  let animationsEnabled = $derived(animationsStore.animationsEnabled);

  // Props via $props (runes mode)
  const { targetSelector = null, offset = 0, hideIfNoNext = true } = $props<{
    targetSelector?: string | null;
    offset?: number;
    hideIfNoNext?: boolean;
  }>();

  let nextElement: HTMLElement | null = null;
  let visible = $state(true);

  function findNextSection() {
    if (targetSelector) {
      nextElement = document.querySelector(targetSelector) as HTMLElement | null;
      visible = !!nextElement;
      return;
    }
    // Auto: find the parent section this button sits in and then the next sibling section
    const hostSection = buttonEl?.closest('section');
    if (!hostSection) return;
    let el = hostSection.nextElementSibling as HTMLElement | null;
    while (el) {
      if (el.tagName.toLowerCase() === 'section') {
        nextElement = el; break;
      }
      el = el.nextElementSibling as HTMLElement | null;
    }
    visible = !!nextElement;
  }

  let buttonEl: HTMLButtonElement | null = null;

  function handleClick() {
    if (!nextElement) return;
    if (animationsEnabled) {
      // Add a temporary pulse/ripple class
      buttonEl?.classList.add('cue-clicked');
      setTimeout(() => buttonEl?.classList.remove('cue-clicked'), 450);
    }
    const top = nextElement.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: animationsEnabled ? 'smooth' : 'auto' });
  }

  $effect(() => {
    // Refetch next on mount or if animations flag toggles (layout might shift) 
    findNextSection();
  });

  // Also refind on resize (sections might reflow)
  let resizeObserver: ResizeObserver;
  onMount(() => {
    findNextSection();
    resizeObserver = new ResizeObserver(() => findNextSection());
    resizeObserver.observe(document.body);
    return () => resizeObserver.disconnect();
  });
</script>

{#if !hideIfNoNext || visible}
  <button
    bind:this={buttonEl}
    type="button"
    aria-label="Ir a la siguiente sección"
    class="scroll-cue group"
    data-animations={animationsEnabled ? 'on' : 'off'}
    on:click={handleClick}
  >
    <span class="icon-wrapper" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
        <path d="M12 5v14" />
        <path d="M19 12l-7 7-7-7" />
      </svg>
    </span>
  </button>
{/if}

<style>
  .scroll-cue {
    position: absolute;
    left: 50%;
    bottom: 0.75rem;
    transform: translateX(-50%);
    width: 3rem;
    height: 3rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: hsl(var(--foreground));
    background: linear-gradient(var(--background), var(--background)) padding-box,
      linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary))) border-box;
    border: 1px solid transparent;
    cursor: pointer;
    font-size: 0.875rem;
    outline: none;
    box-shadow: 0 4px 10px -4px rgba(0,0,0,0.25);
  }
  .scroll-cue:hover { background: linear-gradient(var(--muted), var(--muted)) padding-box, linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary))) border-box; }
  .scroll-cue:focus-visible { box-shadow: 0 0 0 3px hsl(var(--ring) / 0.5); }

  .icon-wrapper { display: inline-flex; }
  .icon { width: 1.4rem; height: 1.4rem; }

  /* Idle animation (bounce + subtle glow) */
  [data-animations='on'].scroll-cue .icon-wrapper {
    animation: cue-bounce 2.4s ease-in-out infinite;
  }
  @keyframes cue-bounce {
    0%, 100% { transform: translateY(0); }
    40% { transform: translateY(4px); }
    60% { transform: translateY(-2px); }
  }

  /* Click feedback */
  [data-animations='on'].scroll-cue.cue-clicked {
    animation: cue-pulse 0.45s ease;
  }
  @keyframes cue-pulse {
    0% { transform: translateX(-50%) scale(1); box-shadow: 0 4px 10px -4px rgba(0,0,0,0.25); }
    50% { transform: translateX(-50%) scale(0.92); box-shadow: 0 6px 16px -6px rgba(0,0,0,0.35); }
    100% { transform: translateX(-50%) scale(1); }
  }

  /* Disable animations */
  [data-animations='off'].scroll-cue .icon-wrapper, 
  :root[data-animations='off'] .scroll-cue .icon-wrapper {
    animation: none !important;
  }
  [data-animations='off'].scroll-cue.cue-clicked { animation: none !important; }
</style>
