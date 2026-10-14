<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import GamepadGlyph from "./GamepadGlyph.svelte";
  import type { Control } from "../gamepad/controls";
  import type { GlyphControl } from "../gamepad/glyphs";
  import { PRESS_EVENT, actionVerb, type ActionVerb } from "../gamepad/navigation";
  import { glyphForPress } from "../gamepad/press";
  import { gamepadStore } from "../stores/gamepad.svelte";
  import { gamepadLayers } from "../stores/gamepadLayers.svelte";
  import { gamepadPrompt } from "../stores/gamepadPrompt.svelte";
  import { i18nStore } from "../stores/i18n.svelte";

  type Entry = { key: string; controls: GlyphControl[]; label: string };

  const PRESS_FLASH_MS = 320;

  let verb = $state<ActionVerb>("press");
  let pressed = $state<Partial<Record<GlyphControl, number>>>({});

  const legend = $derived(i18nStore.t.gamepad.legend);
  const entries = $derived.by(() => {
    const top = gamepadLayers.layers.at(-1);
    const list: Entry[] = [{ key: "move", controls: ["dpad"], label: legend.move }];
    list.push(
      top?.stick
        ? { key: "stick", controls: ["pan"], label: top.stickLabel?.() ?? legend.pan }
        : { key: "stick", controls: ["stick"], label: legend.scroll }
    );
    const shoulders = gamepadLayers.action("shoulders");
    if (shoulders) {
      list.push({ key: "shoulders", controls: ["previous", "next"], label: shoulders.label() });
    }
    if (!gamepadPrompt.visible) {
      list.push({ key: "confirm", controls: ["confirm"], label: legend[verb] });
    }
    (["back", "west", "north"] as const).forEach((name) => {
      const action = gamepadLayers.action(name);
      if (action) {
        list.push({ key: name, controls: [name], label: action.label() });
      }
    });
    return list;
  });

  onMount(() => {
    const track = () => {
      verb = actionVerb(document.activeElement);
    };
    const flash = (event: Event) => {
      const control = glyphForPress((event as CustomEvent<Control>).detail);
      const stamp = performance.now();
      pressed = { ...pressed, [control]: stamp };
      setTimeout(() => {
        if (pressed[control] === stamp) {
          const { [control]: _, ...rest } = pressed;
          pressed = rest;
        }
      }, PRESS_FLASH_MS);
    };
    document.addEventListener("focusin", track);
    document.addEventListener("focusout", track);
    window.addEventListener(PRESS_EVENT, flash);
    return () => {
      document.removeEventListener("focusin", track);
      document.removeEventListener("focusout", track);
      window.removeEventListener(PRESS_EVENT, flash);
    };
  });
</script>

{#if gamepadStore.connected}
  <aside
    class="fixed z-[95] bottom-3 inset-x-3 sm:inset-x-auto sm:right-4 sm:bottom-4 pointer-events-none"
    aria-label={i18nStore.t.gamepad.legendLabel}
    data-testid="gamepad-legend"
    transition:fly={{ y: 24, duration: 260 }}
  >
    <ul
      class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl px-4 py-2 bg-slate-950/85 backdrop-blur-xl ring-1 ring-white/10 shadow-2xl shadow-black/40 text-xs font-semibold text-white"
    >
      {#each entries as entry (entry.key)}
        <li class="flex items-center gap-1.5" data-legend={entry.key}>
          {#each entry.controls as control (control)}
            <span class="legend-glyph" class:is-pressed={pressed[control] !== undefined}>
              <GamepadGlyph brand={gamepadStore.brand} {control} />
            </span>
          {/each}
          <span class="text-white/90">{entry.label}</span>
        </li>
      {/each}
    </ul>
  </aside>
{/if}

<style>
  .legend-glyph {
    display: inline-flex;
    border-radius: 9999px;
    transition: transform 0.18s cubic-bezier(0.2, 1.4, 0.4, 1);
  }

  .legend-glyph.is-pressed {
    transform: scale(0.8);
    filter: brightness(1.35) drop-shadow(0 0 6px rgb(255 255 255 / 0.55));
  }
</style>
