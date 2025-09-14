<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { animationsStore } from '../stores/animations.svelte';
  let { animationsEnabled } = animationsStore();

  let canvas: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;
  let frame = 0;
  let raf: number;

  interface Particle { x: number; y: number; vx: number; vy: number; r: number; }
  let particles: Particle[] = [];
  const MAX_PARTICLES = 70; // moderado para rendimiento
  const DPR = Math.min(2, window.devicePixelRatio || 1);

  function resize() {
    if (!canvas) return;
    canvas.width = innerWidth * DPR;
    canvas.height = innerHeight * DPR;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx && ctx.scale(DPR, DPR);
  }

  function initParticles() {
    particles = Array.from({ length: MAX_PARTICLES }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 2 + 1
    }));
  }

  function drawGradient() {
    if (!ctx) return;
    const g = ctx.createLinearGradient(0, 0, innerWidth, innerHeight);
    g.addColorStop(0, 'hsla(260, 80%, 60%, 0.15)');
    g.addColorStop(1, 'hsla(200, 80%, 55%, 0.10)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, innerWidth, innerHeight);
  }

  function draw() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    drawGradient();

    if (!animationsEnabled) {
      // still show static gradient when disabled
      return;
    }

    // suave pulsación global
    frame++;
    const pulse = (Math.sin(frame * 0.002) + 1) / 2; // 0..1

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -50) p.x = innerWidth + 50; else if (p.x > innerWidth + 50) p.x = -50;
      if (p.y < -50) p.y = innerHeight + 50; else if (p.y > innerHeight + 50) p.y = -50;

      if (!ctx) return;
      const alpha = 0.15 + pulse * 0.25;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${200 + (p.x / innerWidth) * 80}, 80%, ${55 + pulse * 10}%, ${alpha})`;
      ctx.arc(p.x, p.y, p.r + pulse * 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    raf = requestAnimationFrame(draw);
  }

  onMount(() => {
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    initParticles();
    draw();
    addEventListener('resize', resize);
  });
  onDestroy(() => {
    cancelAnimationFrame(raf);
    removeEventListener('resize', resize);
  });
</script>

<canvas bind:this={canvas} class="animated-bg pointer-events-none fixed inset-0 -z-10" aria-hidden="true"></canvas>

<style>
  .animated-bg { opacity: 0.9; transition: opacity 0.6s ease; }
  :root[data-animations='off'] .animated-bg { opacity: 0.4; }
  @media (prefers-reduced-motion: reduce) { .animated-bg { display: none; } }
</style>
