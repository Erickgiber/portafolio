<script lang="ts">
  import { onMount } from "svelte";
  import GamepadGlyph from "./GamepadGlyph.svelte";
  import type { Control } from "../gamepad/controls";
  import { GAMEPAD_INPUT, PRESS_EVENT, actionVerb } from "../gamepad/navigation";
  import { gamepadStore } from "../stores/gamepad.svelte";
  import { gamepadPrompt } from "../stores/gamepadPrompt.svelte";
  import { i18nStore } from "../stores/i18n.svelte";

  type Point = { x: number; y: number };
  type Side = "left" | "right";

  const GAP_PX = 14;
  const EDGE_PX = 8;
  const FALLBACK_WIDTH_PX = 132;
  const VERTICAL_MARGIN_PX = 24;
  const GLIDE_MS = 320;
  const PRESS_SCALE = 0.95;
  const PRESS_FEEDBACK_MS = 220;

  let target = $state.raw<HTMLElement | null>(null);
  let gamepadInput = $state(false);
  let anchor = $state<HTMLDivElement>();
  let side = $state<Side>("right");
  let onScreen = $state(false);
  let appearKey = $state(0);
  let pressCount = $state(0);

  const legend = $derived(i18nStore.t.gamepad.legend);
  const label = $derived(legend[actionVerb(target)]);
  const visible = $derived(gamepadStore.connected && gamepadInput && target !== null && onScreen);

  $effect(() => {
    gamepadPrompt.visible = visible;
  });

  function easeOutCubic(value: number): number {
    return 1 - Math.pow(1 - value, 3);
  }

  function desiredPlacement(element: HTMLElement, width: number): (Point & { side: Side }) | null {
    const rect = element.getBoundingClientRect();
    if (
      !element.isConnected ||
      rect.width === 0 ||
      rect.bottom < 0 ||
      rect.top > window.innerHeight
    ) {
      return null;
    }

    let placeSide: Side = "right";
    let x = rect.right + GAP_PX;
    if (x + width > window.innerWidth - EDGE_PX) {
      placeSide = "left";
      x = rect.left - GAP_PX - width;
    }
    if (x < EDGE_PX) {
      placeSide = "right";
      x = Math.max(EDGE_PX, Math.min(rect.right - width, window.innerWidth - EDGE_PX - width));
    }
    const y = Math.min(
      window.innerHeight - VERTICAL_MARGIN_PX,
      Math.max(VERTICAL_MARGIN_PX, rect.top + rect.height / 2)
    );
    return { x, y, side: placeSide };
  }

  $effect(() => {
    if (!gamepadStore.connected) {
      onScreen = false;
      return;
    }

    let frame = 0;
    let current: Point | null = null;
    let glide: { from: Point; start: number } | null = null;
    let lastTarget: HTMLElement | null = null;
    let lastAnchor: HTMLDivElement | undefined;

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const element = target;
      const desired = element
        ? desiredPlacement(element, anchor?.offsetWidth ?? FALLBACK_WIDTH_PX)
        : null;
      const shown = desired !== null;
      if (onScreen !== shown) {
        onScreen = shown;
      }
      if (!desired) {
        current = null;
        glide = null;
        return;
      }

      if (desired.side !== side) {
        side = desired.side;
      }

      if (element !== lastTarget) {
        glide = current && lastAnchor === anchor ? { from: current, start: now } : null;
        lastTarget = element;
        appearKey += 1;
      }

      if (glide) {
        const progress = Math.min(1, (now - glide.start) / GLIDE_MS);
        const eased = easeOutCubic(progress);
        current = {
          x: glide.from.x + (desired.x - glide.from.x) * eased,
          y: glide.from.y + (desired.y - glide.from.y) * eased,
        };
        if (progress >= 1) {
          glide = null;
        }
      } else {
        current = { x: desired.x, y: desired.y };
      }

      lastAnchor = anchor;
      if (anchor) {
        anchor.style.transform = `translate3d(${current.x.toFixed(1)}px, ${current.y.toFixed(1)}px, 0)`;
      }
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  });

  onMount(() => {
    const root = document.documentElement;
    const readInput = () => {
      gamepadInput = root.dataset.input === GAMEPAD_INPUT;
    };
    const observer = new MutationObserver(readInput);
    observer.observe(root, { attributes: true, attributeFilter: ["data-input"] });
    readInput();

    const trackFocus = () => {
      const active = document.activeElement;
      target = active instanceof HTMLElement && active !== document.body ? active : null;
    };
    const clearFocus = (event: FocusEvent) => {
      if (!event.relatedTarget) {
        target = null;
      }
    };
    const handlePress = (event: Event) => {
      if ((event as CustomEvent<Control>).detail !== "confirm") {
        return;
      }

      pressCount += 1;
      target?.animate([{ scale: "1" }, { scale: String(PRESS_SCALE) }, { scale: "1" }], {
        duration: PRESS_FEEDBACK_MS,
        easing: "ease-out",
      });
    };

    trackFocus();
    document.addEventListener("focusin", trackFocus);
    document.addEventListener("focusout", clearFocus);
    window.addEventListener(PRESS_EVENT, handlePress);
    return () => {
      gamepadPrompt.visible = false;
      observer.disconnect();
      document.removeEventListener("focusin", trackFocus);
      document.removeEventListener("focusout", clearFocus);
      window.removeEventListener(PRESS_EVENT, handlePress);
    };
  });
</script>

{#if visible}
  <div
    bind:this={anchor}
    class="fixed left-0 top-0 z-[97] pointer-events-none will-change-transform"
    data-testid="gamepad-prompt"
    data-side={side}
    aria-hidden="true"
  >
    {#key appearKey}
      <div class="prompt-pop" class:from-left={side === "left"}>
        <div class="prompt-float">
          <div
            class="-translate-y-1/2 flex items-center gap-2 rounded-full pl-1 pr-3.5 py-1 bg-slate-950/90 backdrop-blur-md ring-1 ring-white/15 shadow-xl shadow-black/40 text-xs font-bold tracking-wide text-white whitespace-nowrap"
          >
            {#key pressCount}
              <span class="prompt-glyph" class:is-pressed={pressCount > 0}>
                <GamepadGlyph brand={gamepadStore.brand} control="confirm" size="lg" />
                <span class="prompt-ring"></span>
              </span>
            {/key}
            <span data-testid="gamepad-prompt-label">{label}</span>
          </div>
        </div>
      </div>
    {/key}
  </div>
{/if}

<style>
  .prompt-pop {
    animation: prompt-pop 0.38s cubic-bezier(0.2, 1.4, 0.4, 1) both;
    transform-origin: left center;
  }

  .prompt-pop.from-left {
    animation-name: prompt-pop-left;
    transform-origin: right center;
  }

  .prompt-float {
    animation: prompt-float 2.4s ease-in-out 0.4s infinite;
  }

  .prompt-glyph {
    position: relative;
    display: inline-flex;
    border-radius: 9999px;
    animation: prompt-glow 1.8s ease-in-out infinite;
  }

  .prompt-ring {
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    border: 2px solid rgb(255 255 255 / 0.6);
    pointer-events: none;
    animation: prompt-ring 1.8s ease-out infinite;
  }

  .prompt-glyph.is-pressed {
    animation: prompt-press 0.38s cubic-bezier(0.2, 1.4, 0.4, 1);
  }

  .prompt-glyph.is-pressed .prompt-ring {
    border-color: rgb(255 255 255 / 0.95);
    animation: prompt-burst 0.45s ease-out forwards;
  }

  @keyframes prompt-pop {
    0% {
      opacity: 0;
      translate: -10px 0;
      scale: 0.6;
    }
    100% {
      opacity: 1;
      translate: 0 0;
      scale: 1;
    }
  }

  @keyframes prompt-pop-left {
    0% {
      opacity: 0;
      translate: 10px 0;
      scale: 0.6;
    }
    100% {
      opacity: 1;
      translate: 0 0;
      scale: 1;
    }
  }

  @keyframes prompt-float {
    0%,
    100% {
      translate: 0 0;
    }
    50% {
      translate: 0 -3px;
    }
  }

  @keyframes prompt-glow {
    0%,
    100% {
      filter: drop-shadow(0 0 0 rgb(255 255 255 / 0));
    }
    50% {
      filter: drop-shadow(0 0 6px rgb(255 255 255 / 0.45));
    }
  }

  @keyframes prompt-ring {
    0% {
      opacity: 0.8;
      scale: 0.9;
    }
    70%,
    100% {
      opacity: 0;
      scale: 1.45;
    }
  }

  @keyframes prompt-press {
    0% {
      scale: 1;
    }
    35% {
      scale: 0.7;
      filter: brightness(1.6);
    }
    100% {
      scale: 1;
    }
  }

  @keyframes prompt-burst {
    from {
      opacity: 1;
      scale: 0.8;
    }
    to {
      opacity: 0;
      scale: 2;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .prompt-pop,
    .prompt-float,
    .prompt-glyph,
    .prompt-ring,
    .prompt-glyph.is-pressed,
    .prompt-glyph.is-pressed .prompt-ring {
      animation: none;
    }
  }
</style>
