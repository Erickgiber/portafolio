<script lang="ts">
  import { reveal } from "../actions/reveal";
  import Icon from "@iconify/svelte";
  import { projects } from "../data/projects";
  import { i18nStore } from "../stores/i18n.svelte";

  const revealBaseDelay = 40;
  const revealStepDelay = 80;

  let t = $derived(i18nStore.t);

  function getLinkLabel(label: string): string {
    if (label === "Demo") return t.projects.btnDemo;
    if (label === "Código" || label === "Code") return t.projects.btnCode;
    if (label === "Google Play") return t.projects.btnStore;
    return label;
  }
</script>

<section
  id="projects"
  class="relative py-12 sm:py-16 px-4 scroll-mt-16"
  use:reveal={{ direction: "up", distance: 30, replayOnEnable: true }}
>
  <div class="container mx-auto">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.projects.title}</h2>
        <p class="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          {t.projects.subtitle}
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {#each projects as project, i (project.id)}
          {@const projectInfo = t.projects.items[project.id]}
          {@const title = projectInfo?.title || project.title}
          {@const description = projectInfo?.description || project.description}
          <div
            class="bg-card/90 dark:bg-card/60 backdrop-blur-md border border-border/50 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-black/40 hover:-translate-y-1.5 transition-all duration-300 ease-out group flex flex-col"
            use:reveal={{
              delay: revealBaseDelay + i * revealStepDelay,
              replayOnEnable: true,
            }}
          >
            <div
              class={`h-44 sm:h-48 bg-gradient-to-br ${project.gradientClass} flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500`}
            >
              <div class="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
              <Icon
                icon={project.icon}
                class="w-16 h-16 text-white drop-shadow-md group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div class="p-6 flex flex-col flex-1">
              <h3
                class="text-xl font-semibold tracking-tight mb-2 group-hover:text-primary transition-colors"
              >
                {title}
              </h3>
              <p class="text-muted-foreground text-sm leading-relaxed mb-5">
                {description}
              </p>
              <div class="flex flex-wrap gap-1.5 mb-5">
                {#each project.tech as techBadge, idx (idx)}
                  <span
                    class="px-2.5 py-0.5 bg-muted/70 dark:bg-muted/40 text-muted-foreground text-xs font-medium rounded-full"
                  >
                    {techBadge}
                  </span>
                {/each}
              </div>
              <div class="flex items-center space-x-3 mt-auto pt-2">
                {#each project.links as link, idx (idx)}
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    class={`inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                      link.variant === "primary"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                        : "bg-muted/60 dark:bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      ></path>
                    </svg>
                    <span>{getLinkLabel(link.label)}</span>
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
