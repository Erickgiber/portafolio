<script lang="ts">
  import { cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";

  type Props = {
    open: boolean;
    message: string;
    onDismiss?: () => void;
  };

  let { open, message, onDismiss }: Props = $props();
</script>

{#if open}
  <div
    class="fixed top-4 right-4 z-[90] max-w-sm"
    role="status"
    aria-live="polite"
    transition:fly={{ x: 24, y: -8, duration: 260, easing: cubicOut }}
  >
    <div
      class="bg-card border border-border rounded-lg shadow-lg px-4 py-3 flex items-start gap-3"
    >
      <svg
        class="w-5 h-5 text-primary mt-0.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>

      <p class="text-sm text-card-foreground leading-snug">{message}</p>

      <button
        type="button"
        class="ml-auto -mr-1 p-1 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Cerrar notificación"
        onclick={() => onDismiss?.()}
      >
        <svg
          class="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity"
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
  </div>
{/if}
