<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import Icon from "@iconify/svelte";
  import GamepadLegend from "./GamepadLegend.svelte";
  import GamepadPrompt from "./GamepadPrompt.svelte";
  import { allGlyphSources } from "../gamepad/glyphs";
  import VirtualKeyboard from "./VirtualKeyboard.svelte";
  import { nextSectionTop, startGamepadNavigation } from "../gamepad/navigation";
  import { scrollPageBy, scrollPageTo } from "../scroll/pageScroll";
  import { gamepadStore } from "../stores/gamepad.svelte";
  import { gamepadLayers } from "../stores/gamepadLayers.svelte";
  import { i18nStore } from "../stores/i18n.svelte";
  import { router } from "../stores/router.svelte";
  import { themeStore } from "../stores/theme.svelte";
  import { virtualKeyboard } from "../stores/virtualKeyboard.svelte";

  const NOTICE_DURATION_MS = 2800;

  let notice = $state<{ id: number; connected: boolean } | null>(null);
  let lastConnected: boolean | null = null;
  let noticeTimer: ReturnType<typeof setTimeout> | undefined;

  const legend = $derived(i18nStore.t.gamepad.legend);

  function isProductPage(): boolean {
    return router.route === "rumbo";
  }

  const noticeText = $derived(
    notice?.connected
      ? i18nStore.t.gamepad.connected[gamepadStore.brand]
      : i18nStore.t.gamepad.disconnected
  );

  $effect(() => {
    const connected = gamepadStore.connected;
    if (lastConnected === connected || (lastConnected === null && !connected)) {
      lastConnected = connected;
      return;
    }

    lastConnected = connected;
    if (connected) {
      allGlyphSources().forEach((source) => {
        const preload = new Image();
        preload.src = source;
      });
    }
    notice = { id: Date.now(), connected };
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => (notice = null), NOTICE_DURATION_MS);
  });

  onMount(() => {
    const releaseNavigation = startGamepadNavigation({
      scrollBy: scrollPageBy,
      editText: (field) => virtualKeyboard.open(field),
    });
    const releaseBase = gamepadLayers.push({
      actions: {
        back: {
          label: () => (isProductPage() ? legend.portfolio : legend.top),
          run: () => (isProductPage() ? router.back("/") : scrollPageTo(0)),
        },
        west: { label: () => legend.language, run: () => i18nStore.toggleLocale() },
        north: { label: () => legend.theme, run: () => themeStore.toggleTheme() },
        shoulders: {
          label: () => legend.sections,
          run: (direction) => {
            const top = nextSectionTop(direction);
            if (top !== null) {
              scrollPageTo(top);
            }
          },
        },
      },
    });
    return () => {
      clearTimeout(noticeTimer);
      releaseBase();
      releaseNavigation();
    };
  });
</script>

{#if notice}
  {#key notice.id}
    <div
      class="fixed z-[96] top-20 left-1/2 -translate-x-1/2 pointer-events-none"
      role="status"
      data-testid="gamepad-notice"
      transition:fly={{ y: -24, duration: 280 }}
    >
      <div
        class="flex items-center gap-3 rounded-2xl px-4 py-3 bg-background/90 dark:bg-background/80 backdrop-blur-xl ring-1 ring-black/[0.06] dark:ring-white/[0.1] shadow-xl shadow-black/20 text-sm font-semibold"
      >
        <span
          class="grid place-items-center w-9 h-9 rounded-xl {notice.connected
            ? 'bg-gradient-to-br from-sky-500 to-violet-600 text-white'
            : 'bg-muted text-muted-foreground'}"
        >
          <Icon icon={notice.connected ? "mdi:controller" : "mdi:controller-off"} class="w-5 h-5" />
        </span>
        {noticeText}
      </div>
    </div>
  {/key}
{/if}

<GamepadPrompt />
<GamepadLegend />
<VirtualKeyboard />
