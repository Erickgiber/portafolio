<script lang="ts">
  import { reveal } from "../actions/reveal";
  import type { SkillCategory } from "../data/skills";
  import { getCategoryDelay } from "../data/skills";
  import { i18nStore } from "../stores/i18n.svelte";

  let {
    category,
    index,
    spanFull = false,
  }: {
    category: SkillCategory;
    index: number;
    spanFull?: boolean;
  } = $props();

  let t = $derived(i18nStore.t);
  let categoryTitle = $derived(
    (t.skills.categories as Record<string, string>)[category.key] || category.title
  );
</script>

<div
  class={`bg-card/90 dark:bg-card/60 backdrop-blur-md border border-border/50 dark:border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-black/30 hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col ${spanFull ? "lg:col-span-3 md:col-span-2" : ""}`}
  use:reveal={{ delay: getCategoryDelay(index), replayOnEnable: true }}
>
  <div class="flex items-center space-x-3.5 mb-5">
    <div
      class="w-11 h-11 rounded-xl flex items-center justify-center bg-primary/10 text-primary dark:bg-primary/15"
    >
      <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={category.icon}
        ></path>
      </svg>
    </div>
    <h3 class="text-lg sm:text-xl font-semibold tracking-tight">{categoryTitle}</h3>
  </div>
  <div class="space-y-2.5">
    {#each category.groups as row}
      <div class="flex flex-wrap gap-2">
        {#each row as badge}
          <span
            class="px-3 py-1 text-xs sm:text-sm font-medium rounded-full bg-muted/80 dark:bg-muted/40 text-foreground/90 border border-border/40 dark:border-white/[0.06] hover:border-primary/40 hover:text-primary transition-all duration-200"
            >{badge}</span
          >
        {/each}
      </div>
    {/each}
  </div>
</div>
