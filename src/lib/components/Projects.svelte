<script lang="ts">
  import { reveal } from '../actions/reveal';
</script>
<section id="projects" class="py-16 px-4 bg-muted/30" use:reveal={{ direction: 'up', distance: 40 }}>
  <div class="container mx-auto">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">Proyectos Destacados</h2>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Project 1 -->
  <div class="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group" use:reveal={{ delay: 50 }}>
          <div class="h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-2">E-Commerce Platform</h3>
            <p class="text-muted-foreground mb-4">
              Plataforma completa de comercio electrónico con carrito de compras, pagos y gestión de inventario.
            </p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span class="px-2 py-1 bg-muted text-xs rounded">React</span>
              <span class="px-2 py-1 bg-muted text-xs rounded">Node.js</span>
              <span class="px-2 py-1 bg-muted text-xs rounded">PostgreSQL</span>
            </div>
            <div class="flex space-x-3">
              <button class="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span class="text-sm">Demo</span>
              </button>
              <button class="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span class="text-sm">Código</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Project 2 -->
  <div class="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group" use:reveal={{ delay: 150 }}>
          <div class="h-48 bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
            <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-2">Dashboard Analytics</h3>
            <p class="text-muted-foreground mb-4">
              Dashboard interactivo para visualización de datos con gráficos en tiempo real y métricas clave.
            </p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span class="px-2 py-1 bg-muted text-xs rounded">Vue.js</span>
              <span class="px-2 py-1 bg-muted text-xs rounded">Chart.js</span>
              <span class="px-2 py-1 bg-muted text-xs rounded">Express</span>
            </div>
            <div class="flex space-x-3">
              <button class="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span class="text-sm">Demo</span>
              </button>
              <button class="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span class="text-sm">Código</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Project 3 -->
  <div class="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group" use:reveal={{ delay: 250 }}>
          <div class="h-48 bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-2">Task Manager App</h3>
            <p class="text-muted-foreground mb-4">
              Aplicación móvil para gestión de tareas con sincronización en tiempo real y colaboración en equipo.
            </p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span class="px-2 py-1 bg-muted text-xs rounded">Svelte</span>
              <span class="px-2 py-1 bg-muted text-xs rounded">Firebase</span>
              <span class="px-2 py-1 bg-muted text-xs rounded">PWA</span>
            </div>
            <div class="flex space-x-3">
              <button class="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span class="text-sm">Demo</span>
              </button>
              <button class="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span class="text-sm">Código</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
