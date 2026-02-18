<script lang="ts">
  import { reveal } from "../actions/reveal";
  import Icon from "@iconify/svelte";
</script>

<section
  id="projects"
  class="relative py-16 px-4 bg-muted/30"
  use:reveal={{ direction: "up", distance: 40, replayOnEnable: true }}
>
  <div class="container mx-auto">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">Proyectos Destacados</h2>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Project 1 -->
        <div
          class="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
          use:reveal={{ delay: 50, replayOnEnable: true }}
        >
          <div
            class="h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
          >
            <Icon icon="mdi:video" class="w-16 h-16 text-white" />
          </div>
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-2">Video Downloader by Link</h3>
            <p class="text-muted-foreground mb-4">
              Aplicación web en Next.js para previsualizar enlaces de video y descargar archivos
              cuando es posible (incluye soporte para YouTube mediante ytdl-core).
            </p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span class="px-2 py-1 bg-muted text-xs rounded">Next.js</span>
              <span class="px-2 py-1 bg-muted text-xs rounded">TypeScript</span>
              <span class="px-2 py-1 bg-muted text-xs rounded">ytdl-core</span>
            </div>
            <div class="flex space-x-3">
              <a
                href="https://video-downloader-by-link.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  ></path>
                </svg>
                <span class="text-sm">Demo</span>
              </a>
              <a
                href="https://github.com/Erickgiber/video-downloader-by-link"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                  ></path>
                </svg>
                <span class="text-sm">Código</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Project 2 -->
        <div
          class="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
          use:reveal={{ delay: 150, replayOnEnable: true }}
        >
          <div
            class="h-48 bg-gradient-to-br from-secondary to-accent flex items-center justify-center"
          >
            <Icon icon="mdi:currency-usd" class="w-16 h-16 text-white" />
          </div>
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-2">Debts my clients</h3>
            <p class="text-muted-foreground mb-4">
              Deudas & Ventas: PWA instalable para gestionar ventas y deudas de clientes, con datos
              guardados localmente (sin servidor) y versión Android (APK).
            </p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span class="px-2 py-1 bg-muted text-xs rounded">PWA</span>
              <span class="px-2 py-1 bg-muted text-xs rounded">Offline</span>
              <span class="px-2 py-1 bg-muted text-xs rounded">Local Storage</span>
            </div>
            <div class="flex space-x-3">
              <a
                href="https://debts-my-clients.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  ></path>
                </svg>
                <span class="text-sm">Demo</span>
              </a>
              <a
                href="https://github.com/Erickgiber/debts-my-clients"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                  ></path>
                </svg>
                <span class="text-sm">Código</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Project 3 -->
        <div
          class="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
          use:reveal={{ delay: 250, replayOnEnable: true }}
        >
          <div
            class="h-48 bg-gradient-to-br from-accent to-primary flex items-center justify-center"
          >
            <Icon icon="mdi:music-note" class="w-16 h-16 text-white" />
          </div>
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-2">AudioGiber JS</h3>
            <p class="text-muted-foreground mb-4">
              Librería en JavaScript para crear fácilmente un contexto de reproductor de audio y
              gestionar pistas dentro de tu aplicación.
            </p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span class="px-2 py-1 bg-muted text-xs rounded">JavaScript</span>
              <span class="px-2 py-1 bg-muted text-xs rounded">Web Audio</span>
              <span class="px-2 py-1 bg-muted text-xs rounded">Library</span>
            </div>
            <div class="flex space-x-3">
              <a
                href="https://audio-giber-website.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  ></path>
                </svg>
                <span class="text-sm">Demo</span>
              </a>
              <a
                href="https://github.com/Erickgiber/audio-giber-website"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                  ></path>
                </svg>
                <span class="text-sm">Código</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
