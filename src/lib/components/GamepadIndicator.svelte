<script lang="ts">
  import Icon from "@iconify/svelte";
  import type { GamepadBrand } from "../gamepad/brand";
  import { gamepadStore } from "../stores/gamepad.svelte";
  import { i18nStore } from "../stores/i18n.svelte";

  const ICONS: Record<GamepadBrand, string> = {
    xbox: "mdi:microsoft-xbox-controller",
    playstation: "mdi:sony-playstation",
    nintendo: "mdi:nintendo-switch",
    generic: "mdi:controller",
  };

  const label = $derived(i18nStore.t.gamepad.connected[gamepadStore.brand]);
</script>

{#if gamepadStore.connected}
  <div
    class="group relative"
    role="status"
    data-testid="gamepad-indicator"
    data-brand={gamepadStore.brand}
  >
    <span class="gamepad-pop flex items-center gap-1.5 h-8 px-2.5 rounded-full text-primary">
      <Icon icon={ICONS[gamepadStore.brand]} class="w-5 h-5" aria-hidden="true" />
      <span class="relative flex w-2 h-2" aria-hidden="true">
        <span class="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
        <span class="relative w-2 h-2 rounded-full bg-emerald-500"></span>
      </span>
      <span class="sr-only">{label}</span>
    </span>
    <span
      class="hidden md:block pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-popover/95 backdrop-blur border border-border/40 text-popover-foreground shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 origin-top whitespace-nowrap z-50"
      aria-hidden="true"
    >
      {label}
    </span>
  </div>
{/if}

<style>
  .gamepad-pop {
    animation: gamepad-pop 0.5s cubic-bezier(0.2, 1.4, 0.4, 1) both;
  }

  @keyframes gamepad-pop {
    from {
      opacity: 0;
      transform: scale(0.3);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .gamepad-pop {
      animation: none;
    }
  }
</style>
