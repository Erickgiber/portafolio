<script lang="ts">
  let { darkMode, toggleTheme } = $props();
  let isMenuOpen = $state(false);

  function scrollToSection(sectionId : string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    isMenuOpen = false;
  }
</script>

<header class="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
  <nav class="container mx-auto px-4 py-4">
    <div class="flex items-center justify-between">
      <div class="text-2xl font-bold text-primary">ER</div>
      
      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center space-x-8">
        <button onclick={() => scrollToSection('about')} class="text-muted-foreground hover:text-primary transition-colors" aria-label="Sobre mí">
          Sobre mí
        </button>
        <button onclick={() => scrollToSection('skills')} class="text-muted-foreground hover:text-primary transition-colors" aria-label="Habilidades">
          Habilidades
        </button>
        <button onclick={() => scrollToSection('projects')} class="text-muted-foreground hover:text-primary transition-colors" aria-label="Proyectos">
          Proyectos
        </button>
        <button onclick={() => scrollToSection('contact')} class="text-muted-foreground hover:text-primary transition-colors" aria-label="Contacto">
          Contacto
        </button>
        
        <!-- Theme Toggle -->
        <button onclick={toggleTheme} class="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Toggle theme">
          {#if darkMode}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          {/if}
        </button>
      </div>

      <!-- Mobile Menu Button -->
      <button onclick={() => isMenuOpen = !isMenuOpen} class="md:hidden p-2" aria-label="Toggle menu">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- Mobile Navigation -->
    {#if isMenuOpen}
      <div class="md:hidden mt-4 pb-4 border-t border-border">
        <div class="flex flex-col space-y-4 pt-4">
          <button onclick={() => scrollToSection('about')} class="text-left text-muted-foreground hover:text-primary transition-colors" aria-label="Sobre mí">
            Sobre mí
          </button>
          <button onclick={() => scrollToSection('skills')} class="text-left text-muted-foreground hover:text-primary transition-colors" aria-label="Habilidades">
            Habilidades
          </button>
          <button onclick={() => scrollToSection('projects')} class="text-left text-muted-foreground hover:text-primary transition-colors" aria-label="Proyectos">
            Proyectos
          </button>
          <button onclick={() => scrollToSection('contact')} class="text-left text-muted-foreground hover:text-primary transition-colors" aria-label="Contacto">
            Contacto
          </button>
          <button onclick={toggleTheme} class="flex items-center space-x-2 text-left text-muted-foreground hover:text-primary transition-colors" aria-label="Toggle theme">
            {#if darkMode}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Modo claro</span>
            {:else}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span>Modo oscuro</span>
            {/if}
          </button>
        </div>
      </div>
    {/if}
  </nav>
</header>
