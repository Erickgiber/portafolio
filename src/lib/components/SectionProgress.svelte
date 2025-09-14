<script lang="ts">
  import { onMount } from 'svelte';
  import { animationsStore } from '../stores/animations.svelte';
  let animationsEnabled = $derived(animationsStore.animationsEnabled);

  interface SectionInfo { id: string; el: HTMLElement; index: number; title: string; }
  let sections = $state<SectionInfo[]>([]);
  let activeIndex = $state(0);
  let total = $state(0);
  let progress = $derived(total > 1 ? (activeIndex + 1) / total : 1);

  let indicatorEl: HTMLDivElement | null = null;

  function collectSections() {
    const nodeList = document.querySelectorAll('main > section[id]');
    sections = Array.from(nodeList).map((el, i) => ({
      id: el.id,
      el: el as HTMLElement,
      index: i,
      title: (el.querySelector('h1,h2,h3')?.textContent || el.id).trim()
    }));
    total = sections.length;
  }

  let observer: IntersectionObserver;
  function setupObserver() {
    observer?.disconnect();
    observer = new IntersectionObserver(handleEntries, {
      threshold: buildThresholds(25),
      rootMargin: '-20% 0px -35% 0px'
    });
    sections.forEach(s => observer.observe(s.el));
  }

  function handleEntries(entries: IntersectionObserverEntry[]) {
    // Determine which section has largest intersection ratio within our viewport focus window
    let best = { index: activeIndex, ratio: 0 };
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const idx = sections.findIndex(s => s.el === entry.target);
      if (idx === -1) continue;
      if (entry.intersectionRatio > best.ratio) {
        best = { index: idx, ratio: entry.intersectionRatio };
      }
    }
    if (best.index !== activeIndex) {
      activeIndex = best.index;
    }
  }

  function buildThresholds(steps = 20) {
    const arr: number[] = [];
    for (let i = 0; i <= steps; i++) arr.push(i / steps);
    return arr;
  }

  function scrollToSection(idx: number) {
    const target = sections[idx];
    if (!target) return;
    const top = target.el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: animationsEnabled ? 'smooth' : 'auto' });
  }

  function scrollNext() { scrollToSection(Math.min(activeIndex + 1, total - 1)); }

  onMount(() => {
    collectSections();
    setupObserver();
    const ro = new ResizeObserver(() => collectSections());
    ro.observe(document.body);
    window.addEventListener('focus', collectSections, { passive: true });
    return () => { observer.disconnect(); ro.disconnect(); };
  });
</script>

<div class="section-progress" data-animations={animationsEnabled ? 'on' : 'off'}>
  <button
    class="scroll-mouse"
    aria-label="Ir a la siguiente sección"
    onclick={scrollNext}
    disabled={activeIndex === total - 1}
  >
    <span class="mouse-shell" aria-hidden="true">
      <span class="wheel"></span>
      <span class="arrow"></span>
    </span>
    <span class="sr-only">Siguiente</span>
  </button>
  <div class="dots" role="tablist" aria-label="Navegación de secciones">
    {#each sections as s}
      <button
        type="button"
        class="dot {activeIndex===s.index ? 'active' : ''}"
        aria-label={`Ir a sección ${s.index + 1}: ${s.title}`}
        aria-current={activeIndex===s.index}
        onclick={() => scrollToSection(s.index)}
      ></button>
    {/each}
  </div>
  <div class="counter" aria-live="polite">{activeIndex + 1} <span class="sep">/</span> {total}</div>
  <div class="bar"><div class="bar-inner" style={`--p:${progress}`}></div></div>
</div>

<style>
  .section-progress {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: .9rem;
    z-index: 60;
    padding: .55rem .9rem;
    background: hsl(var(--background) / 0.72);
    -webkit-backdrop-filter: blur(12px) saturate(1.2);
    backdrop-filter: blur(12px) saturate(1.2);
    border: 1px solid hsl(var(--border) / 0.5);
    border-radius: 999px;
    box-shadow: 0 4px 18px -6px rgba(0,0,0,.25);
  }
  .scroll-mouse {
    position: relative;
    width: 34px; height: 48px;
    border-radius: 18px;
    border: 2px solid hsl(var(--foreground)/0.65);
    background: radial-gradient(circle at 50% 30%, hsl(var(--foreground)/0.06), transparent 70%);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: border-color .3s, background .3s;
  }
  .scroll-mouse:disabled { opacity: .4; cursor: default; }
  .scroll-mouse:hover:not(:disabled) { border-color: hsl(var(--primary)); }
  .mouse-shell { position: relative; width: 18px; height: 30px; display: flex; align-items: flex-start; justify-content: center; }
  .wheel {
    width: 4px; height: 8px; border-radius: 2px;
    background: hsl(var(--primary));
    animation: wheel-slide 1.8s ease-in-out infinite;
    margin-top: 4px;
  }
  .arrow {
    position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%);
    width: 8px; height: 8px; border-left: 2px solid hsl(var(--foreground)/0.65); border-bottom: 2px solid hsl(var(--foreground)/0.65);
    transform-origin: center; rotate: -45deg;
    animation: arrow-bob 1.8s ease-in-out infinite;
  }
  @keyframes wheel-slide {
    0%, 20% { transform: translateY(0); opacity: 1; }
    60% { transform: translateY(8px); opacity: .2; }
    80%,100% { transform: translateY(0); opacity: 0.9; }
  }
  @keyframes arrow-bob {
    0%, 60%, 100% { transform: translate(-50%,0) rotate(-45deg); }
    40% { transform: translate(-50%,4px) rotate(-45deg); }
  }

  .dots { display: flex; gap: .4rem; }
  .dot {
    width: .65rem; height: .65rem; border-radius: 50%;
    background: hsl(var(--foreground)/0.25);
    border: none; cursor: pointer; padding: 0;
    transition: background .3s, transform .3s;
  }
  .dot:hover { background: hsl(var(--foreground)/0.5); }
  .dot.active { background: hsl(var(--primary)); transform: scale(1.3); }

  .counter { font-size: .75rem; font-weight: 500; letter-spacing: .5px; min-width: 3rem; text-align: center; }
  .sep { opacity: .5; }

  .bar { position: relative; width: 80px; height: 4px; border-radius: 2px; background: hsl(var(--foreground)/0.15); overflow: hidden; }
  .bar-inner { position: absolute; inset: 0; background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary))); transform-origin: left; transform: scaleX(var(--p)); transition: transform .4s cubic-bezier(.4,.0,.2,1); }

  /* Animaciones off */
  :root[data-animations='off'] .section-progress .wheel,
  :root[data-animations='off'] .section-progress .arrow { animation: none !important; }
  :root[data-animations='off'] .section-progress .bar-inner { transition: none !important; }
  :root[data-animations='off'] .section-progress .dot { transition: none !important; }

  @media (max-width: 640px) {
    .section-progress { gap: .6rem; padding: .45rem .7rem; }
    .bar { display: none; }
    .counter { display: none; }
  }
</style>
