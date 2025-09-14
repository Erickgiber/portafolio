<script lang="ts">
  import { reveal } from '../actions/reveal';
</script>
<section id="skills" class="py-16 px-4" use:reveal={{ direction: 'up', distance: 40 }}>
  <div class="container mx-auto">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">Habilidades Técnicas</h2>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Frontend -->
  <div class="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow" use:reveal={{ delay: 50 }}>
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold">Frontend</h3>
          </div>
          <div class="space-y-3">
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-muted text-sm rounded-full">React</span>
              <span class="px-3 py-1 bg-muted text-sm rounded-full">Svelte</span>
              <span class="px-3 py-1 bg-muted text-sm rounded-full">Vue.js</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-muted text-sm rounded-full">TypeScript</span>
              <span class="px-3 py-1 bg-muted text-sm rounded-full">JavaScript</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-muted text-sm rounded-full">Tailwind CSS</span>
              <span class="px-3 py-1 bg-muted text-sm rounded-full">CSS3</span>
            </div>
          </div>
        </div>

        <!-- Backend -->
  <div class="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow" use:reveal={{ delay: 150 }}>
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold">Backend</h3>
          </div>
          <div class="space-y-3">
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-muted text-sm rounded-full">Node.js</span>
              <span class="px-3 py-1 bg-muted text-sm rounded-full">Express</span>
              <span class="px-3 py-1 bg-muted text-sm rounded-full">Python</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-muted text-sm rounded-full">PostgreSQL</span>
              <span class="px-3 py-1 bg-muted text-sm rounded-full">MongoDB</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-muted text-sm rounded-full">REST APIs</span>
              <span class="px-3 py-1 bg-muted text-sm rounded-full">GraphQL</span>
            </div>
          </div>
        </div>

        <!-- Tools & Others -->
  <div class="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow" use:reveal={{ delay: 250 }}>
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold">Herramientas</h3>
          </div>
          <div class="space-y-3">
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-muted text-sm rounded-full">Git</span>
              <span class="px-3 py-1 bg-muted text-sm rounded-full">Docker</span>
              <span class="px-3 py-1 bg-muted text-sm rounded-full">AWS</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-muted text-sm rounded-full">Figma</span>
              <span class="px-3 py-1 bg-muted text-sm rounded-full">Postman</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-muted text-sm rounded-full">Linux</span>
              <span class="px-3 py-1 bg-muted text-sm rounded-full">VS Code</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
