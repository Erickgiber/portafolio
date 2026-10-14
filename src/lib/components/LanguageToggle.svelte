<script lang="ts">
  import Icon from "@iconify/svelte";
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
    class="group relative flex items-center gap-1.5 h-8 px-2.5 rounded-full hover:bg-background/80 dark:hover:bg-card text-xs font-semibold text-foreground/90 hover:text-primary active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary select-none cursor-pointer"
    aria-label={t.lang.switchTo}
  >
    <Icon
      icon={currentLocale === "es" ? "circle-flags:es" : "circle-flags:us"}
      class="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110"
      aria-hidden="true"
    />
    <span class="tracking-wider text-xs font-bold text-primary">{currentLocale.toUpperCase()}</span>

    <!-- Tooltip -->
    <span
      class="hidden md:block pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-popover/95 backdrop-blur border border-border/40 text-popover-foreground shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 origin-top whitespace-nowrap z-50"
    >
      {t.lang.switchTo}
    </span>
  </button>
</div>
