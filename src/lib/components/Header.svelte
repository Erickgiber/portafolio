<script lang="ts">
  import { onMount, tick } from "svelte";
  import { i18nStore } from "../stores/i18n.svelte";
  import LanguageToggle from "./LanguageToggle.svelte";
  import Logo from "./Logo.svelte";

  let { darkMode, toggleTheme } = $props();
  let isMenuOpen = $state(false);
  let activeSection = $state("");
  let t = $derived(i18nStore.t);

  let navContainer: HTMLElement | null = $state(null);
  let glowCenterX = $state(0);
  let glowOpacity = $state(0);

  const sections = ["about", "skills", "projects", "contact"];

  async function updateGlowPosition() {
    await tick();
    if (!navContainer || !activeSection) {
      glowOpacity = 0;
      return;
    }
    const activeBtn = navContainer.querySelector(
      `[data-section="${activeSection}"]`
    ) as HTMLElement | null;
    if (activeBtn) {
      glowCenterX = activeBtn.offsetLeft + activeBtn.offsetWidth / 2;
      glowOpacity = 1;
    } else {
      glowOpacity = 0;
    }
  }

  let isProgrammaticScroll = false;
  let scrollReleaseTimer: number | null = null;

  function updateActiveSection() {
    if (typeof window === "undefined" || isProgrammaticScroll) return;
    const scrollY = window.scrollY;

    // Zona superior (Hero)
    if (scrollY < 180) {
      if (activeSection !== "") {
        activeSection = "";
      }
      return;
    }

    // Scroll cercano al final de la página -> activar Contacto
    if (window.innerHeight + scrollY >= document.documentElement.scrollHeight - 80) {
      if (activeSection !== "contact") {
        activeSection = "contact";
      }
      return;
    }

    const viewportTarget = scrollY + window.innerHeight * 0.35;
    let current = "";

    for (const sectionId of sections) {
      const el = document.getElementById(sectionId);
      if (!el) continue;
      const top = el.offsetTop;
      const height = el.offsetHeight;
      if (viewportTarget >= top && viewportTarget < top + height) {
        current = sectionId;
        break;
      }
    }

    if (current && activeSection !== current) {
      activeSection = current;
    }
  }

  $effect(() => {
    if (activeSection) {
      updateGlowPosition();
    } else {
      glowOpacity = 0;
    }
  });

  onMount(() => {
    updateActiveSection();
    updateGlowPosition();

    function handleScrollEnd() {
      isProgrammaticScroll = false;
      if (scrollReleaseTimer) clearTimeout(scrollReleaseTimer);
    }

    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("scrollend", handleScrollEnd, { passive: true });
    window.addEventListener(
      "resize",
      () => {
        updateActiveSection();
        updateGlowPosition();
      },
      { passive: true }
    );
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("scrollend", handleScrollEnd);
      window.removeEventListener("resize", updateGlowPosition);
    };
  });

  function scrollToSection(sectionId: string) {
    activeSection = sectionId;
    isProgrammaticScroll = true;
    if (scrollReleaseTimer) clearTimeout(scrollReleaseTimer);

    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    isMenuOpen = false;
    updateGlowPosition();

    scrollReleaseTimer = window.setTimeout(() => {
      isProgrammaticScroll = false;
    }, 850);
  }
</script>

<header class="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 pt-3 sm:pt-4 pointer-events-none">
  <div class="max-w-6xl mx-auto pointer-events-auto">
    <nav
      class="relative flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl sm:rounded-full bg-background/70 dark:bg-background/60 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] ring-1 ring-black/[0.04] dark:ring-white/[0.08] transition-all duration-300"
    >
      <!-- Logo Monograma Vectorial -->
      <button
        onclick={() => {
          activeSection = "";
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        class="group flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full px-1.5 py-1"
        aria-label={t.nav.home}
      >
        <Logo size={36} class="group-hover:scale-105 transition-transform duration-300" />
        <span
          class="font-semibold text-sm tracking-tight hidden sm:inline-block group-hover:text-primary transition-colors"
        >
          Erick Ramírez
        </span>
      </button>

      <!-- Desktop Navigation con resplandor ambiental suave y punto luminoso -->
      <div class="relative hidden md:flex items-center space-x-1" bind:this={navContainer}>
        <!-- Resplandor difuminado suave detrás del texto activo -->
        <div
          class="absolute top-1/2 -translate-y-1/2 w-28 h-8 rounded-full pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={`left: ${glowCenterX}px; transform: translate(-50%, -50%); opacity: ${glowOpacity}; background: radial-gradient(ellipse at center, color-mix(in srgb, var(--color-primary) 22%, transparent) 0%, color-mix(in srgb, var(--color-primary) 6%, transparent) 55%, transparent 75%); filter: blur(3px);`}
        ></div>

        <!-- Punto indicador luminoso centrado exactamente debajo del texto activo -->
        <div
          class="absolute -bottom-1 pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={`left: ${glowCenterX}px; transform: translateX(-50%); opacity: ${glowOpacity};`}
        >
          <span
            class="block w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(56,189,248,0.95)]"
          ></span>
        </div>

        <button
          data-section="about"
          onclick={() => scrollToSection("about")}
          class={`nav-pill ${activeSection === "about" ? "active" : ""}`}
          aria-label={t.nav.about}
        >
          {t.nav.about}
        </button>
        <button
          data-section="skills"
          onclick={() => scrollToSection("skills")}
          class={`nav-pill ${activeSection === "skills" ? "active" : ""}`}
          aria-label={t.nav.skills}
        >
          {t.nav.skills}
        </button>
        <button
          data-section="projects"
          onclick={() => scrollToSection("projects")}
          class={`nav-pill ${activeSection === "projects" ? "active" : ""}`}
          aria-label={t.nav.projects}
        >
          {t.nav.projects}
        </button>
        <button
          data-section="contact"
          onclick={() => scrollToSection("contact")}
          class={`nav-pill ${activeSection === "contact" ? "active" : ""}`}
          aria-label={t.nav.contact}
        >
          {t.nav.contact}
        </button>
      </div>

      <!-- Actions / Toggles -->
      <div class="flex items-center gap-2">
        <!-- Language Switcher -->
        <LanguageToggle />

        <!-- Theme Toggle with tooltip -->
        <div
          class="flex items-center p-0.5 rounded-full bg-muted/50 dark:bg-muted/30 backdrop-blur-md ring-1 ring-black/[0.03] dark:ring-white/[0.06]"
        >
          <button
            onclick={toggleTheme}
            class="group relative p-2 rounded-full hover:bg-background/80 dark:hover:bg-card text-muted-foreground hover:text-foreground transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={darkMode ? t.theme.switchToLight : t.theme.switchToDark}
          >
            {#if darkMode}
              <svg
                class="w-4.5 h-4.5 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                ></path>
              </svg>
              <span class="sr-only">{t.theme.lightMode}</span>
            {:else}
              <svg
                class="w-4.5 h-4.5 text-slate-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                ></path>
              </svg>
              <span class="sr-only">{t.theme.darkMode}</span>
            {/if}
            <!-- Tooltip -->
            <span
              class="hidden md:block pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-popover/95 backdrop-blur border border-border/40 text-popover-foreground shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 origin-top whitespace-nowrap"
            >
              {darkMode ? t.theme.switchToLight : t.theme.switchToDark}
            </span>
          </button>
        </div>

        <!-- Mobile Menu Toggle Button -->
        <button
          onclick={() => (isMenuOpen = !isMenuOpen)}
          class="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {#if isMenuOpen}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          {/if}
        </button>
      </div>
    </nav>

    <!-- Mobile Floating Menu Modal -->
    {#if isMenuOpen}
      <div
        class="md:hidden mt-2 p-3 rounded-2xl bg-background/85 dark:bg-background/80 backdrop-blur-2xl shadow-xl ring-1 ring-black/[0.04] dark:ring-white/[0.08] animate-mobile-menu-enter origin-top flex flex-col space-y-1"
        role="menu"
        aria-label="Mobile navigation"
      >
        <button
          onclick={() => scrollToSection("about")}
          class={`w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-xl transition-all ${
            activeSection === "about"
              ? "bg-primary/10 dark:bg-primary/15 font-semibold text-primary"
              : "font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
          aria-label={t.nav.about}
        >
          <span>{t.nav.about}</span>
          {#if activeSection === "about"}
            <span class="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(56,189,248,0.95)]"
            ></span>
          {/if}
        </button>
        <button
          onclick={() => scrollToSection("skills")}
          class={`w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-xl transition-all ${
            activeSection === "skills"
              ? "bg-primary/10 dark:bg-primary/15 font-semibold text-primary"
              : "font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
          aria-label={t.nav.skills}
        >
          <span>{t.nav.skills}</span>
          {#if activeSection === "skills"}
            <span class="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(56,189,248,0.95)]"
            ></span>
          {/if}
        </button>
        <button
          onclick={() => scrollToSection("projects")}
          class={`w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-xl transition-all ${
            activeSection === "projects"
              ? "bg-primary/10 dark:bg-primary/15 font-semibold text-primary"
              : "font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
          aria-label={t.nav.projects}
        >
          <span>{t.nav.projects}</span>
          {#if activeSection === "projects"}
            <span class="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(56,189,248,0.95)]"
            ></span>
          {/if}
        </button>
        <button
          onclick={() => scrollToSection("contact")}
          class={`w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-xl transition-all ${
            activeSection === "contact"
              ? "bg-primary/10 dark:bg-primary/15 font-semibold text-primary"
              : "font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
          aria-label={t.nav.contact}
        >
          <span>{t.nav.contact}</span>
          {#if activeSection === "contact"}
            <span class="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(56,189,248,0.95)]"
            ></span>
          {/if}
        </button>
      </div>
    {/if}
  </div>
</header>

<style>
  .nav-pill {
    position: relative;
    z-index: 10;
    padding: 0.375rem 0.875rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-muted-foreground);
    background: transparent;
    border: none;
    transition:
      color 0.25s ease,
      text-shadow 0.25s ease;
  }
  .nav-pill:hover {
    color: var(--color-foreground);
  }
  .nav-pill.active {
    color: var(--color-primary);
    font-weight: 600;
    text-shadow: 0 0 12px color-mix(in srgb, var(--color-primary) 35%, transparent);
  }
  .nav-pill:focus-visible {
    outline: 2px solid var(--color-ring);
    outline-offset: 2px;
  }
</style>
