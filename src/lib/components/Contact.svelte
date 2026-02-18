<script lang="ts">
  import { reveal } from "../actions/reveal";
  import Toast from "./Toast.svelte";
  import AutoReplyPreviewModal from "./AutoReplyPreviewModal.svelte";
  import autoReplyTemplateRaw from "../email/contact-autoreply.html?raw";

  type SubmitStatus =
    | { type: "idle" }
    | { type: "sending" }
    | { type: "success"; message: string }
    | { type: "error"; message: string };

  const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

  const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
  const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
  const EMAILJS_AUTOREPLY_TEMPLATE_ID = import.meta.env
    .VITE_EMAILJS_AUTOREPLY_TEMPLATE_ID as string | undefined;
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
    autoReplySrcdoc = fillTemplate(autoReplyTemplateRaw, {
      site_url: escapeHtml(siteUrl),
      to_name: escapeHtml(toName),
      message: escapeHtml(userMessage),
    });
    autoReplyModalOpen = true;
  }

  function markSuccess(successMessage: string, previewName: string, previewMessage: string) {
    status = { type: "success", message: successMessage };
    showToast("Email enviado exitosamente");
    openAutoReplyPreview(previewName, previewMessage);
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (status.type === "sending") return;

    if (company.trim().length > 0) {
      markSuccess(
        "¡Mensaje enviado! Te responderé pronto.",
        normalize(name),
        message.trim()
      );
      return;
    }

    if (!isConfigured()) {
      status = {
        type: "error",
        message:
          "El formulario no está configurado todavía. Falta definir VITE_EMAILJS_SERVICE_ID / VITE_EMAILJS_TEMPLATE_ID / VITE_EMAILJS_PUBLIC_KEY.",
      };
      return;
    }

    const cleanName = normalize(name);
    const cleanEmail = normalize(email);
    const cleanMessage = message.trim();

    if (cleanName.length < 2 || cleanEmail.length < 5 || cleanMessage.length < 10) {
      status = {
        type: "error",
        message: "Por favor completa tu nombre, email y un mensaje un poco más detallado.",
      };
      return;
    }

    status = { type: "sending" };

    try {
      const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
      const title = "Nuevo mensaje desde el portafolio";

      const payload = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          title,
          from_name: escapeHtml(cleanName),
          from_email: escapeHtml(cleanEmail),
          reply_to: cleanEmail,
          message: escapeHtml(cleanMessage),
          site_url: siteUrl,
          name: escapeHtml(cleanName),
          email: escapeHtml(cleanEmail),
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

      markSuccess("¡Mensaje enviado! Te responderé pronto.", previewName, previewMessage);
    } catch {
      status = {
        type: "error",
        message:
          "No pude enviar el mensaje en este momento. Inténtalo de nuevo en unos minutos.",
      };
    }
  }
</script>

<section
  id="contact"
  class="py-16 px-4"
  use:reveal={{ direction: "up", distance: 40, replayOnEnable: true }}
>
  <div class="container mx-auto">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">Contacto</h2>

      <div class="grid md:grid-cols-2 gap-12">
        <div use:reveal={{ delay: 80, replayOnEnable: true }}>
          <h3 class="text-2xl font-semibold mb-6">¡Hablemos!</h3>
          <p class="text-muted-foreground mb-8 leading-relaxed">
            Estoy siempre abierto a nuevas oportunidades y proyectos interesantes. Si tienes una
            idea o necesitas ayuda con tu próximo proyecto, no dudes en contactarme.
          </p>

          <div class="space-y-4">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <div>
                <p class="font-medium">Email</p>
                <a
                  href="mailto:erickgiber.dev@gmail.com"
                  class="text-muted-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
                  aria-label="Enviar correo a erickgiber.dev@gmail.com"
                >
                  erickgiber.dev@gmail.com
                </a>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                  ></path>
                </svg>
              </div>
              <div>
                <p class="font-medium">GitHub</p>
                <a
                  href="https://github.com/erickgiber"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group inline-flex items-center gap-1 text-muted-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded-sm break-all"
                  aria-label="Abrir perfil de GitHub de Erick Giber en una nueva pestaña"
                >
                  github.com/erickgiber
                  <svg
                    aria-hidden="true"
                    class="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity"
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

            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                  ></path>
                </svg>
              </div>
              <div>
                <p class="font-medium">LinkedIn</p>
                <a
                  href="https://linkedin.com/in/erickgiber"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group inline-flex items-center gap-1 text-muted-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded-sm break-all"
                  aria-label="Abrir perfil de LinkedIn de Erick Giber en una nueva pestaña"
                >
                  linkedin.com/in/erickgiber
                  <svg
                    aria-hidden="true"
                    class="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity"
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
          class="bg-card z-20 border border-border rounded-lg p-6"
          use:reveal={{ delay: 200, replayOnEnable: true }}
        >
          <form class="space-y-6" onsubmit={handleSubmit}>
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
              <label for="name" class="block text-sm font-medium mb-2">Nombre</label>
              <input
                type="text"
                id="name"
                name="name"
                class="w-full px-4 py-2 border border-border rounded-lg bg-input focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                placeholder="Tu nombre"
                autocomplete="name"
                required
                minlength="2"
                bind:value={name}
                disabled={status.type === "sending"}
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                class="w-full px-4 py-2 border border-border rounded-lg bg-input focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                placeholder="tu@email.com"
                autocomplete="email"
                required
                bind:value={email}
                disabled={status.type === "sending"}
              />
            </div>

            <div>
              <label for="message" class="block text-sm font-medium mb-2">Mensaje</label>
              <textarea
                id="message"
                name="message"
                rows="4"
                class="w-full px-4 py-2 border border-border rounded-lg bg-input focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-none"
                placeholder="Cuéntame sobre tu proyecto..."
                required
                minlength="10"
                bind:value={message}
                disabled={status.type === "sending"}
              ></textarea>
            </div>

            {#if status.type === "success"}
              <p class="text-sm text-muted-foreground" role="status" aria-live="polite">
                {status.message}
              </p>
            {:else if status.type === "error"}
              <p class="text-sm text-muted-foreground" role="status" aria-live="polite">
                {status.message}
              </p>
            {/if}

            <button
              type="submit"
              class="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={status.type === "sending"}
            >
              {status.type === "sending" ? "Enviando..." : "Enviar mensaje"}
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
