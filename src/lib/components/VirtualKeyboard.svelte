<script lang="ts">
  import { tick, untrack } from "svelte";
  import { fly } from "svelte/transition";
  import Icon from "@iconify/svelte";
  import { deleteBackward, insertText, moveCaret, type TextState } from "../gamepad/textEditing";
  import type { Locale } from "../i18n/translations";
  import { gamepadLayers } from "../stores/gamepadLayers.svelte";
  import { i18nStore } from "../stores/i18n.svelte";
  import { virtualKeyboard, type EditableField } from "../stores/virtualKeyboard.svelte";

  const LETTER_ROWS: Record<Locale, string[]> = {
    es: ["1234567890", "qwertyuiop", "asdfghjklñ", "zxcvbnm,.-"],
    en: ["1234567890", "qwertyuiop", "asdfghjkl'", "zxcvbnm,.-"],
  };

  let panel = $state<HTMLDivElement>();
  let shift = $state(false);
  let text = $state<TextState>({ value: "", start: 0, end: 0 });

  const field = $derived(virtualKeyboard.target);
  const labels = $derived(i18nStore.t.gamepad.keyboard);
  const rows = $derived(LETTER_ROWS[i18nStore.locale].map((row) => Array.from(row)));
  const isMultiline = $derived(field instanceof HTMLTextAreaElement);
  const fieldLabel = $derived(
    field?.labels?.[0]?.textContent?.trim() ||
      field?.getAttribute("aria-label") ||
      field?.getAttribute("placeholder") ||
      labels.title
  );

  function readState(target: EditableField): TextState {
    const value = target.value;
    return {
      value,
      start: target.selectionStart ?? value.length,
      end: target.selectionEnd ?? value.length,
    };
  }

  function apply(next: TextState) {
    const target = field;
    if (!target) {
      return;
    }

    if (target.maxLength > 0 && next.value.length > target.maxLength) {
      return;
    }

    target.value = next.value;
    try {
      target.setSelectionRange(next.start, next.end);
    } catch {}
    target.dispatchEvent(new Event("input", { bubbles: true }));
    text = next;
  }

  function type(character: string) {
    apply(insertText(text, shift ? character.toUpperCase() : character));
    shift = false;
  }

  function erase() {
    apply(deleteBackward(text));
  }

  function close() {
    const target = field;
    virtualKeyboard.close();
    target?.focus({ preventScroll: true });
  }

  $effect(() => {
    const target = virtualKeyboard.target;
    if (!target) {
      return;
    }

    return untrack(() => openSession(target));
  });

  function openSession(target: EditableField) {
    text = readState(target);
    shift = false;
    const release = gamepadLayers.push({
      scope: () => panel,
      exclusive: true,
      actions: {
        back: { label: () => i18nStore.t.gamepad.legend.close, run: close },
        west: { label: () => i18nStore.t.gamepad.legend.delete, run: erase },
        north: { label: () => i18nStore.t.gamepad.legend.space, run: () => type(" ") },
        shoulders: {
          label: () => i18nStore.t.gamepad.legend.cursor,
          run: (direction) => apply(moveCaret(text, direction)),
        },
      },
    });
    tick().then(() =>
      panel?.querySelector<HTMLElement>("[data-key]")?.focus({ preventScroll: true })
    );
    return release;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  const keyClass =
    "h-11 min-w-0 rounded-xl bg-muted/80 dark:bg-muted/60 text-base font-semibold text-foreground hover:bg-primary/15 hover:text-primary active:scale-95 transition-all cursor-pointer";
</script>

{#if field}
  <div
    bind:this={panel}
    class="fixed z-[90] inset-x-3 bottom-24 sm:bottom-20 mx-auto max-w-2xl rounded-3xl bg-card/95 backdrop-blur-xl ring-1 ring-black/[0.06] dark:ring-white/[0.1] shadow-2xl shadow-black/30 p-3 sm:p-4"
    role="dialog"
    aria-label={labels.title}
    data-testid="virtual-keyboard"
    tabindex="-1"
    onkeydown={handleKeydown}
    transition:fly={{ y: 40, duration: 240 }}
  >
    <div class="mb-3 rounded-2xl bg-background/70 px-4 py-2.5 ring-1 ring-border/60">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {fieldLabel}
      </p>
      <p
        class="mt-0.5 min-h-6 whitespace-pre-wrap break-all text-sm text-foreground"
        data-testid="virtual-keyboard-preview"
      >
        {text.value.slice(0, text.start)}<span class="keyboard-caret" aria-hidden="true"
        ></span>{text.value.slice(text.end)}
      </p>
    </div>

    <div class="space-y-1.5">
      {#each rows as row, rowIndex (rowIndex)}
        <div class="grid grid-cols-10 gap-1.5">
          {#each row as character (character)}
            <button
              type="button"
              class={keyClass}
              data-key={character}
              onclick={() => type(character)}
            >
              {shift ? character.toUpperCase() : character}
            </button>
          {/each}
        </div>
      {/each}

      <div class="grid grid-cols-10 gap-1.5">
        <button
          type="button"
          class="{keyClass} col-span-2 {shift ? 'bg-primary/20 text-primary' : ''}"
          data-key="shift"
          aria-label={labels.shift}
          aria-pressed={shift}
          onclick={() => (shift = !shift)}
        >
          <Icon icon="mdi:apple-keyboard-shift" class="w-5 h-5 mx-auto" />
        </button>
        <button type="button" class={keyClass} data-key="@" onclick={() => type("@")}>@</button>
        <button
          type="button"
          class="{keyClass} {isMultiline ? 'col-span-3' : 'col-span-4'}"
          data-key="space"
          aria-label={labels.space}
          onclick={() => type(" ")}
        >
          <Icon icon="mdi:keyboard-space" class="w-5 h-5 mx-auto" />
        </button>
        {#if isMultiline}
          <button
            type="button"
            class={keyClass}
            data-key="newline"
            aria-label={labels.newline}
            onclick={() => apply(insertText(text, "\n"))}
          >
            <Icon icon="mdi:keyboard-return" class="w-5 h-5 mx-auto" />
          </button>
        {/if}
        <button
          type="button"
          class={keyClass}
          data-key="backspace"
          aria-label={labels.backspace}
          onclick={erase}
        >
          <Icon icon="mdi:backspace-outline" class="w-5 h-5 mx-auto" />
        </button>
        <button
          type="button"
          class="{keyClass} col-span-2 bg-gradient-to-r from-sky-500 to-violet-600 text-white hover:text-white"
          data-key="done"
          onclick={close}
        >
          {labels.done}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .keyboard-caret {
    display: inline-block;
    width: 2px;
    height: 1.1em;
    margin: 0 1px;
    vertical-align: text-bottom;
    background: var(--color-primary);
    animation: keyboard-blink 1s steps(1) infinite;
  }

  @keyframes keyboard-blink {
    50% {
      opacity: 0;
    }
  }
</style>
