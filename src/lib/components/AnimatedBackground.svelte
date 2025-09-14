<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { animationsStore } from "../stores/animations.svelte";
  let { animationsEnabled } = animationsStore();

  let canvas: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;
  let raf: number;
  let frame = 0;

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    hue: number;
    seed: number;
  }
  let particles: Particle[] = [];

  // Config centralizada para fácil ajuste
  const CONFIG = {
    baseCount: 80,
    maxExtra: 40, // se suma según ancho pantallas grandes
    maxSpeed: 0.35,
    connectDistance: 140,
    mouseInfluence: 120,
    parallaxStrength: 0.06,
    scrollStrength: 0.25, // intensidad del desplazamiento inducido por scroll
    scrollDecay: 0.92, // decaimiento por frame del efecto scroll
    dprMax: 2,
    bgOpacity: 0.12,
    lineBaseAlpha: 0.18,
    lineThick: 1.1,
  } as const;

  const DPR = Math.min(CONFIG.dprMax, window.devicePixelRatio || 1);

  // Cursor / interacción
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, active: false };
  let parallaxX = 0,
    parallaxY = 0;
  // Variables para el drift vertical generado por scroll
  let scrollDriftY = 0;
  let lastScrollY = window.scrollY;

  function computeParticleTargetCount() {
    // Escalar número según ancho (ej: más partículas en desktop grande)
    const ratio = Math.min(1, (innerWidth - 640) / 800); // desde 640 hasta 1440 aprox
    return Math.round(CONFIG.baseCount + CONFIG.maxExtra * Math.max(0, ratio));
  }

  function resize() {
    if (!canvas) return;
    const w = innerWidth;
    const h = innerHeight;
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(DPR, DPR);
    }
    adjustParticleCount();
  }

  function randSign() {
    return Math.random() < 0.5 ? -1 : 1;
  }

  function spawnParticle(): Particle {
    return {
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: Math.random() ** 1.5 * CONFIG.maxSpeed * randSign(),
      vy: Math.random() ** 1.5 * CONFIG.maxSpeed * randSign(),
      r: Math.random() * 2 + 0.8,
      hue: 190 + Math.random() * 70, // gama azul/cyan a violeta ligero
      seed: Math.random(),
    };
  }

  function adjustParticleCount() {
    const target = computeParticleTargetCount();
    if (particles.length < target) {
      for (let i = particles.length; i < target; i++)
        particles.push(spawnParticle());
    } else if (particles.length > target) {
      particles.length = target;
    }
  }

  function updateParticles() {
    const w = innerWidth;
    const h = innerHeight;
    for (const p of particles) {
      p.x += p.vx + parallaxX * CONFIG.parallaxStrength * (p.seed - 0.5);
      p.y += p.vy + parallaxY * CONFIG.parallaxStrength * (p.seed - 0.5);
      // Aplicar drift de scroll (partículas con menor seed reaccionan un poco menos)
      if (scrollDriftY !== 0) {
        const influence = 0.3 + p.seed * 0.7; // 0.3..1
        p.y += scrollDriftY * influence;
        // leve componente horizontal para dar sensación de flujo diagonal
        p.x += scrollDriftY * 0.12 * (p.seed - 0.5);
      }
      // envolvente
      if (p.x < -50) p.x = w + 50;
      else if (p.x > w + 50) p.x = -50;
      if (p.y < -50) p.y = h + 50;
      else if (p.y > h + 50) p.y = -50;
    }
    // Decaimiento exponencial del drift
    scrollDriftY *= CONFIG.scrollDecay;
    if (Math.abs(scrollDriftY) < 0.01) scrollDriftY = 0;
  }

  function drawBackground() {
    if (!ctx) return;
    const isDark = document.documentElement.classList.contains("dark");
    const g = ctx.createLinearGradient(0, 0, innerWidth, innerHeight);
    if (isDark) {
      g.addColorStop(0, "hsla(200,70%,30%,0.15)");
      g.addColorStop(1, "hsla(160,70%,22%,0.10)");
    } else {
      g.addColorStop(0, "hsla(210,90%,75%,0.25)");
      g.addColorStop(1, "hsla(170,90%,70%,0.18)");
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, innerWidth, innerHeight);
  }

  function drawParticles() {
    if (!ctx) return;
    frame++;
    const pulse = (Math.sin(frame * 0.002) + 1) / 2; // 0..1 anim lenta
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const p of particles) {
      const alpha = 0.35 + pulse * 0.25;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue + pulse * 20}, 85%, ${55 + pulse * 10}%, ${alpha})`;
      ctx.arc(p.x, p.y, p.r + pulse * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawConnections() {
    if (!ctx) return;
    const maxDist2 = CONFIG.connectDistance * CONFIG.connectDistance;
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < maxDist2) {
          const t = 1 - d2 / maxDist2;
          const alpha = (CONFIG.lineBaseAlpha + t * 0.3) * 0.9;
          ctx.strokeStyle = `hsla(${(a.hue + b.hue) / 2},80%,60%,${alpha})`;
          ctx.lineWidth = CONFIG.lineThick * (0.4 + t * 0.8);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  function drawMouseAura() {
    if (!ctx || !mouse.active) return;
    const radius = CONFIG.mouseInfluence;
    const grd = ctx.createRadialGradient(
      mouse.x,
      mouse.y,
      0,
      mouse.x,
      mouse.y,
      radius
    );
    grd.addColorStop(0, "hsla(180,90%,65%,0.35)");
    grd.addColorStop(1, "hsla(200,80%,55%,0)");
    ctx.beginPath();
    ctx.fillStyle = grd;
    ctx.arc(mouse.x, mouse.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    drawBackground();

    if (animationsEnabled) {
      updateParticles();
      drawConnections();
      drawParticles();
      drawMouseAura();
    } else {
      // mostrar sólo gradiente suave
    }
    raf = requestAnimationFrame(animate);
  }

  // Convertir delta de scroll en impulso suave
  function handleScroll() {
    const current = window.scrollY;
    const delta = current - lastScrollY; // positivo cuando se baja
    lastScrollY = current;
    // Invertimos para que al bajar el contenido las partículas fluyan ligeramente hacia arriba
    scrollDriftY += -delta * CONFIG.scrollStrength * 0.60; // escala pequeña
    // Limitar drift acumulado
    if (scrollDriftY > 3) scrollDriftY = 3; else if (scrollDriftY < -3) scrollDriftY = -3;
  }

  function handlePointerMove(e: PointerEvent) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
    // Parallax: centro -> 0
    const cx = innerWidth / 2;
    const cy = innerHeight / 2;
    parallaxX = (mouse.x - cx) / cx;
    parallaxY = (mouse.y - cy) / cy;
  }
  function handlePointerLeave() {
    mouse.active = false;
    parallaxX = parallaxY = 0;
  }

  // Click: pequeña explosión / repulsión ligera
  function handleClick(e: PointerEvent) {
    const mx = e.clientX,
      my = e.clientY;
    for (const p of particles) {
      const dx = p.x - mx;
      const dy = p.y - my;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < 240 * 240) {
        const dist = Math.sqrt(dist2) || 1;
        const force = (1 - dist / 240) * 2.2;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
    }
  }

  // Throttle de resize
  let resizePending = false;
  function onResize() {
    if (resizePending) return;
    resizePending = true;
    requestAnimationFrame(() => {
      resize();
      resizePending = false;
    });
  }

  onMount(() => {
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    resize();
    adjustParticleCount();
    animate();
    addEventListener("resize", onResize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerleave", handlePointerLeave, {
      passive: true,
    });
    window.addEventListener("click", handleClick, { passive: true });
  });
  onDestroy(() => {
    cancelAnimationFrame(raf);
    removeEventListener("resize", onResize);
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerleave", handlePointerLeave);
    window.removeEventListener("click", handleClick);
  });
</script>

<canvas
  bind:this={canvas}
  class="animated-bg pointer-events-none fixed inset-0 z-0"
  aria-hidden="true"
></canvas>
