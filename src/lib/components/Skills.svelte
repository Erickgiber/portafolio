<script lang="ts">
  import { reveal } from "../actions/reveal";
  import { skillCategories } from "../data/skills";
  import SkillCard from "./SkillCard.svelte";
  import { i18nStore } from "../stores/i18n.svelte";

  let t = $derived(i18nStore.t);
</script>

<section
  id="skills"
  class="relative py-12 sm:py-16 px-4 scroll-mt-16"
  use:reveal={{ direction: "up", distance: 40, replayOnEnable: true }}
>
  <div class="container mx-auto">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.skills.title}</h2>
        <p class="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          {t.skills.subtitle}
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-6 sm:gap-8">
        {#each skillCategories as category, i (category.key)}
          <SkillCard {category} index={i} spanFull={false} />
        {/each}
      </div>
    </div>
  </div>
</section>
