<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import AnimatedBackground from "./lib/components/AnimatedBackground.svelte";
  import LanguageToggle from "./lib/components/LanguageToggle.svelte";
  import { reveal } from "./lib/actions/reveal";
  import { vitralCopy } from "./lib/data/vitral";
  import {
    downloadInstaller,
    loadManifest,
    saveFile,
    type InstallerManifest,
  } from "./lib/download/installer";
  import { i18nStore } from "./lib/stores/i18n.svelte";
  import { themeStore } from "./lib/stores/theme.svelte";

  type Phase = "idle" | "preparing" | "downloading" | "saving" | "done" | "failed" | "canceled";

  const BYTES_PER_MEGABYTE = 1_048_576;
  const RING_RADIUS = 54;
  const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
  const SAVE_DELAY_MS = 700;
  const MOBILE_PATTERN = /Android|iPhone|iPad|iPod|Mobile/i;

  let phase = $state<Phase>("idle");
  let manifest = $state<InstallerManifest | null>(null);
  let loaded = $state(0);
  let bytesPerSecond = $state(0);
  let isMobile = $state(false);
  let controller: AbortController | null = null;
  let installer: Blob | null = null;

  const copy = $derived(vitralCopy[i18nStore.locale]);
  const total = $derived(manifest?.size ?? 0);
  const share = $derived(total > 0 ? Math.min(1, loaded / total) : 0);
  const percent = $derived(Math.floor(share * 100));
  const isBusy = $derived(phase === "preparing" || phase === "downloading" || phase === "saving");
  const secondsLeft = $derived(bytesPerSecond > 0 ? Math.ceil((total - loaded) / bytesPerSecond) : null);

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
    return () => window.removeEventListener("beforeunload", warn);
  });

  function megabytes(bytes: number): string {
    return (bytes / BYTES_PER_MEGABYTE).toFixed(bytes >= 100 * BYTES_PER_MEGABYTE ? 0 : 1);
  }

  function duration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes} min ${seconds % 60} s` : `${seconds} s`;
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

<div class="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-hidden z-10">
  <AnimatedBackground />

  <header class="relative z-20 container mx-auto px-4 py-5 flex items-center justify-between">
    <a
      href="/"
      class="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
    >
      <Icon icon="mdi:arrow-left" class="w-4 h-4" />
      {copy.back}
    </a>
    <div class="flex items-center gap-2">
      <LanguageToggle />
      <button
        type="button"
        class="grid place-items-center w-9 h-9 rounded-full bg-muted/50 dark:bg-muted/30 ring-1 ring-black/[0.04] dark:ring-white/[0.08] hover:text-primary active:scale-95 transition-all cursor-pointer"
        aria-label="Theme"
        onclick={themeStore.toggleTheme}
      >
        <Icon icon={themeStore.isDark ? "mdi:weather-sunny" : "mdi:weather-night"} class="w-4 h-4" />
      </button>
    </div>
  </header>

  <main class="relative z-10 container mx-auto px-4 pb-20">
    <section class="grid lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-14 items-center pt-6 sm:pt-12">
      <div class="vitral-rise">
        <div class="flex items-center gap-3 mb-6">
          <img src="/vitral/icon.png" alt="" class="w-14 h-14 rounded-2xl shadow-lg shadow-primary/20 vitral-float" />
          <div>
            <p class="text-2xl font-bold tracking-tight">Vitral</p>
            <p class="text-xs font-semibold text-primary">{copy.badge}</p>
          </div>
        </div>

        <h1 class="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.05]">
          {copy.headline}
          <span class="block bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
            {copy.headlineAccent}
          </span>
        </h1>
        <p class="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">{copy.lead}</p>

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
              <p class="mt-3 text-sm {phase === 'failed' ? 'text-destructive' : 'text-muted-foreground'}">
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
                      <stop offset="0" stop-color="#38bdf8" />
                      <stop offset="0.5" stop-color="#3b82f6" />
                      <stop offset="1" stop-color="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <circle cx="60" cy="60" r={RING_RADIUS} fill="none" stroke="currentColor" stroke-width="9" class="text-muted/70 dark:text-muted/40" />
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
                    class="transition-[stroke-dashoffset,stroke] duration-300 ease-out {phase === 'preparing' ? 'vitral-spin' : ''}"
                    style="transform-origin: 60px 60px"
                  />
                </svg>
                <div class="absolute inset-0 grid place-items-center">
                  {#if phase === "done"}
                    <Icon icon="mdi:check-bold" class="w-11 h-11 text-emerald-500 vitral-pop" />
                  {:else}
                    <p class="text-2xl font-bold tabular-nums">{percent}<span class="text-sm font-semibold text-muted-foreground">%</span></p>
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
                    {megabytes(loaded)} / {megabytes(total)} MB
                    {#if phase === "downloading" && bytesPerSecond > 0}
                      · {megabytes(bytesPerSecond)} MB/s
                      {#if secondsLeft !== null}· {duration(secondsLeft)} {copy.remaining}{/if}
                    {/if}
                  </p>
                {/if}

                <div class="mt-3 h-2 rounded-full bg-muted/70 dark:bg-muted/40 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-[width] duration-300 ease-out {phase === 'done'
                      ? 'bg-emerald-500'
                      : 'vitral-bar bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500'}"
                    style:width="{phase === 'preparing' ? 4 : share * 100}%"
                  ></div>
                </div>

                <div class="mt-3">
                  {#if phase === "done"}
                    <button type="button" class="text-sm font-semibold text-primary hover:underline cursor-pointer" onclick={saveAgain}>
                      {copy.saveAgain}
                    </button>
                  {:else if phase !== "saving"}
                    <button type="button" class="text-sm font-semibold text-muted-foreground hover:text-destructive cursor-pointer" onclick={cancel}>
                      {copy.cancel}
                    </button>
                  {/if}
                </div>
              </div>
            </div>
          {/if}

          <div class="mt-5 pt-4 border-t border-border/60 dark:border-white/[0.06] flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
            {#if manifest}
              <span>{copy.version} <strong class="text-foreground">{manifest.version}</strong></span>
              <span>{copy.size} <strong class="text-foreground">{megabytes(manifest.size)} MB</strong></span>
            {/if}
            <span>{copy.requirements}</span>
          </div>
          <p class="mt-2 text-xs text-muted-foreground">{copy.licenseNote}</p>
        </div>
      </div>

      <div class="relative vitral-rise" style="animation-delay: 120ms">
        <div class="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-sky-500/25 via-blue-600/20 to-violet-600/25 blur-3xl vitral-glow"></div>
        <div class="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40 vitral-tilt">
          <img src="/vitral/home.webp" alt="Vitral" width="1600" height="900" class="block w-full h-auto" />
        </div>
      </div>
    </section>

    <section class="mt-20 sm:mt-28" use:reveal={{ direction: "up", distance: 30 }}>
      <h2 class="text-center text-3xl md:text-4xl font-bold tracking-tight mb-10">{copy.featuresTitle}</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
        {#each copy.features as feature, index (feature.icon)}
          <article
            class="rounded-2xl border border-border/50 dark:border-white/[0.08] bg-card/90 dark:bg-card/60 backdrop-blur-md p-6 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
            use:reveal={{ delay: 40 + index * 70 }}
          >
            <span class="grid place-items-center w-11 h-11 rounded-xl bg-primary/10 text-primary mb-4">
              <Icon icon={feature.icon} class="w-6 h-6" />
            </span>
            <h3 class="text-lg font-semibold tracking-tight mb-1.5">{feature.title}</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">{feature.text}</p>
          </article>
        {/each}
      </div>
    </section>

    <section class="mt-20 sm:mt-28" use:reveal={{ direction: "up", distance: 30 }}>
      <h2 class="text-center text-3xl md:text-4xl font-bold tracking-tight mb-10">{copy.shotsTitle}</h2>
      <div class="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
        {#each copy.shots as shot, index (shot.image)}
          <figure
            class="group rounded-2xl overflow-hidden border border-border/50 dark:border-white/[0.08] bg-card/90 dark:bg-card/60"
            use:reveal={{ delay: 40 + index * 90 }}
          >
            <div class="overflow-hidden">
              <img
                src={shot.image}
                alt={shot.title}
                loading="lazy"
                width="1600"
                height="900"
                class="block w-full h-auto group-hover:scale-[1.04] transition-transform duration-500"
              />
            </div>
            <figcaption class="p-4">
              <p class="font-semibold">{shot.title}</p>
              <p class="text-sm text-muted-foreground">{shot.text}</p>
            </figcaption>
          </figure>
        {/each}
      </div>
    </section>

    <section class="mt-20 sm:mt-28 max-w-3xl mx-auto" use:reveal={{ direction: "up", distance: 30 }}>
      <h2 class="text-center text-3xl md:text-4xl font-bold tracking-tight mb-8">{copy.stepsTitle}</h2>
      <ol class="space-y-3">
        {#each copy.steps as step, index (index)}
          <li
            class="flex items-center gap-4 rounded-2xl border border-border/50 dark:border-white/[0.08] bg-card/90 dark:bg-card/60 p-4"
            use:reveal={{ delay: 40 + index * 90 }}
          >
            <span class="grid place-items-center w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-sky-500 to-violet-600 text-white font-bold">
              {index + 1}
            </span>
            <span class="text-sm sm:text-base">{step}</span>
          </li>
        {/each}
      </ol>
    </section>

    <p class="mt-16 text-center text-xs text-muted-foreground">{copy.footer}</p>
  </main>
</div>

<style>
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
    background: linear-gradient(110deg, transparent 30%, rgb(255 255 255 / 0.35) 50%, transparent 70%);
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
    :global(.vitral-pop) {
      animation: none;
    }

    .vitral-tilt {
      transform: none;
    }
  }
</style>
