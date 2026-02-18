<script lang="ts">
  let { darkMode, toggleTheme } = $props();
  let isMenuOpen = $state(false);
  import { animationsStore } from "../stores/animations.svelte";
  // Crear referencias reactivas a las propiedades del store singleton
  let animationsEnabled = $derived(animationsStore.animationsEnabled);
  const { toggleAnimations, initAnimations } = animationsStore;

  $effect(() => {
    initAnimations();
  });

  function scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    isMenuOpen = false;
  }
</script>

<header class="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
  <nav class="container mx-auto px-4 py-4">
    <div class="flex items-center justify-between">
      <div class="text-2xl font-bold text-primary">ER</div>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center space-x-8">
        <button onclick={() => scrollToSection("about")} class="nav-link" aria-label="Sobre mí">
          Sobre mí
        </button>
        <button onclick={() => scrollToSection("skills")} class="nav-link" aria-label="Habilidades">
          Habilidades
        </button>
        <button onclick={() => scrollToSection("projects")} class="nav-link" aria-label="Proyectos">
          Proyectos
        </button>
        <button onclick={() => scrollToSection("contact")} class="nav-link" aria-label="Contacto">
          Contacto
        </button>
        <!-- Toggle buttons grouped with closer spacing -->
        <div class="flex items-center space-x-2">
          <!-- Animations Toggle with tooltip -->
          <button
            onclick={toggleAnimations}
            class="group relative p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label={animationsEnabled ? "Desactivar animaciones" : "Activar animaciones"}
          >
            {#if animationsEnabled}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                class="text-primary transition-colors"
              >
                <path
                  fill="currentColor"
                  d="M4 2c-1.11 0-2 .89-2 2v10h2V4h10V2zm4 4c-1.11 0-2 .89-2 2v10h2V8h10V6zm4 4c-1.11 0-2 .89-2 2v8c0 1.11.89 2 2 2h8c1.11 0 2-.89 2-2v-8c0-1.11-.89-2-2-2z"
                ></path>
              </svg>
              <span class="sr-only">Animaciones activadas</span>
            {:else}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                class="opacity-80 group-hover:opacity-100 transition-opacity"
              >
                <path
                  fill="currentColor"
                  d="M4 2a2 2 0 0 0-2 2v10h2V4h10V2zm4 4a2 2 0 0 0-2 2v10h2V8h10V6zm12 6v8h-8v-8zm0-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2"
                ></path>
              </svg>
              <span class="sr-only">Animaciones desactivadas</span>
            {/if}
            <!-- Tooltip -->
            <span
              class="hidden md:block pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2.5 py-1.5 rounded-md text-xs font-medium bg-popover/90 backdrop-blur border border-border text-popover-foreground shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-top"
            >
              {#if animationsEnabled}
                Pausar animaciones
              {:else}
                Activar animaciones
              {/if}
            </span>
          </button>

          <!-- Theme Toggle with tooltip -->
          <button
            onclick={toggleTheme}
            class="group relative p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {#if darkMode}
              <svg
                class="w-5 h-5 text-yellow-400"
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
              <span class="sr-only">Modo claro</span>
            {:else}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                ></path>
              </svg>
              <span class="sr-only">Modo oscuro</span>
            {/if}
            <!-- Tooltip -->
            <span
              class="hidden md:block pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2.5 py-1.5 rounded-md text-xs font-medium bg-popover/90 backdrop-blur border border-border text-popover-foreground shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-top"
            >
              Activar modo {darkMode ? "claro" : "oscuro"}
            </span>
          </button>
        </div>
      </div>

      <!-- Mobile Menu Button -->
      <button
        onclick={() => (isMenuOpen = !isMenuOpen)}
        class="md:hidden p-2"
        aria-label="Toggle menu"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button>
    </div>

    <!-- Mobile Navigation -->
    {#if isMenuOpen}
      <div
        class="md:hidden mt-4 pb-4 border-t border-border animate-mobile-menu-enter origin-top"
        role="menu"
        aria-label="Mobile navigation"
      >
        <div class="flex flex-col space-y-4 pt-4">
          <button
            onclick={() => scrollToSection("about")}
            class="text-left nav-link"
            aria-label="Sobre mí"
          >
            Sobre mí
          </button>
          <button
            onclick={() => scrollToSection("skills")}
            class="text-left nav-link"
            aria-label="Habilidades"
          >
            Habilidades
          </button>
          <button
            onclick={() => scrollToSection("projects")}
            class="text-left nav-link"
            aria-label="Proyectos"
          >
            Proyectos
          </button>
          <button
            onclick={() => scrollToSection("contact")}
            class="text-left nav-link"
            aria-label="Contacto"
          >
            Contacto
          </button>
          <div class="flex items-center space-x-4">
            <button
              onclick={toggleAnimations}
              class="flex items-center space-x-2 text-left text-muted-foreground hover:text-primary transition-colors"
              aria-label={animationsEnabled ? "Desactivar animaciones" : "Activar animaciones"}
            >
              {#if animationsEnabled}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 12c2.5 0 2.5-4 5-4s2.5 4 5 4 2.5-4 5-4 2.5 4 5 4"
                  ></path>
                </svg>
                <span>Animaciones: ON</span>
              {:else}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 12c2.5 0 2.5-4 5-4s2.5 4 5 4 2.5-4 5-4 2.5 4 5 4M3 18c2.5 0 2.5-4 5-4"
                  ></path>
                </svg>
                <span>Animaciones: OFF</span>
              {/if}
            </button>
            <button
              onclick={toggleTheme}
              class="flex items-center space-x-2 text-left text-muted-foreground hover:text-primary transition-colors"
              aria-label="Toggle theme"
            >
              {#if darkMode}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  ></path>
                </svg>
                <span>Modo claro</span>
              {:else}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  ></path>
                </svg>
                <span>Modo oscuro</span>
              {/if}
            </button>
          </div>
        </div>
      </div>
    {/if}
  </nav>
</header>
