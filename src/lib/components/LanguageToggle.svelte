<script lang="ts">
  import { i18nStore } from "../stores/i18n.svelte";

  let currentLocale = $derived(i18nStore.locale);
  let t = $derived(i18nStore.t);

  function handleClick() {
    i18nStore.toggleLocale();
  }
</script>

<div class="relative inline-flex items-center">
  <button
    type="button"
    onclick={handleClick}
    class="group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted/50 dark:bg-muted/30 hover:bg-background/80 dark:hover:bg-card backdrop-blur-md ring-1 ring-black/[0.04] dark:ring-white/[0.08] text-xs font-semibold text-foreground/90 hover:text-primary active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary select-none cursor-pointer"
    aria-label={t.lang.switchTo}
  >
    {#if currentLocale === "es"}
      <span class="text-sm leading-none transition-transform duration-200 group-hover:scale-110"
        >🇪🇸</span
      >
      <span class="tracking-wider text-xs font-bold text-primary">ES</span>
    {:else}
      <span class="text-sm leading-none transition-transform duration-200 group-hover:scale-110"
        >🇺🇸</span
      >
      <span class="tracking-wider text-xs font-bold text-primary">EN</span>
    {/if}

    <!-- Tooltip -->
    <span
      class="hidden md:block pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-popover/95 backdrop-blur border border-border/40 text-popover-foreground shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 origin-top whitespace-nowrap z-50"
    >
      {t.lang.switchTo}
    </span>
  </button>
</div>
