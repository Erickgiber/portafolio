<script lang="ts">
  import { cubicOut } from "svelte/easing";
  import { fade, scale } from "svelte/transition";
  import { tick } from "svelte";

  type Props = {
    open: boolean;
    title?: string;
    srcdoc: string;
    onClose: () => void;
  };

  let { open, title = "Auto-respuesta (vista previa)", srcdoc, onClose }: Props = $props();

  let closeButton = $state<HTMLButtonElement | null>(null);

  $effect(() => {
    if (!open) return;
    tick().then(() => closeButton?.focus());
  });
</script>

{#if open}
  <div
    class="fixed inset-0 z-[80] flex items-start justify-center p-4 md:p-6"
    role="dialog"
    aria-modal="true"
    aria-label={title}
    tabindex="-1"
    onkeydown={(e) => {
      if (e.key === "Escape") onClose();
    }}
  >
    <button
      type="button"
      class="absolute inset-0 bg-background/70 backdrop-blur-sm"
      aria-label="Cerrar modal"
      onclick={onClose}
      transition:fade={{ duration: 160 }}
    ></button>

    <div
      class="relative w-full max-w-3xl bg-card border border-border rounded-xl shadow-lg overflow-hidden"
      transition:scale={{ start: 0.96, duration: 220, easing: cubicOut }}
    >
      <div class="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 class="text-sm md:text-base font-semibold text-card-foreground">{title}</h3>
        <button
          bind:this={closeButton}
          type="button"
          class="p-2 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Cerrar"
          onclick={onClose}
        >
          <svg
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-4">
        <iframe
          class="w-full h-[70vh] rounded-lg border border-border bg-background"
          title="Vista previa del email de auto-respuesta"
          srcdoc={srcdoc}
        ></iframe>
      </div>
    </div>
  </div>
{/if}
