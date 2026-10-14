<script lang="ts">
  import type { GamepadBrand } from "../gamepad/brand";
  import { glyphFor, type GlyphControl } from "../gamepad/glyphs";

  let {
    brand,
    control,
    size = "md",
  }: { brand: GamepadBrand; control: GlyphControl; size?: "md" | "lg" } = $props();

  const glyph = $derived(glyphFor(brand, control));
</script>

<span
  class="relative inline-block shrink-0 {size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'}"
  data-glyph="{brand}:{control}"
  data-glyph-name={glyph.name}
  title={glyph.name}
>
  <img
    src={glyph.src}
    alt=""
    width="64"
    height="64"
    draggable="false"
    class="absolute left-1/2 top-1/2 w-[133.34%] h-[133.34%] max-w-none -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
  />
</span>
