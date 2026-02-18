<script lang="ts">
  import { reveal } from "../actions/reveal";
  import type { SkillCategory } from "../data/skills";
  import { getCategoryDelay } from "../data/skills";

  export let category: SkillCategory;
  export let index: number; // for delay
  export let spanFull = false; // when last leftover should span
</script>

<div
  class={`bg-card border shadow-sm shadow-black/5 border-border rounded-lg p-6 hover:shadow-lg hover:shadow-black/10 transition-shadow duration-300 ease-out flex flex-col ${spanFull ? "lg:col-span-3 md:col-span-2" : ""}`}
  use:reveal={{ delay: getCategoryDelay(index), replayOnEnable: true }}
>
  <div class="flex items-center space-x-3 mb-4">
    <div class={`w-12 h-12 rounded-lg flex items-center justify-center bg-${category.color}/10`}>
      <svg
        class={`w-6 h-6 text-${category.color}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={category.icon}
        ></path>
      </svg>
    </div>
    <h3 class="text-xl font-semibold">{category.title}</h3>
  </div>
  <div class="space-y-3">
    {#each category.groups as row}
      <div class="flex flex-wrap gap-2">
        {#each row as badge}
          <span class="badge px-3 py-1 text-sm rounded-full">{badge}</span>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  :global(html.dark .badge) {
    background-color: rgba(0, 0, 0, 0.1);
  }

  :global(html:not(.dark) .badge) {
    background-color: rgba(0, 0, 0, 0.05);
  }
</style>
