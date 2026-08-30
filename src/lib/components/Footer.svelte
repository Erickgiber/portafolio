<script lang="ts">
  import { i18nStore } from "../stores/i18n.svelte";
  import Logo from "./Logo.svelte";

  const currentYear = new Date().getFullYear();
  let t = $derived(i18nStore.t);
</script>

<footer
  class="py-12 px-4 border-t border-border/40 dark:border-white/[0.06] bg-background/30 backdrop-blur-sm"
>
  <div class="container mx-auto max-w-6xl">
    <div class="flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center space-x-3">
        <Logo size={32} class="hover:scale-105 transition-transform" />
        <span class="font-semibold text-sm tracking-tight text-foreground/90">Erick Ramírez</span>
      </div>

      <div class="flex items-center space-x-3">
        <a
          href="mailto:erickgiber.dev@gmail.com"
          class="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/30 transition-all"
          aria-label="Email: erickgiber.dev@gmail.com"
        >
          <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            ></path>
          </svg>
        </a>

        <a
          href="https://github.com/Erickgiber"
          target="_blank"
          rel="noopener noreferrer"
          class="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/30 transition-all"
          aria-label="GitHub"
        >
          <svg class="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            ></path>
          </svg>
        </a>

        <a
          href="https://linkedin.com/in/erickgiber"
          target="_blank"
          rel="noopener noreferrer"
          class="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/30 transition-all"
          aria-label="LinkedIn"
        >
          <svg class="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
            ></path>
          </svg>
        </a>

        <a
          href="https://play.google.com/store/apps/details?id=com.wallettrack.giber"
          target="_blank"
          rel="noopener noreferrer"
          class="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/30 transition-all"
          aria-label="Google Play"
        >
          <svg class="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M3.609 1.814L13.792 12 3.61 22.186a2.38 2.38 0 0 1-.61-.986c-.134-.41-.2-.843-.199-1.28V4.08c0-.437.065-.87.199-1.28.14-.403.35-.77.61-.986zm11.238 11.24l2.58 2.58-12.18 7.03 9.6-9.61zm2.58-2.108l-2.58 2.58-9.6-9.61 12.18 7.03zm1.054.606l3.22 1.86a1.44 1.44 0 0 1 0 2.496l-3.22 1.86-2.23-2.23 2.23-2.986z"
            ></path>
          </svg>
        </a>
      </div>
    </div>

    <div
      class="mt-8 pt-6 border-t border-border/30 dark:border-white/[0.04] text-center text-xs text-muted-foreground"
    >
      <p>&copy; {currentYear} {t.footer.rights}</p>
    </div>
  </div>
</footer>
