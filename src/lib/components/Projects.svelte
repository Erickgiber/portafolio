<script lang="ts">
  import { reveal } from "../actions/reveal";
  import Icon from "@iconify/svelte";
  import { projects } from "../data/projects";

  const revealBaseDelay = 50;
  const revealStepDelay = 100;
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
        {#each projects as project, i (project.id)}
          <div
            class="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
            use:reveal={{
              delay: revealBaseDelay + i * revealStepDelay,
              replayOnEnable: true,
            }}
          >
            <div
              class={`h-48 bg-gradient-to-br ${project.gradientClass} flex items-center justify-center`}
            >
              <Icon icon={project.icon} class="w-16 h-16 text-white" />
            </div>
            <div class="p-6">
              <h3 class="text-xl font-semibold mb-2">{project.title}</h3>
              <p class="text-muted-foreground mb-4">{project.description}</p>
              <div class="flex flex-wrap gap-2 mb-4">
                {#each project.tech as t (t)}
                  <span class="px-2 py-1 bg-muted text-xs rounded">{t}</span>
                {/each}
              </div>
              <div class="flex space-x-3">
                {#each project.links as link (link.href)}
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    class={`flex items-center space-x-1 transition-colors ${
                      link.variant === "primary"
                        ? "text-primary hover:text-primary/80"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      ></path>
                    </svg>
                    <span class="text-sm">{link.label}</span>
                  </a>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>
