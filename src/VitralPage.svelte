<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import Lenis from "lenis";
  import "lenis/dist/lenis.css";
  import AnimatedBackground from "./lib/components/AnimatedBackground.svelte";
  import LanguageToggle from "./lib/components/LanguageToggle.svelte";
  import GamepadIndicator from "./lib/components/GamepadIndicator.svelte";
  import ImageViewer from "./lib/components/ImageViewer.svelte";
  import { scrollReveal } from "./lib/actions/scrollReveal";
  import { motionEnabled, scrollPageTo, useSmoothScroller } from "./lib/scroll/pageScroll";
  import { gamepadStore } from "./lib/stores/gamepad.svelte";
  import type { ViewerImage } from "./lib/viewer/types";
  import { vitralCopy } from "./lib/data/vitral";
  import {
    downloadInstaller,
    loadManifest,
    saveFile,
    type InstallerManifest,
  } from "./lib/download/installer";
  import { i18nStore } from "./lib/stores/i18n.svelte";
  import { themeStore } from "./lib/stores/theme.svelte";
  import { router } from "./lib/stores/router.svelte";

  type Phase = "idle" | "preparing" | "downloading" | "saving" | "done" | "failed" | "canceled";

  const BYTES_PER_MEGABYTE = 1_048_576;
  const RING_RADIUS = 54;
  const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
  const SAVE_DELAY_MS = 700;
  const MOBILE_PATTERN = /Android|iPhone|iPad|iPod|Mobile/i;
  const CUE_HIDE_RISE = 0.08;
  const TIPS_SCROLL_GAP = 32;
  const CURTAIN_OPEN_RISE = 0.98;
  const SMOOTH_SCROLL_LERP = 0.085;
  const SNAP_DURATION_S = 0.75;
  const DRAG_THRESHOLD_PX = 4;
  const FLICK_VELOCITY = 0.35;
  const VELOCITY_SMOOTHING = 0.6;

  type CurtainDrag = {
    pointerId: number;
    startY: number;
    startScroll: number;
    lastY: number;
    lastTime: number;
    velocity: number;
    moved: boolean;
    open: number;
    closed: number;
  };

  let phase = $state<Phase>("idle");
  let manifest = $state<InstallerManifest | null>(null);
  let loaded = $state(0);
  let bytesPerSecond = $state(0);
  let isMobile = $state(false);
  let controller: AbortController | null = null;
  let installer: Blob | null = null;
  let page: HTMLDivElement;
  let curtain: HTMLDivElement;
  let tipsPanel: HTMLDivElement;
  let heroHeight = $state(0);
  let viewportHeight = $state(0);
  let curtainRaised = $state(false);
  let curtainOpen = $state(false);
  let dragging = $state(false);
  let drag: CurtainDrag | null = null;
  let suppressClick = false;
  let viewerIndex = $state<number | null>(null);

  const copy = $derived(vitralCopy[i18nStore.locale]);
  const total = $derived(manifest?.size ?? 0);
  const share = $derived(total > 0 ? Math.min(1, loaded / total) : 0);
  const percent = $derived(Math.floor(share * 100));
  const isBusy = $derived(phase === "preparing" || phase === "downloading" || phase === "saving");
  const secondsLeft = $derived(
    bytesPerSecond > 0 ? Math.ceil((total - loaded) / bytesPerSecond) : null
  );
  const viewerImages = $derived<ViewerImage[]>(
    [copy.homeShot, ...copy.shots].map((shot) => ({
      src: shot.image,
      alt: shot.title,
      title: shot.title,
      text: shot.text,
    }))
  );
  const heroTop = $derived(Math.min(0, viewportHeight - heroHeight));
  const themeLabel = $derived(
    themeStore.isDark ? i18nStore.t.theme.switchToLight : i18nStore.t.theme.switchToDark
  );

  $effect(() => {
    document.title = copy.pageTitle;
    document.documentElement.lang = i18nStore.locale;
  });

  onMount(() => {
    themeStore.initTheme();
    isMobile = MOBILE_PATTERN.test(navigator.userAgent);
    loadManifest()
      .then((found) => (manifest = found))
      .catch(() => {});

    const warn = (event: BeforeUnloadEvent) => {
      if (isBusy) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warn);
    const releaseGuard = router.guardLeave(() => !isBusy || confirm(copy.leaveWhileBusy));
    const releaseCurtain = trackCurtain();
    const releaseSmoothScroll = startSmoothScroll();
    return () => {
      window.removeEventListener("beforeunload", warn);
      releaseGuard();
      releaseCurtain();
      releaseSmoothScroll();
      controller?.abort();
    };
  });

  function trackCurtain() {
    let frame = 0;
    const update = () => {
      frame = 0;
      const rise = Math.min(
        1,
        Math.max(0, 1 - curtain.getBoundingClientRect().top / window.innerHeight)
      );
      page.style.setProperty("--curtain", rise.toFixed(4));
      curtainRaised = rise > CUE_HIDE_RISE;
      curtainOpen = rise >= CURTAIN_OPEN_RISE;
    };
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }

  function startSmoothScroll() {
    if (!motionEnabled()) {
      return () => {};
    }

    const lenis = new Lenis({ autoRaf: true, lerp: SMOOTH_SCROLL_LERP });
    useSmoothScroller(lenis);
    return () => {
      useSmoothScroller(null);
      lenis.destroy();
    };
  }

  function scrollToElement(target: HTMLElement, gap = 0) {
    scrollPageTo(target.getBoundingClientRect().top + window.scrollY - gap);
  }

  function curtainStops() {
    const open = curtain.getBoundingClientRect().top + window.scrollY;
    return { open, closed: Math.max(0, open - window.innerHeight) };
  }

  function startDrag(event: PointerEvent) {
    suppressClick = false;
    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    event.preventDefault();
    try {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } catch {}
    drag = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startScroll: window.scrollY,
      lastY: event.clientY,
      lastTime: event.timeStamp,
      velocity: 0,
      moved: false,
      ...curtainStops(),
    };
    dragging = true;
  }

  function moveDrag(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    const elapsed = Math.max(1, event.timeStamp - drag.lastTime);
    const instant = (event.clientY - drag.lastY) / elapsed;
    drag.velocity = drag.velocity * VELOCITY_SMOOTHING + instant * (1 - VELOCITY_SMOOTHING);
    drag.lastY = event.clientY;
    drag.lastTime = event.timeStamp;

    const travel = event.clientY - drag.startY;
    drag.moved ||= Math.abs(travel) > DRAG_THRESHOLD_PX;
    if (drag.moved) {
      const top = Math.min(drag.open, Math.max(drag.closed, drag.startScroll - travel));
      scrollPageTo(top, { immediate: true });
    }
  }

  function endDrag(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    const { moved, velocity, open, closed } = drag;
    drag = null;
    dragging = false;
    if (!moved) {
      return;
    }

    suppressClick = true;
    const shouldOpen =
      Math.abs(velocity) > FLICK_VELOCITY
        ? velocity < 0
        : window.scrollY - closed > (open - closed) / 2;
    scrollPageTo(shouldOpen ? open : closed, { duration: SNAP_DURATION_S });
  }

  function toggleCurtain(event: MouseEvent) {
    if (suppressClick && event.detail !== 0) {
      suppressClick = false;
      return;
    }

    const { open, closed } = curtainStops();
    scrollPageTo(curtainOpen ? closed : open, { duration: SNAP_DURATION_S });
  }

  function goBack(event: MouseEvent) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    router.back("/");
  }

  function megabytes(bytes: number): string {
    return (bytes / BYTES_PER_MEGABYTE).toFixed(bytes >= 100 * BYTES_PER_MEGABYTE ? 0 : 1);
  }

  function duration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const { minutes: minuteUnit, seconds: secondUnit } = copy.units;
    return minutes > 0
      ? `${minutes} ${minuteUnit} ${seconds % 60} ${secondUnit}`
      : `${seconds} ${secondUnit}`;
  }

  async function start() {
    if (isBusy) {
      return;
    }

    controller = new AbortController();
    phase = "preparing";
    loaded = 0;
    bytesPerSecond = 0;
    installer = null;
    try {
      const current = manifest ?? (await loadManifest(controller.signal));
      manifest = current;
      phase = "downloading";
      const file = await downloadInstaller(current, controller.signal, (progress) => {
        loaded = progress.loaded;
        bytesPerSecond = progress.bytesPerSecond;
      });
      installer = file;
      loaded = current.size;
      phase = "saving";
      await new Promise((resolve) => setTimeout(resolve, SAVE_DELAY_MS));
      saveFile(file, current.fileName);
      phase = "done";
    } catch {
      phase = controller.signal.aborted ? "canceled" : "failed";
    }
  }

  function cancel() {
    controller?.abort();
  }

  function saveAgain() {
    if (installer && manifest) {
      saveFile(installer, manifest.fileName);
    }
  }
</script>

<svelte:window bind:innerHeight={viewportHeight} />

<div
  bind:this={page}
  class="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-x-clip z-10"
>
  <AnimatedBackground />

  <section
    bind:clientHeight={heroHeight}
    data-gamepad-sticky
    class="sticky z-0 w-full min-h-dvh flex flex-col"
    style:top="{heroTop}px"
  >
    <div class="vitral-stage flex-1 flex flex-col">
      <header class="relative z-20 container mx-auto px-4 py-5 flex items-center justify-between">
        <a
          href="/"
          onclick={goBack}
          class="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <Icon icon="mdi:arrow-left" class="w-4 h-4" />
          {copy.back}
        </a>
        <div
          class="flex items-center gap-0.5 p-0.5 rounded-full bg-muted/50 dark:bg-muted/30 backdrop-blur-md ring-1 ring-black/[0.04] dark:ring-white/[0.08]"
        >
          <GamepadIndicator />
          <LanguageToggle />
          <button
            type="button"
            class="grid place-items-center w-8 h-8 rounded-full hover:bg-background/80 dark:hover:bg-card hover:text-primary active:scale-95 transition-all cursor-pointer"
            aria-label={themeLabel}
            title={themeLabel}
            onclick={themeStore.toggleTheme}
          >
            <Icon
              icon={themeStore.isDark ? "mdi:weather-sunny" : "mdi:weather-night"}
              class="w-4 h-4"
            />
          </button>
        </div>
      </header>

      <div
        class="relative z-10 container mx-auto px-4 flex-1 grid lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-14 items-center pt-4 pb-32 sm:pb-36"
      >
        <div class="vitral-rise">
          <div class="flex items-center gap-3 mb-6">
            <img
              src="/vitral/icon.png"
              alt=""
              class="w-14 h-14 rounded-2xl shadow-lg shadow-primary/20 vitral-float"
            />
            <div>
              <p class="text-2xl font-bold tracking-tight">Vitral</p>
              <p class="text-xs font-semibold text-primary">{copy.badge}</p>
            </div>
          </div>

          <h1 class="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.05]">
            {copy.headline}
            <span
              class="block bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500 bg-clip-text text-transparent"
            >
              {copy.headlineAccent}
            </span>
          </h1>
          <p class="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
            {copy.lead}
          </p>

          <div
            class="mt-8 max-w-xl rounded-3xl border border-border/60 dark:border-white/[0.08] bg-card/80 dark:bg-card/50 backdrop-blur-md p-5 sm:p-6 shadow-xl shadow-primary/5"
          >
            {#if phase === "idle" || phase === "failed" || phase === "canceled"}
              <button
                type="button"
                class="vitral-shine group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-violet-600 px-6 py-4 text-white font-semibold text-lg shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isMobile}
                onclick={start}
              >
                <span class="relative flex items-center justify-center gap-3">
                  <Icon icon="mdi:download" class="w-6 h-6 group-hover:animate-bounce" />
                  {phase === "idle" ? copy.download : copy.retry}
                </span>
              </button>
              {#if phase === "failed" || phase === "canceled"}
                <p
                  class="mt-3 text-sm {phase === 'failed'
                    ? 'text-destructive'
                    : 'text-muted-foreground'}"
                >
                  {phase === "failed" ? copy.failed : copy.canceled}
                </p>
              {/if}
              {#if isMobile}
                <p class="mt-3 text-sm text-muted-foreground">{copy.mobileNote}</p>
              {/if}
            {:else}
              <div class="flex items-center gap-5">
                <div class="relative w-28 h-28 shrink-0">
                  <svg viewBox="0 0 120 120" class="w-full h-full -rotate-90" aria-hidden="true">
                    <defs>
                      <linearGradient id="vitral-ring" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stop-color="#38bdf8"></stop>
                        <stop offset="0.5" stop-color="#3b82f6"></stop>
                        <stop offset="1" stop-color="#8b5cf6"></stop>
                      </linearGradient>
                    </defs>
                    <circle
                      cx="60"
                      cy="60"
                      r={RING_RADIUS}
                      fill="none"
                      stroke="currentColor"
                      stroke-width="9"
                      class="text-muted/70 dark:text-muted/40"
                    ></circle>
                    <circle
                      cx="60"
                      cy="60"
                      r={RING_RADIUS}
                      fill="none"
                      stroke={phase === "done" ? "#10b981" : "url(#vitral-ring)"}
                      stroke-width="9"
                      stroke-linecap="round"
                      stroke-dasharray={RING_LENGTH}
                      stroke-dashoffset={RING_LENGTH * (1 - (phase === "preparing" ? 0.04 : share))}
                      class="transition-[stroke-dashoffset,stroke] duration-300 ease-out {phase ===
                      'preparing'
                        ? 'vitral-spin'
                        : ''}"
                      style="transform-origin: 60px 60px"
                    ></circle>
                  </svg>
                  <div class="absolute inset-0 grid place-items-center">
                    {#if phase === "done"}
                      <Icon icon="mdi:check-bold" class="w-11 h-11 text-emerald-500 vitral-pop" />
                    {:else}
                      <p class="text-2xl font-bold tabular-nums">
                        {percent}<span class="text-sm font-semibold text-muted-foreground">%</span>
                      </p>
                    {/if}
                  </div>
                </div>

                <div class="min-w-0 flex-1" aria-live="polite">
                  <p class="text-lg font-semibold">
                    {#if phase === "preparing"}{copy.preparing}…
                    {:else if phase === "downloading"}{copy.downloading}…
                    {:else if phase === "saving"}{copy.saving}…
                    {:else}{copy.done}{/if}
                  </p>
                  {#if phase === "done"}
                    <p class="mt-1 text-sm text-muted-foreground">{copy.doneHint}</p>
                  {:else}
                    <p class="mt-1 text-sm text-muted-foreground tabular-nums">
                      {megabytes(loaded)} / {megabytes(total)}
                      {copy.units.megabytes}
                      {#if phase === "downloading" && bytesPerSecond > 0}
                        · {megabytes(bytesPerSecond)}
                        {copy.units.megabytesPerSecond}
                        {#if secondsLeft !== null}· {duration(secondsLeft)} {copy.remaining}{/if}
                      {/if}
                    </p>
                  {/if}

                  <div class="mt-3 h-2 rounded-full bg-muted/70 dark:bg-muted/40 overflow-hidden">
                    <div
                      class="h-full rounded-full transition-[width] duration-300 ease-out {phase ===
                      'done'
                        ? 'bg-emerald-500'
                        : 'vitral-bar bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500'}"
                      style:width="{phase === 'preparing' ? 4 : share * 100}%"
                    ></div>
                  </div>

                  <div class="mt-3">
                    {#if phase === "done"}
                      <button
                        type="button"
                        class="text-sm font-semibold text-primary hover:underline cursor-pointer"
                        onclick={saveAgain}
                      >
                        {copy.saveAgain}
                      </button>
                    {:else if phase !== "saving"}
                      <button
                        type="button"
                        class="text-sm font-semibold text-muted-foreground hover:text-destructive cursor-pointer"
                        onclick={cancel}
                      >
                        {copy.cancel}
                      </button>
                    {/if}
                  </div>
                </div>
              </div>
            {/if}

            <div
              class="mt-5 pt-4 border-t border-border/60 dark:border-white/[0.06] flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground"
            >
              {#if manifest}
                <span
                  >{copy.version} <strong class="text-foreground">{manifest.version}</strong></span
                >
                <span
                  >{copy.size}
                  <strong class="text-foreground"
                    >{megabytes(manifest.size)} {copy.units.megabytes}</strong
                  ></span
                >
              {/if}
              <span>{copy.requirements}</span>
            </div>
            <p class="mt-2 text-xs text-muted-foreground">{copy.licenseNote}</p>
            <button
              type="button"
              class="group mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary cursor-pointer"
              onclick={() => scrollToElement(tipsPanel, TIPS_SCROLL_GAP)}
            >
              <Icon icon="mdi:lightbulb-on-outline" class="w-4 h-4 shrink-0" />
              <span class="group-hover:underline">{copy.tipsLink}</span>
              <Icon
                icon="mdi:arrow-down"
                class="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-y-0.5"
              />
            </button>
          </div>
        </div>

        <div class="relative vitral-rise" style="animation-delay: 120ms">
          <div
            class="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-sky-500/25 via-blue-600/20 to-violet-600/25 blur-3xl vitral-glow"
          ></div>
          <button
            type="button"
            class="group relative block w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40 vitral-tilt cursor-zoom-in"
            aria-label="{copy.openImage}: {copy.homeShot.title}"
            aria-haspopup="dialog"
            data-testid="vitral-hero-shot"
            onclick={() => (viewerIndex = 0)}
          >
            <img
              src={copy.homeShot.image}
              alt={copy.screenshotAlt}
              width="1600"
              height="900"
              class="block w-full h-auto"
            />
            <span
              class="absolute right-3 bottom-3 grid place-items-center w-10 h-10 rounded-full bg-black/50 text-white backdrop-blur-md opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:scale-100 transition-all"
              aria-hidden="true"
            >
              <Icon icon="mdi:arrow-expand" class="w-5 h-5" />
            </span>
          </button>
        </div>
      </div>
    </div>
  </section>

  <button
    type="button"
    class="vitral-cue fixed bottom-5 sm:bottom-7 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-2 rounded-full px-4 py-2.5 max-sm:bg-background/70 max-sm:backdrop-blur-md max-sm:ring-1 max-sm:ring-black/[0.05] max-sm:dark:ring-white/[0.08] text-muted-foreground hover:text-primary transition-[opacity,color,translate] duration-500 cursor-pointer {curtainRaised ||
    gamepadStore.connected
      ? 'opacity-0 translate-y-4 pointer-events-none'
      : 'opacity-100'}"
    aria-label={copy.scrollLabel}
    aria-hidden={curtainRaised || gamepadStore.connected}
    tabindex={curtainRaised || gamepadStore.connected ? -1 : 0}
    data-testid="vitral-scroll-cue"
    onclick={() => scrollToElement(curtain)}
  >
    <span
      class="vitral-mouse relative hidden sm:block w-6 h-10 rounded-full border-2 border-current"
      aria-hidden="true"
    >
      <span class="vitral-wheel absolute left-1/2 top-2 w-1 h-2 -ml-0.5 rounded-full bg-current"
      ></span>
    </span>
    <span class="text-[11px] font-semibold uppercase tracking-[0.2em] whitespace-nowrap"
      >{copy.scrollHint}</span
    >
    <Icon icon="mdi:chevron-double-down" class="vitral-nudge w-5 h-5" aria-hidden="true" />
  </button>

  <div
    bind:this={curtain}
    data-testid="vitral-curtain"
    class="vitral-curtain relative z-10 rounded-t-[2rem] sm:rounded-t-[3.5rem]"
  >
    <div
      class="vitral-curtain-glow pointer-events-none absolute inset-x-0 top-0 h-96 rounded-t-[inherit]"
      aria-hidden="true"
    ></div>
    <button
      type="button"
      class="group absolute left-1/2 top-0 z-10 flex w-40 -translate-x-1/2 justify-center pt-4 pb-5 touch-none select-none {dragging
        ? 'cursor-grabbing'
        : 'cursor-grab'}"
      aria-label={curtainOpen ? copy.handleClose : copy.handleOpen}
      title={curtainOpen ? copy.handleClose : copy.handleOpen}
      onpointerdown={startDrag}
      onpointermove={moveDrag}
      onpointerup={endDrag}
      onpointercancel={endDrag}
      onclick={toggleCurtain}
      data-testid="vitral-curtain-handle"
    >
      <span
        class="block h-1.5 rounded-full transition-all duration-300 {dragging
          ? 'w-20 bg-primary'
          : 'w-12 bg-muted-foreground/30 group-hover:w-16 group-hover:bg-primary/70 group-focus-visible:w-16 group-focus-visible:bg-primary'}"
      ></span>
    </button>

    <main class="relative container mx-auto px-4 pt-12 sm:pt-20 pb-20">
      <section>
        <h2
          class="text-center text-3xl md:text-4xl font-bold tracking-tight mb-10"
          use:scrollReveal={{ from: "left" }}
        >
          {copy.featuresTitle}
        </h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {#each copy.features as feature, index (feature.icon)}
            <article
              class="rounded-2xl border border-border/50 dark:border-white/[0.08] bg-card/90 dark:bg-card/60 backdrop-blur-md p-6 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 transition-[translate,box-shadow] duration-300"
              use:scrollReveal={{
                from: index % 2 === 0 ? "left" : "right",
                lag: (index % 3) * 0.12,
              }}
            >
              <span
                class="grid place-items-center w-11 h-11 rounded-xl bg-primary/10 text-primary mb-4"
              >
                <Icon icon={feature.icon} class="w-6 h-6" />
              </span>
              <h3 class="text-lg font-semibold tracking-tight mb-1.5">{feature.title}</h3>
              <p class="text-sm text-muted-foreground leading-relaxed">{feature.text}</p>
            </article>
          {/each}
        </div>
      </section>

      <section
        class="mt-20 sm:mt-28 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-10 items-start"
      >
        <div>
          <h2
            class="text-center lg:text-left text-3xl md:text-4xl font-bold tracking-tight mb-8"
            use:scrollReveal={{ from: "left" }}
          >
            {copy.stepsTitle}
          </h2>
          <ol class="space-y-3">
            {#each copy.steps as step, index (index)}
              <li
                class="flex items-center gap-4 rounded-2xl border border-border/50 dark:border-white/[0.08] bg-card/90 dark:bg-card/60 p-4"
                use:scrollReveal={{ from: "left", lag: index * 0.08 }}
              >
                <span
                  class="grid place-items-center w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-sky-500 to-violet-600 text-white font-bold"
                >
                  {index + 1}
                </span>
                <span class="text-sm sm:text-base">{step}</span>
              </li>
            {/each}
          </ol>
        </div>

        <div
          bind:this={tipsPanel}
          class="relative rounded-3xl border border-primary/25 bg-gradient-to-br from-sky-500/[0.07] via-transparent to-violet-600/[0.08] p-6 sm:p-8 shadow-xl shadow-primary/5"
          use:scrollReveal={{ from: "right", distance: 120 }}
        >
          <div class="flex items-center gap-3 mb-3">
            <span
              class="grid place-items-center w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 text-white shadow-lg shadow-primary/20"
            >
              <Icon icon="mdi:lightbulb-on-outline" class="w-6 h-6" />
            </span>
            <h2 class="text-2xl md:text-3xl font-bold tracking-tight">{copy.tipsTitle}</h2>
          </div>
          <p class="text-sm sm:text-base text-muted-foreground mb-6">{copy.tipsLead}</p>
          <div class="space-y-4">
            {#each copy.tips as tip, index (tip.title)}
              <div
                class="rounded-2xl border border-border/50 dark:border-white/[0.08] bg-card/90 dark:bg-card/60 p-5 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 transition-[translate,box-shadow] duration-300"
              >
                <div class="flex items-center gap-3 mb-2">
                  <span
                    class="grid place-items-center w-9 h-9 shrink-0 rounded-lg bg-primary/10 text-primary"
                  >
                    <Icon icon={tip.icon} class="w-5 h-5" />
                  </span>
                  <h3 class="text-base sm:text-lg font-semibold tracking-tight">{tip.title}</h3>
                </div>
                <p class="text-sm text-muted-foreground leading-relaxed">{tip.text}</p>
              </div>
            {/each}
          </div>
        </div>
      </section>

      <section class="mt-20 sm:mt-28">
        <h2
          class="text-center text-3xl md:text-4xl font-bold tracking-tight mb-10"
          use:scrollReveal={{ from: "right" }}
        >
          {copy.shotsTitle}
        </h2>
        <div class="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {#each copy.shots as shot, index (shot.image)}
            <figure
              class="group rounded-2xl overflow-hidden border border-border/50 dark:border-white/[0.08] bg-card/90 dark:bg-card/60"
              use:scrollReveal={{ from: index % 2 === 0 ? "left" : "right", lag: index * 0.12 }}
            >
              <button
                type="button"
                class="relative block w-full overflow-hidden cursor-zoom-in"
                aria-label="{copy.openImage}: {shot.title}"
                aria-haspopup="dialog"
                data-testid="vitral-shot"
                onclick={() => (viewerIndex = index + 1)}
              >
                <img
                  src={shot.image}
                  alt={shot.title}
                  loading="lazy"
                  width="1600"
                  height="900"
                  class="block w-full h-auto group-hover:scale-[1.04] transition-transform duration-500"
                />
                <span
                  class="absolute right-3 bottom-3 grid place-items-center w-9 h-9 rounded-full bg-black/50 text-white backdrop-blur-md opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 transition-all"
                  aria-hidden="true"
                >
                  <Icon icon="mdi:arrow-expand" class="w-5 h-5" />
                </span>
              </button>
              <figcaption class="p-4">
                <p class="font-semibold">{shot.title}</p>
                <p class="text-sm text-muted-foreground">{shot.text}</p>
              </figcaption>
            </figure>
          {/each}
        </div>
      </section>

      <p class="mt-16 text-center text-xs text-muted-foreground">{copy.footer}</p>
    </main>
  </div>
</div>

<ImageViewer images={viewerImages} bind:index={viewerIndex} copy={copy.viewer} />

<style>
  .vitral-stage {
    transform: translate3d(0, calc(var(--curtain, 0) * -5rem), 0)
      scale(calc(1 - var(--curtain, 0) * 0.07));
    opacity: calc(1 - var(--curtain, 0) * 0.85);
    transform-origin: 50% 100%;
  }

  .vitral-curtain {
    transform: scale(calc(0.93 + var(--curtain, 1) * 0.07));
    transform-origin: 50% 0;
    border-top: 1.5px solid transparent;
    background:
      linear-gradient(var(--color-background), var(--color-background)) padding-box,
      linear-gradient(90deg, #22d3ee, #3b82f6, #a855f7, #ec4899, #a855f7, #3b82f6, #22d3ee) 0 0 /
        200% 100% border-box;
    box-shadow: 0 -18px 48px -28px rgb(2 6 23 / 0.45);
    animation: vitral-edge 8s linear infinite;
  }

  .vitral-curtain::before {
    content: "";
    position: absolute;
    top: -2px;
    left: 50%;
    width: min(70%, 44rem);
    height: 3px;
    translate: -50% 0;
    border-radius: 9999px;
    background: linear-gradient(90deg, transparent, #22d3ee, #a855f7, #ec4899, transparent);
    filter: blur(7px);
    opacity: 0.7;
    pointer-events: none;
    animation: vitral-bloom 4s ease-in-out infinite alternate;
  }

  .vitral-curtain-glow {
    background: radial-gradient(
      55% 100% at 50% 0%,
      rgb(56 189 248 / 0.07),
      rgb(168 85 247 / 0.04) 45%,
      transparent 75%
    );
  }

  .vitral-wheel {
    animation: vitral-wheel 1.8s cubic-bezier(0.6, 0, 0.4, 1) infinite;
  }

  :global(.vitral-nudge) {
    animation: vitral-nudge 1.8s ease-in-out infinite;
  }

  .vitral-rise {
    animation: vitral-rise 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .vitral-float {
    animation: vitral-float 5s ease-in-out infinite;
  }

  .vitral-glow {
    animation: vitral-glow 6s ease-in-out infinite alternate;
  }

  .vitral-tilt {
    transform: perspective(1400px) rotateY(-6deg) rotateX(2deg);
    transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .vitral-tilt:hover {
    transform: perspective(1400px) rotateY(0deg) rotateX(0deg) scale(1.01);
  }

  .vitral-shine::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      110deg,
      transparent 30%,
      rgb(255 255 255 / 0.35) 50%,
      transparent 70%
    );
    transform: translateX(-100%);
    animation: vitral-shine 3.2s ease-in-out infinite;
  }

  .vitral-bar {
    background-size: 200% 100%;
    animation: vitral-flow 1.6s linear infinite;
  }

  .vitral-spin {
    animation: vitral-spin 1s linear infinite;
  }

  :global(.vitral-pop) {
    animation: vitral-pop 0.5s cubic-bezier(0.2, 1.4, 0.4, 1) both;
  }

  @keyframes vitral-rise {
    from {
      opacity: 0;
      transform: translateY(22px);
    }
  }

  @keyframes vitral-float {
    50% {
      transform: translateY(-6px);
    }
  }

  @keyframes vitral-glow {
    to {
      opacity: 0.6;
      transform: scale(1.06);
    }
  }

  @keyframes vitral-shine {
    60%,
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes vitral-flow {
    to {
      background-position: -200% 0;
    }
  }

  @keyframes vitral-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes vitral-edge {
    to {
      background-position:
        0 0,
        -200% 0;
    }
  }

  @keyframes vitral-bloom {
    from {
      opacity: 0.4;
      width: min(50%, 32rem);
    }
    to {
      opacity: 0.8;
      width: min(75%, 48rem);
    }
  }

  @keyframes vitral-wheel {
    0% {
      opacity: 0;
      transform: translateY(-2px);
    }
    30% {
      opacity: 1;
    }
    80%,
    100% {
      opacity: 0;
      transform: translateY(12px);
    }
  }

  @keyframes vitral-nudge {
    0%,
    100% {
      transform: translateY(0);
      opacity: 0.6;
    }
    50% {
      transform: translateY(5px);
      opacity: 1;
    }
  }

  @keyframes vitral-pop {
    from {
      opacity: 0;
      transform: scale(0.3);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .vitral-rise,
    .vitral-float,
    .vitral-glow,
    .vitral-shine::before,
    .vitral-bar,
    .vitral-wheel,
    .vitral-curtain,
    .vitral-curtain::before,
    :global(.vitral-nudge),
    :global(.vitral-pop) {
      animation: none;
    }

    .vitral-tilt,
    .vitral-stage,
    .vitral-curtain {
      transform: none;
    }

    .vitral-stage {
      opacity: 1;
    }
  }

  :global([data-animations="off"]) .vitral-stage,
  :global([data-animations="off"]) .vitral-curtain {
    transform: none;
    opacity: 1;
  }

  :global([data-animations="off"]) .vitral-curtain,
  :global([data-animations="off"]) .vitral-curtain::before,
  :global([data-animations="off"]) .vitral-wheel,
  :global([data-animations="off"]) :global(.vitral-nudge) {
    animation: none;
  }
</style>
