<script lang="ts">
  import { reveal } from "../actions/reveal";
  import { skillCategories } from "../data/skills";
  import SkillCard from "./SkillCard.svelte";

  const total = skillCategories.length;
  // Con la categoría nueva (Testing) ahora son 4: mejor grid consistente en 2 columnas en md y 4 en lg.
  // Si en el futuro vuelve a haber un sobrante (e.g., 5 o 7) podríamos reactivar lógica de spanning.
  const useFourCols = total === 4; // condición actual
</script>

<section
  id="skills"
  class="relative py-16 px-4"
  use:reveal={{ direction: "up", distance: 40, replayOnEnable: true }}
>
  <div class="container mx-auto">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">
        Habilidades Técnicas
      </h2>

      <div
        class={`grid gap-8 ${useFourCols ? "md:grid-cols-2" : "md:grid-cols-2"}`}
      >
        {#each skillCategories as category, i (category.key)}
          <SkillCard {category} index={i} spanFull={false} />
        {/each}
      </div>
    </div>
  </div>
</section>
