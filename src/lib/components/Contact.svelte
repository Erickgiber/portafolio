<script lang="ts">
  import { reveal } from "../actions/reveal";
  import Toast from "./Toast.svelte";
  import AutoReplyPreviewModal from "./AutoReplyPreviewModal.svelte";
  import autoReplyTemplateRaw from "../email/contact-autoreply.html?raw";
  import { i18nStore } from "../stores/i18n.svelte";

  let t = $derived(i18nStore.t);

  type SubmitStatus =
    | { type: "idle" }
    | { type: "sending" }
    | { type: "success"; message: string }
    | { type: "error"; message: string };

  const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

  const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
  const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
  const EMAILJS_AUTOREPLY_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_AUTOREPLY_TEMPLATE_ID as
    | string
    | undefined;
  const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;

  let name = $state("");
  let email = $state("");
  let message = $state("");

  let company = $state("");

  let status = $state<SubmitStatus>({ type: "idle" });

  let toastOpen = $state(false);
  let toastMessage = $state("");
  let toastTimer: number | undefined;

  let autoReplyModalOpen = $state(false);
  let autoReplySrcdoc = $state("");

  function normalize(value: string) {
    return value.trim().replace(/\s+/g, " ");
  }

  function escapeHtml(value: string) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function isConfigured() {
    return Boolean(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);
  }

  function showToast(message: string) {
    toastMessage = message;
    toastOpen = true;

    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }
    toastTimer = window.setTimeout(() => {
      toastOpen = false;
    }, 3800);
  }

  function fillTemplate(raw: string, params: Record<string, string>) {
    let output = raw;
    for (const [key, value] of Object.entries(params)) {
      output = output.replaceAll(`{{${key}}}`, value);
    }
    return output;
  }

  function openAutoReplyPreview(toName: string, userMessage: string) {
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
    const html = fillTemplate(autoReplyTemplateRaw, {
      title: "Respuesta Automática",
      name: escapeHtml(toName),
      to_name: escapeHtml(toName),
      to_email: "",
      message: escapeHtml(userMessage),
      reply_to: "erickgiber.dev@gmail.com",
      site_url: siteUrl,
    });
    autoReplySrcdoc = html;
    autoReplyModalOpen = true;
  }

  function markSuccess(messageText: string, previewName: string, previewMessage: string) {
    status = { type: "success", message: messageText };
    showToast(messageText);

    if (!isConfigured()) {
      openAutoReplyPreview(previewName, previewMessage);
    }
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (status.type === "sending") return;

    const cleanName = normalize(name);
    const cleanEmail = normalize(email);
    const cleanMessage = normalize(message);

    if (company.trim().length > 0) {
      markSuccess(t.contact.form.successMsg, cleanName, cleanMessage);
      return;
    }

    if (!cleanName || cleanName.length < 2) {
      status = {
        type: "error",
        message: t.contact.form.errorMsg,
      };
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      status = {
        type: "error",
        message: t.contact.form.errorMsg,
      };
      return;
    }

    if (!cleanMessage || cleanMessage.length < 10) {
      status = {
        type: "error",
        message: t.contact.form.errorMsg,
      };
      return;
    }

    status = { type: "sending" };

    if (!isConfigured()) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      const previewName = cleanName;
      const previewMessage = cleanMessage;

      name = "";
      email = "";
      message = "";
      company = "";

      markSuccess(t.contact.form.successMsg, previewName, previewMessage);
      return;
    }

    try {
      const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
      const title = `Nuevo mensaje de ${cleanName}`;

      const payload = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          title,
          from_name: escapeHtml(cleanName),
          from_email: escapeHtml(cleanEmail),
          reply_to: escapeHtml(cleanEmail),
          message: escapeHtml(cleanMessage),
          site_url: siteUrl,
          name: escapeHtml(cleanName),
          email: escapeHtml(cleanEmail),
          to_name: escapeHtml(cleanName),
          to_email: escapeHtml(cleanEmail),
        },
      };

      const response = await fetch(EMAILJS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(errorText || `Email send failed (${response.status})`);
      }

      const previewName = cleanName;
      const previewMessage = cleanMessage;

      if (EMAILJS_AUTOREPLY_TEMPLATE_ID) {
        const autoReplyPayload = {
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_AUTOREPLY_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            title,
            to_name: escapeHtml(cleanName),
            to_email: escapeHtml(cleanEmail),
            reply_to: "erickgiber.dev@gmail.com",
            message: escapeHtml(cleanMessage),
            site_url: siteUrl,
            name: escapeHtml(cleanName),
            email: escapeHtml(cleanEmail),
            from_name: escapeHtml(cleanName),
            from_email: escapeHtml(cleanEmail),
          },
        };

        await fetch(EMAILJS_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(autoReplyPayload),
        }).catch(() => {
          // Auto-reply is best-effort; ignore failures.
        });
      }

      name = "";
      email = "";
      message = "";
      company = "";

      markSuccess(t.contact.form.successMsg, previewName, previewMessage);
    } catch {
      status = {
        type: "error",
        message: t.contact.form.errorMsg,
      };
    }
  }
</script>

<section
  id="contact"
  class="relative py-12 sm:py-16 px-4 scroll-mt-16"
  use:reveal={{ direction: "up", distance: 40, replayOnEnable: true }}
>
  <div class="container mx-auto">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.contact.title}</h2>
        <p class="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          {t.contact.subtitle}
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-10 md:gap-12 items-stretch">
        <div class="flex flex-col justify-between" use:reveal={{ delay: 80, replayOnEnable: true }}>
          <div>
            <h3 class="text-2xl font-semibold tracking-tight mb-3">{t.contact.connectTitle}</h3>
            <p class="text-muted-foreground mb-6 leading-relaxed text-sm sm:text-base">
              {t.contact.connectText}
            </p>
          </div>

          <div class="space-y-3">
            <div
              class="flex items-center space-x-4 p-3 rounded-2xl bg-card/60 dark:bg-card/40 backdrop-blur-md border border-border/40 dark:border-white/[0.06] hover:border-primary/40 transition-all duration-300"
            >
              <div
                class="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t.contact.emailLabel}
                </p>
                <a
                  href="mailto:erickgiber.dev@gmail.com"
                  class="text-sm font-medium text-foreground hover:text-primary transition-colors focus:outline-none focus-visible:underline truncate block"
                  aria-label="Email erickgiber.dev@gmail.com"
                >
                  erickgiber.dev@gmail.com
                </a>
              </div>
            </div>

            <div
              class="flex items-center space-x-4 p-3 rounded-2xl bg-card/60 dark:bg-card/40 backdrop-blur-md border border-border/40 dark:border-white/[0.06] hover:border-primary/40 transition-all duration-300"
            >
              <div
                class="w-11 h-11 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                  ></path>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t.contact.githubLabel}
                </p>
                <a
                  href="https://github.com/Erickgiber"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group text-sm font-medium text-foreground hover:text-primary transition-colors focus:outline-none focus-visible:underline inline-flex items-center gap-1 truncate"
                  aria-label="GitHub profile"
                >
                  github.com/Erickgiber
                  <svg
                    aria-hidden="true"
                    class="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </div>
            </div>

            <div
              class="flex items-center space-x-4 p-3 rounded-2xl bg-card/60 dark:bg-card/40 backdrop-blur-md border border-border/40 dark:border-white/[0.06] hover:border-primary/40 transition-all duration-300"
            >
              <div
                class="w-11 h-11 bg-accent/10 rounded-xl flex items-center justify-center text-accent"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                  ></path>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t.contact.linkedinLabel}
                </p>
                <a
                  href="https://linkedin.com/in/erickgiber"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group text-sm font-medium text-foreground hover:text-primary transition-colors focus:outline-none focus-visible:underline inline-flex items-center gap-1 truncate"
                  aria-label="LinkedIn profile"
                >
                  linkedin.com/in/erickgiber
                  <svg
                    aria-hidden="true"
                    class="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </div>
            </div>

            <div
              class="flex items-center space-x-4 p-3 rounded-2xl bg-card/60 dark:bg-card/40 backdrop-blur-md border border-border/40 dark:border-white/[0.06] hover:border-primary/40 transition-all duration-300"
            >
              <div
                class="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M3.609 1.814L13.792 12 3.61 22.186a2.38 2.38 0 0 1-.61-.986c-.134-.41-.2-.843-.199-1.28V4.08c0-.437.065-.87.199-1.28.14-.403.35-.77.61-.986zm11.238 11.24l2.58 2.58-12.18 7.03 9.6-9.61zm2.58-2.108l-2.58 2.58-9.6-9.61 12.18 7.03zm1.054.606l3.22 1.86a1.44 1.44 0 0 1 0 2.496l-3.22 1.86-2.23-2.23 2.23-2.986z"
                  ></path>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t.contact.googlePlayLabel}
                </p>
                <a
                  href="https://play.google.com/store/apps/details?id=com.wallettrack.giber"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group text-sm font-medium text-foreground hover:text-primary transition-colors focus:outline-none focus-visible:underline inline-flex items-center gap-1 truncate"
                  aria-label="Google Play WalletTrack"
                >
                  WalletTrack App
                  <svg
                    aria-hidden="true"
                    class="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-card/90 dark:bg-card/60 backdrop-blur-md border border-border/50 dark:border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col h-full"
          use:reveal={{ delay: 200, replayOnEnable: true }}
        >
          <form class="flex flex-col justify-between flex-1 gap-4" onsubmit={handleSubmit}>
            <div class="hidden" aria-hidden="true">
              <label for="company">Company</label>
              <input
                id="company"
                name="company"
                type="text"
                tabindex="-1"
                autocomplete="off"
                bind:value={company}
              />
            </div>

            <div>
              <label
                for="name"
                class="block text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-2"
                >{t.contact.form.nameLabel}</label
              >
              <input
                type="text"
                id="name"
                name="name"
                class="w-full px-4 py-2.5 border border-border/60 dark:border-white/[0.08] rounded-xl bg-background/50 dark:bg-background/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                placeholder={t.contact.form.namePlaceholder}
                autocomplete="name"
                required
                minlength="2"
                bind:value={name}
                disabled={status.type === "sending"}
              />
            </div>

            <div>
              <label
                for="email"
                class="block text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-2"
                >{t.contact.form.emailLabel}</label
              >
              <input
                type="email"
                id="email"
                name="email"
                class="w-full px-4 py-2.5 border border-border/60 dark:border-white/[0.08] rounded-xl bg-background/50 dark:bg-background/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                placeholder={t.contact.form.emailPlaceholder}
                autocomplete="email"
                required
                bind:value={email}
                disabled={status.type === "sending"}
              />
            </div>

            <div class="flex-1 flex flex-col min-h-[95px]">
              <label
                for="message"
                class="block text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-2"
                >{t.contact.form.messageLabel}</label
              >
              <textarea
                id="message"
                name="message"
                class="w-full flex-1 min-h-[95px] px-4 py-2.5 border border-border/60 dark:border-white/[0.08] rounded-xl bg-background/50 dark:bg-background/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
                placeholder={t.contact.form.messagePlaceholder}
                required
                minlength="10"
                bind:value={message}
                disabled={status.type === "sending"}
              ></textarea>
            </div>

            {#if status.type === "success"}
              <p class="text-xs text-emerald-500 font-medium" role="status" aria-live="polite">
                {status.message}
              </p>
            {:else if status.type === "error"}
              <p class="text-xs text-destructive font-medium" role="status" aria-live="polite">
                {status.message}
              </p>
            {/if}

            <button
              type="submit"
              class="w-full px-6 py-3.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.99] transition-all font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed mt-auto"
              disabled={status.type === "sending"}
            >
              {status.type === "sending" ? t.contact.form.sendingBtn : t.contact.form.sendBtn}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</section>

<Toast
  open={toastOpen}
  message={toastMessage}
  onDismiss={() => {
    toastOpen = false;
  }}
/>

<AutoReplyPreviewModal
  open={autoReplyModalOpen}
  srcdoc={autoReplySrcdoc}
  onClose={() => {
    autoReplyModalOpen = false;
  }}
/>
