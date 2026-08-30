<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { animationsStore } from "../stores/animations.svelte";
  let animationsEnabled = $derived(animationsStore.animationsEnabled);

  let canvas: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;
  let raf: number;
  let lastTime = 0;

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    hue: number;
    seed: number;
  }

  interface GlowOrb {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    radius: number;
    color: string;
    speed: number;
  }

  let particles: Particle[] = [];
  let orbs: GlowOrb[] = [];

  const CONFIG = {
    baseCount: 65,
    maxExtra: 35,
    maxSpeed: 0.28,
    connectDistance: 130,
    mouseInfluence: 140,
    parallaxStrength: 0.04,
    scrollStrength: 0.2,
    scrollDecay: 0.94,
    dprMax: 2,
  } as const;

  let DPR = 1;
  const mouse = { x: 0, y: 0, active: false };
  let parallaxX = 0,
    parallaxY = 0;
  let scrollDriftY = 0;
  let lastScrollY = 0;

  function initOrbs() {
    orbs = [
      {
        x: innerWidth * 0.25,
        y: innerHeight * 0.3,
        targetX: innerWidth * 0.35,
        targetY: innerHeight * 0.4,
        radius: Math.max(innerWidth, innerHeight) * 0.35,
        color: "rgba(2, 132, 199, ", // primary (sky)
        speed: 0.0008,
      },
      {
        x: innerWidth * 0.75,
        y: innerHeight * 0.7,
        targetX: innerWidth * 0.65,
        targetY: innerHeight * 0.6,
        radius: Math.max(innerWidth, innerHeight) * 0.3,
        color: "rgba(16, 185, 129, ", // secondary (emerald)
        speed: 0.0006,
      },
    ];
  }

  function computeParticleTargetCount() {
    const ratio = Math.min(1, Math.max(0, (innerWidth - 640) / 800));
    return Math.round(CONFIG.baseCount + CONFIG.maxExtra * ratio);
  }

  function resize() {
    if (!canvas) return;
    DPR = Math.min(CONFIG.dprMax, window.devicePixelRatio || 1);
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
    initOrbs();
    adjustParticleCount();
  }

  function randSign() {
    return Math.random() < 0.5 ? -1 : 1;
  }

  function spawnParticle(): Particle {
    return {
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() * 0.7 + 0.3) * CONFIG.maxSpeed * randSign(),
      vy: (Math.random() * 0.7 + 0.3) * CONFIG.maxSpeed * randSign(),
      r: Math.random() * 1.6 + 0.8,
      hue: 195 + Math.random() * 45, // cyan to light azure
      seed: Math.random(),
    };
  }

  function adjustParticleCount() {
    const target = computeParticleTargetCount();
    if (particles.length < target) {
      for (let i = particles.length; i < target; i++) particles.push(spawnParticle());
    } else if (particles.length > target) {
      particles.length = target;
    }
  }

  function updateParticles(dt: number) {
    const w = innerWidth;
    const h = innerHeight;
    const timeScale = dt / 16.67;

    for (const p of particles) {
      p.x += (p.vx + parallaxX * CONFIG.parallaxStrength * (p.seed - 0.5)) * timeScale;
      p.y += (p.vy + parallaxY * CONFIG.parallaxStrength * (p.seed - 0.5)) * timeScale;

      if (scrollDriftY !== 0) {
        const influence = 0.4 + p.seed * 0.6;
        p.y += scrollDriftY * influence * timeScale;
        p.x += scrollDriftY * 0.1 * (p.seed - 0.5) * timeScale;
      }

      if (p.x < -30) p.x = w + 30;
      else if (p.x > w + 30) p.x = -30;
      if (p.y < -30) p.y = h + 30;
      else if (p.y > h + 30) p.y = -30;
    }

    scrollDriftY *= CONFIG.scrollDecay;
    if (Math.abs(scrollDriftY) < 0.01) scrollDriftY = 0;
  }

  function updateOrbs(t: number) {
    for (let i = 0; i < orbs.length; i++) {
      const orb = orbs[i];
      const offsetX = Math.sin(t * orb.speed + i * 2) * (innerWidth * 0.12);
      const offsetY = Math.cos(t * orb.speed * 0.8 + i) * (innerHeight * 0.12);
      orb.x = orb.targetX + offsetX;
      orb.y = orb.targetY + offsetY;
    }
  }

  function drawOrbs(isDark: boolean) {
    if (!ctx) return;
    const baseAlpha = isDark ? 0.09 : 0.14;

    for (const orb of orbs) {
      const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
      g.addColorStop(0, `${orb.color}${baseAlpha})`);
      g.addColorStop(0.5, `${orb.color}${baseAlpha * 0.4})`);
      g.addColorStop(1, `${orb.color}0)`);

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawConnections(isDark: boolean) {
    if (!ctx) return;
    const maxDist2 = CONFIG.connectDistance * CONFIG.connectDistance;
    const baseAlpha = isDark ? 0.14 : 0.18;

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < maxDist2) {
          const t = 1 - d2 / maxDist2;
          const alpha = baseAlpha * t * t;
          ctx.strokeStyle = isDark ? `rgba(56, 189, 248, ${alpha})` : `rgba(2, 132, 199, ${alpha})`;
          ctx.lineWidth = 0.8 + t * 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  function drawParticles(isDark: boolean, time: number) {
    if (!ctx) return;
    const pulse = (Math.sin(time * 0.0015) + 1) / 2;

    for (const p of particles) {
      const alpha = (isDark ? 0.35 : 0.45) + pulse * 0.2;
      ctx.beginPath();
      ctx.fillStyle = isDark
        ? `hsla(${p.hue}, 80%, 65%, ${alpha})`
        : `hsla(${p.hue}, 85%, 45%, ${alpha})`;
      ctx.arc(p.x, p.y, p.r + pulse * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawMouseGlow(isDark: boolean) {
    if (!ctx || !mouse.active) return;
    const radius = CONFIG.mouseInfluence;
    const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, radius);
    const alpha = isDark ? 0.12 : 0.16;
    grd.addColorStop(0, isDark ? `rgba(56, 189, 248, ${alpha})` : `rgba(2, 132, 199, ${alpha})`);
    grd.addColorStop(1, "rgba(2, 132, 199, 0)");

    ctx.beginPath();
    ctx.fillStyle = grd;
    ctx.arc(mouse.x, mouse.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function animate(timestamp: number) {
    if (!ctx) return;
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min(32, timestamp - lastTime);
    lastTime = timestamp;

    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const isDark = document.documentElement.classList.contains("dark");

    updateOrbs(timestamp);
    drawOrbs(isDark);

    if (animationsEnabled) {
      updateParticles(dt);
      drawConnections(isDark);
      drawParticles(isDark, timestamp);
      drawMouseGlow(isDark);
    }

    raf = requestAnimationFrame(animate);
  }

  function handleScroll() {
    const current = window.scrollY;
    const delta = current - lastScrollY;
    lastScrollY = current;
    scrollDriftY += -delta * CONFIG.scrollStrength * 0.5;
    if (scrollDriftY > 2.5) scrollDriftY = 2.5;
    else if (scrollDriftY < -2.5) scrollDriftY = -2.5;
  }

  function handlePointerMove(e: PointerEvent) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
    const cx = innerWidth / 2;
    const cy = innerHeight / 2;
    parallaxX = (mouse.x - cx) / cx;
    parallaxY = (mouse.y - cy) / cy;
  }

  function handlePointerLeave() {
    mouse.active = false;
    parallaxX = parallaxY = 0;
  }

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
    lastScrollY = window.scrollY;
    mouse.x = innerWidth / 2;
    mouse.y = innerHeight / 2;
    resize();
    raf = requestAnimationFrame(animate);

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave, { passive: true });
  });

  onDestroy(() => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerleave", handlePointerLeave);
  });
</script>

<canvas
  bind:this={canvas}
  class="animated-bg pointer-events-none fixed inset-0 z-0"
  aria-hidden="true"
></canvas>
