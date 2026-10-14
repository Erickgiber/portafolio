<script lang="ts">
  import { onMount } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { Tween, prefersReducedMotion } from "svelte/motion";
  import { fly, scale } from "svelte/transition";
  import Icon from "@iconify/svelte";
  import AnimatedBackground from "./lib/components/AnimatedBackground.svelte";
  import GamepadIndicator from "./lib/components/GamepadIndicator.svelte";
  import LanguageToggle from "./lib/components/LanguageToggle.svelte";
  import {
    CheckoutError,
    checkoutAvailable,
    createPurchase,
    fetchPurchase,
    linkSubscription,
    loadConfig,
    sendPagoMovil,
    type CheckoutConfig,
    type Purchase,
  } from "./lib/checkout/api";
  import { renderSubscriptionButton } from "./lib/checkout/paypal";
  import { formatBolivars, formatDollars } from "./lib/checkout/rate";
  import {
    MONTH_OPTIONS,
    STEPS,
    accessFromUrl,
    amountUsd,
    amountVes,
    clearDraft,
    daysAgo,
    emailFromUrl,
    emptyDraft,
    isoDate,
    kindFromUrl,
    purchaseRequest,
    purchaseUrl,
    readHistory,
    rememberPurchase,
    restoreDraft,
    saveDraft,
    stepAfterLoad,
    validateDetails,
    validatePayment,
    type CheckoutDraft,
    type CheckoutStep,
    type DetailErrors,
    type HistoryEntry,
    type PaymentErrors,
    type PurchaseAccess,
    type PurchaseKind,
  } from "./lib/checkout/state";
  import { PAGO_MOVIL, checkoutCopy, fill } from "./lib/data/checkout";
  import { i18nStore } from "./lib/stores/i18n.svelte";
  import { router } from "./lib/stores/router.svelte";
  import { themeStore } from "./lib/stores/theme.svelte";

  type Notice = { tone: "error" | "info"; text: string };
  type PaypalState = "idle" | "loading" | "ready" | "approving" | "failed";

  const POLL_MS = 8_000;
  const STEP_SLIDE_PX = 48;
  const STEP_MS = 380;
  const BANNER_MS = 320;
  const CONFETTI = Array.from({ length: 14 }, (_, index) => ({
    angle: (360 / 14) * index,
    distance: 56 + (index % 3) * 14,
    hue: [199, 217, 262, 152, 38][index % 5],
  }));
  const COPIED_MS = 1_600;
  const KINDS: { kind: PurchaseKind; icon: string }[] = [
    { kind: "new", icon: "mdi:account-outline" },
    { kind: "gift", icon: "mdi:gift-outline" },
    { kind: "renew", icon: "mdi:autorenew" },
  ];
  const VISIBLE_STEPS = STEPS.filter((step) => step !== "status");

  let draft = $state<CheckoutDraft>(emptyDraft(Date.now()));
  let config = $state<CheckoutConfig | null>(null);
  let configError = $state("");
  let purchase = $state<Purchase | null>(null);
  let pastPurchases = $state<HistoryEntry[]>([]);
  let detailErrors = $state<DetailErrors>({});
  let paymentErrors = $state<PaymentErrors>({});
  let busy = $state(false);
  let notice = $state<Notice | null>(null);
  let paypalState = $state<PaypalState>("idle");
  let paypalContainer = $state<HTMLDivElement>();
  let bankQuery = $state("");
  let pickOtherDate = $state(false);
  let copied = $state<string | null>(null);
  let isRestored = $state(false);
  let direction = $state(1);

  const copy = $derived(checkoutCopy[i18nStore.locale]);
  const locale = $derived(i18nStore.locale);
  const priceUsd = $derived(config?.priceUsd ?? 2);
  const rate = $derived(config?.rate ?? null);
  const months = $derived(draft.method === "paypal" ? 1 : draft.months);
  const totalUsd = $derived(amountUsd(months, priceUsd));
  const totalVes = $derived(rate ? amountVes(totalUsd, rate.ves) : null);
  const shownTotal = Tween.of(() => totalUsd, { duration: 450, easing: cubicOut });
  const stepIndex = $derived(
    VISIBLE_STEPS.indexOf(draft.step === "status" ? "payment" : draft.step)
  );
  const banks = $derived(config?.banks ?? []);
  const filteredBanks = $derived(
    banks.filter((bank) =>
      `${bank.code} ${bank.name}`.toLowerCase().includes(bankQuery.trim().toLowerCase())
    )
  );
  const today = $derived(isoDate(new Date()));
  const yesterday = $derived(daysAgo(new Date(), 1));
  const privateLink = $derived(
    draft.purchase && typeof location !== "undefined"
      ? purchaseUrl(`${location.origin}/vitral/comprar/`, draft.purchase)
      : ""
  );
  const themeLabel = $derived(
    themeStore.isDark ? i18nStore.t.theme.switchToLight : i18nStore.t.theme.switchToDark
  );
  const awaitsPaypal = $derived(
    purchase?.method === "paypal" &&
      purchase.status === "pending" &&
      purchase.subscriptionStatus !== ""
  );

  $effect(() => {
    document.title = copy.pageTitle;
    document.documentElement.lang = locale;
  });

  $effect(() => {
    if (isRestored) {
      saveDraft(localStorage, $state.snapshot(draft), Date.now());
    }
  });

  $effect(() => {
    const current = purchase;
    const access = draft.purchase;
    const shouldPoll = !!current && !!access && (current.status === "reviewing" || awaitsPaypal);
    if (!shouldPoll) {
      return;
    }

    const timer = setInterval(() => refresh(access, false), POLL_MS);
    return () => clearInterval(timer);
  });

  $effect(() => {
    const container = paypalContainer;
    const access = draft.purchase;
    if (
      draft.step !== "payment" ||
      draft.method !== "paypal" ||
      !container ||
      !access ||
      !config?.paypal.ready
    ) {
      return;
    }

    let release: (() => void) | null = null;
    let isActive = true;
    paypalState = "loading";
    renderSubscriptionButton(container, {
      clientId: config.paypal.clientId,
      planId: config.paypal.planId,
      purchaseId: access.id,
      locale: locale === "en" ? "en_US" : "es_ES",
      onApprove: (subscriptionId) => approvePaypal(access, subscriptionId),
      onCancel: () => (notice = { tone: "info", text: copy.paypal.cancelled }),
      onError: () => {
        paypalState = "failed";
        notice = { tone: "error", text: copy.paypal.error };
      },
    })
      .then((close) => {
        if (isActive) {
          release = close;
          paypalState = "ready";
        } else {
          close();
        }
      })
      .catch(() => {
        paypalState = "failed";
        notice = { tone: "error", text: copy.paypal.error };
      });

    return () => {
      isActive = false;
      release?.();
    };
  });

  onMount(() => {
    themeStore.initTheme();
    pastPurchases = readHistory(localStorage);
    const fromUrl = accessFromUrl(location.search);
    const saved = restoreDraft(localStorage, Date.now());
    if (saved) {
      draft = saved;
    }
    const presetKind = fromUrl ? null : kindFromUrl(location.search);
    if (presetKind) {
      const presetEmail = emailFromUrl(location.search);
      draft = {
        ...draft,
        kind: presetKind,
        purchase: null,
        step: "details",
        buyerEmail: presetEmail || draft.buyerEmail,
      };
      showPurchaseInUrl(null);
    }
    isRestored = true;

    const controller = new AbortController();
    if (checkoutAvailable) {
      loadConfig(controller.signal)
        .then((loaded) => (config = loaded))
        .catch((cause) => (configError = errorCode(cause)));
    } else {
      configError = "unavailable";
    }

    const access = fromUrl ?? draft.purchase;
    if (access) {
      refresh(access, true);
    }
    return () => controller.abort();
  });

  function retryConfig() {
    configError = "";
    loadConfig()
      .then((loaded) => (config = loaded))
      .catch((cause) => (configError = errorCode(cause)));
  }

  function errorCode(cause: unknown): string {
    return cause instanceof CheckoutError ? cause.code : "server_error";
  }

  function errorText(code: string): string {
    return copy.errors[code] ?? copy.errors.server_error;
  }

  function monthLabel(count: number): string {
    return fill(count === 1 ? copy.method.month : copy.method.monthsPlural, { n: count });
  }

  function formatDate(value: string): string {
    return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-VE", {
      dateStyle: "long",
    }).format(new Date(value));
  }

  function showPurchaseInUrl(access: PurchaseAccess | null) {
    const url = new URL(location.href);
    url.search = access
      ? new URLSearchParams({ compra: access.id, token: access.token }).toString()
      : "";
    window.history.replaceState(window.history.state, "", url.pathname + url.search);
  }

  function track(access: PurchaseAccess, loaded: Purchase) {
    purchase = loaded;
    pastPurchases = rememberPurchase(localStorage, {
      ...access,
      createdAt: Date.parse(loaded.createdAt) || Date.now(),
      kind: loaded.kind,
    });
  }

  async function refresh(access: PurchaseAccess, adoptStep: boolean) {
    try {
      const loaded = await fetchPurchase(access);
      track(access, loaded);
      if (adoptStep) {
        const isSameDraft = draft.purchase?.id === access.id;
        draft = {
          ...(isSameDraft ? draft : emptyDraft(Date.now())),
          kind: loaded.kind,
          method: loaded.method,
          months: loaded.months,
          buyerEmail: isSameDraft ? draft.buyerEmail : loaded.buyerEmail,
          recipientEmail: isSameDraft ? draft.recipientEmail : loaded.recipientEmail,
          purchase: access,
          step: stepAfterLoad(loaded.status, loaded.method, loaded.subscriptionStatus !== ""),
        };
        showPurchaseInUrl(access);
      } else if (loaded.status !== "pending" && draft.step === "payment") {
        draft.step = "status";
      }
    } catch (cause) {
      if (errorCode(cause) === "not_found" && draft.purchase?.id === access.id) {
        draft = { ...draft, purchase: null, step: "method" };
        showPurchaseInUrl(null);
      }
      if (adoptStep) {
        notice = { tone: "error", text: errorText(errorCode(cause)) };
      }
    }
  }

  function motionMs(duration: number): number {
    return prefersReducedMotion.current ? 0 : duration;
  }

  function goTo(step: CheckoutStep) {
    direction = STEPS.indexOf(step) >= STEPS.indexOf(draft.step) ? 1 : -1;
    notice = null;
    draft.step = step;
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function chooseKind(kind: PurchaseKind) {
    draft.kind = kind;
    goTo("details");
  }

  function submitDetails() {
    detailErrors = validateDetails(draft);
    if (Object.keys(detailErrors).length === 0) {
      goTo("method");
    }
  }

  function changeDetails() {
    draft = { ...draft, purchase: null };
    purchase = null;
    paypalState = "idle";
    showPurchaseInUrl(null);
    goTo("details");
  }

  async function startPayment() {
    if (busy) {
      return;
    }

    detailErrors = validateDetails(draft);
    if (Object.keys(detailErrors).length > 0) {
      goTo("details");
      return;
    }

    busy = true;
    notice = null;
    try {
      const created = await createPurchase(purchaseRequest(draft));
      draft = { ...draft, purchase: created.access };
      track(created.access, created.purchase);
      showPurchaseInUrl(created.access);
      goTo("payment");
    } catch (cause) {
      const code = errorCode(cause);
      if (code === "license_not_found") {
        detailErrors = { buyerEmail: "invalid" };
      }
      notice = { tone: "error", text: errorText(code) };
    } finally {
      busy = false;
    }
  }

  async function approvePaypal(access: PurchaseAccess, subscriptionId: string) {
    paypalState = "approving";
    notice = null;
    try {
      track(access, await linkSubscription(access, subscriptionId));
    } catch (cause) {
      notice = { tone: "error", text: errorText(errorCode(cause)) };
    } finally {
      goTo("status");
      refresh(access, false);
    }
  }

  async function submitPagoMovil() {
    const access = draft.purchase;
    if (busy || !access) {
      return;
    }

    paymentErrors = validatePayment(
      draft.payment,
      banks.map((bank) => bank.code),
      new Date()
    );
    if (Object.keys(paymentErrors).length > 0) {
      return;
    }

    busy = true;
    notice = null;
    try {
      track(access, await sendPagoMovil(access, draft.payment));
      goTo("status");
    } catch (cause) {
      const code = errorCode(cause);
      if (cause instanceof CheckoutError && code === "invalid_fields") {
        paymentErrors = cause.fields as PaymentErrors;
      }
      if (code === "already_submitted") {
        refresh(access, false);
        goTo("status");
      }
      notice = { tone: "error", text: errorText(code) };
    } finally {
      busy = false;
    }
  }

  function startOver() {
    clearDraft(localStorage);
    draft = { ...emptyDraft(Date.now()), buyerName: draft.buyerName, buyerEmail: draft.buyerEmail };
    purchase = null;
    paypalState = "idle";
    detailErrors = {};
    paymentErrors = {};
    showPurchaseInUrl(null);
    goTo("kind");
  }

  function retryPagoMovil() {
    paymentErrors = {};
    goTo("payment");
  }

  async function copyText(value: string, id: string) {
    try {
      await navigator.clipboard.writeText(value);
      copied = id;
      setTimeout(() => {
        if (copied === id) {
          copied = null;
        }
      }, COPIED_MS);
    } catch {}
  }

  function goBack(event: MouseEvent) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    router.navigate("/vitral/");
  }

  function fieldError(error: string | undefined, text: string) {
    return error ? text : "";
  }
</script>

{#snippet banner(
  tone: "soon" | "error" | "info",
  icon: string,
  title: string,
  text: string,
  testId: string,
  onRetry?: () => void
)}
  <div
    class="checkout-banner tone-{tone} flex items-start gap-4 rounded-2xl border p-4 sm:p-5 backdrop-blur-md"
    role={tone === "error" ? "alert" : "status"}
    data-testid={testId}
    in:fly={{ y: -12, duration: motionMs(BANNER_MS), easing: cubicOut }}
  >
    <span class="banner-icon grid place-items-center w-10 h-10 shrink-0 rounded-xl">
      <Icon {icon} class="w-5 h-5" />
    </span>
    <div class="min-w-0 flex-1 space-y-1">
      <p class="text-sm font-semibold text-foreground">{title}</p>
      <p class="text-sm text-muted-foreground leading-relaxed">{text}</p>
    </div>
    {#if onRetry}
      <button type="button" class="checkout-secondary shrink-0 self-center" onclick={onRetry}>
        <Icon icon="mdi:refresh" class="w-4 h-4" />
        {copy.actions.retry}
      </button>
    {/if}
  </div>
{/snippet}

{#snippet copyButton(value: string, id: string)}
  <button
    type="button"
    class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer {copied ===
    id
      ? 'bg-emerald-500/15 text-emerald-500'
      : 'bg-muted/70 dark:bg-muted/40 text-muted-foreground hover:text-primary'}"
    onclick={() => copyText(value, id)}
    data-testid="copy-{id}"
  >
    <Icon icon={copied === id ? "mdi:check" : "mdi:content-copy"} class="w-3.5 h-3.5" />
    {copied === id ? copy.actions.copied : copy.actions.copy}
  </button>
{/snippet}

<div
  class="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-x-clip z-10"
>
  <AnimatedBackground />

  <header class="relative z-20 container mx-auto px-4 py-5 flex items-center justify-between">
    <a
      href="/vitral/"
      onclick={goBack}
      class="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
    >
      <Icon icon="mdi:arrow-left" class="w-4 h-4" />
      {copy.back}
    </a>
    <div
      class="flex items-center gap-0.5 p-0.5 rounded-full bg-muted/50 dark:bg-muted/30 backdrop-blur-md ring-1 ring-black/[0.04] dark:ring-white/[0.08]"
    >
      <GamepadIndicator />
      <LanguageToggle />
      <button
        type="button"
        class="grid place-items-center w-8 h-8 rounded-full hover:bg-background/80 dark:hover:bg-card hover:text-primary active:scale-95 transition-all cursor-pointer"
        aria-label={themeLabel}
        title={themeLabel}
        onclick={themeStore.toggleTheme}
      >
        <Icon
          icon={themeStore.isDark ? "mdi:weather-sunny" : "mdi:weather-night"}
          class="w-4 h-4"
        />
      </button>
    </div>
  </header>

  <main class="relative z-10 container mx-auto px-4 pt-4 sm:pt-8 pb-24">
    <div class="max-w-5xl mx-auto grid lg:grid-cols-[1fr_20rem] gap-8 lg:gap-10 items-start">
      <section class="min-w-0">
        <div class="flex items-start gap-4 mb-10">
          <img
            src="/vitral/icon.png"
            alt=""
            class="w-14 h-14 shrink-0 rounded-2xl shadow-lg shadow-primary/20"
          />
          <div class="space-y-2">
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              {copy.title}
            </h1>
            <p class="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
              {copy.lead}
            </p>
          </div>
        </div>

        {#if draft.step !== "status"}
          <ol class="flex items-center gap-3 mb-8" aria-label={copy.summary.title}>
            {#each VISIBLE_STEPS as step, index (step)}
              <li
                class="flex items-center gap-2 min-w-0 {index < VISIBLE_STEPS.length - 1
                  ? 'flex-1'
                  : ''}"
              >
                <span
                  class="step-dot grid place-items-center w-8 h-8 shrink-0 rounded-full text-xs font-bold {index <=
                  stepIndex
                    ? 'bg-gradient-to-br from-sky-500 to-violet-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-muted text-muted-foreground'}"
                  class:is-current={index === stepIndex}
                  aria-current={index === stepIndex ? "step" : undefined}
                >
                  {#if index < stepIndex}
                    <span in:scale={{ duration: motionMs(260), start: 0.4 }}>
                      <Icon icon="mdi:check-bold" class="w-4 h-4" />
                    </span>
                  {:else}
                    {index + 1}
                  {/if}
                </span>
                <span
                  class="hidden sm:block text-xs font-semibold truncate {index === stepIndex
                    ? 'text-foreground'
                    : 'text-muted-foreground'}"
                >
                  {copy.steps[step]}
                </span>
                {#if index < VISIBLE_STEPS.length - 1}
                  <span class="relative h-1 flex-1 overflow-hidden rounded-full bg-border/70">
                    <span
                      class="step-fill absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-500 to-violet-600"
                      style:width={index < stepIndex ? "100%" : "0%"}
                    ></span>
                  </span>
                {/if}
              </li>
            {/each}
          </ol>
        {/if}

        {#if configError || notice}
          <div class="space-y-3 mb-6">
            {#if configError === "unavailable"}
              {@render banner(
                "soon",
                "mdi:rocket-launch-outline",
                copy.banners.unavailableTitle,
                copy.errors.unavailable,
                "checkout-unavailable"
              )}
            {:else if configError}
              {@render banner(
                "error",
                "mdi:wifi-off",
                copy.banners.offlineTitle,
                errorText(configError),
                "checkout-config-error",
                retryConfig
              )}
            {/if}
            {#if notice}
              {@render banner(
                notice.tone,
                notice.tone === "error" ? "mdi:alert-circle-outline" : "mdi:information-outline",
                notice.tone === "error" ? copy.banners.errorTitle : copy.banners.infoTitle,
                notice.text,
                "checkout-notice"
              )}
            {/if}
          </div>
        {/if}

        <div
          class="rounded-3xl border border-border/60 dark:border-white/[0.08] bg-card/85 dark:bg-card/60 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-primary/5"
        >
          {#key draft.step}
            <div
              in:fly={{
                x: STEP_SLIDE_PX * direction,
                duration: motionMs(STEP_MS),
                easing: cubicOut,
                opacity: 0,
              }}
            >
              {#if draft.step === "kind"}
                <div class="grid sm:grid-cols-3 gap-4" data-testid="step-kind">
                  {#each KINDS as option (option.kind)}
                    <button
                      type="button"
                      class="checkout-option group relative text-left rounded-2xl border p-5 cursor-pointer {draft.kind ===
                      option.kind
                        ? 'is-selected border-primary bg-primary/10'
                        : 'border-border/60 hover:border-primary/50'}"
                      onclick={() => chooseKind(option.kind)}
                      data-testid="kind-{option.kind}"
                    >
                      <span
                        class="option-icon grid place-items-center w-11 h-11 rounded-xl bg-primary/10 text-primary mb-4"
                      >
                        <Icon icon={option.icon} class="w-5 h-5" />
                      </span>
                      <span class="block font-semibold">{copy.kinds[option.kind].title}</span>
                      <span class="block text-xs text-muted-foreground mt-1"
                        >{copy.kinds[option.kind].text}</span
                      >
                    </button>
                  {/each}
                </div>
              {:else if draft.step === "details"}
                <form
                  class="space-y-6"
                  onsubmit={(event) => {
                    event.preventDefault();
                    submitDetails();
                  }}
                  data-testid="step-details"
                  novalidate
                >
                  <h2 class="text-lg font-bold">{copy.details.title}</h2>
                  {#if draft.kind !== "renew"}
                    <label class="block">
                      <span class="mb-2 block text-sm font-medium">
                        {copy.details.buyerName}
                        <span class="text-muted-foreground">({copy.details.optional})</span>
                      </span>
                      <input
                        class="checkout-field"
                        name="buyerName"
                        autocomplete="name"
                        maxlength="80"
                        placeholder={copy.details.buyerNamePlaceholder}
                        bind:value={draft.buyerName}
                      />
                    </label>
                  {/if}
                  <label class="block">
                    <span class="mb-2 block text-sm font-medium">{copy.details.buyerEmail}</span>
                    <input
                      class="checkout-field"
                      class:has-error={detailErrors.buyerEmail}
                      name="buyerEmail"
                      type="email"
                      autocomplete="email"
                      required
                      placeholder="tu@correo.com"
                      bind:value={draft.buyerEmail}
                      aria-invalid={!!detailErrors.buyerEmail}
                    />
                    <span class="mt-1 block text-xs text-muted-foreground">
                      {draft.kind === "gift"
                        ? copy.details.giftBuyerEmailHint
                        : draft.kind === "renew"
                          ? copy.details.renewEmailHint
                          : copy.details.buyerEmailHint}
                    </span>
                    {#if detailErrors.buyerEmail}
                      <span class="mt-1 block text-xs text-destructive"
                        >{copy.fieldErrors.emailInvalid}</span
                      >
                    {/if}
                  </label>

                  {#if draft.kind === "gift"}
                    <label class="block">
                      <span class="mb-2 block text-sm font-medium">
                        {copy.details.recipientName}
                        <span class="text-muted-foreground">({copy.details.optional})</span>
                      </span>
                      <input
                        class="checkout-field"
                        name="recipientName"
                        maxlength="80"
                        placeholder={copy.details.recipientNamePlaceholder}
                        bind:value={draft.recipientName}
                      />
                    </label>
                    <label class="block">
                      <span class="mb-1.5 block text-sm font-medium"
                        >{copy.details.recipientEmail}</span
                      >
                      <input
                        class="checkout-field"
                        class:has-error={detailErrors.recipientEmail}
                        name="recipientEmail"
                        type="email"
                        required
                        placeholder="su@correo.com"
                        bind:value={draft.recipientEmail}
                        aria-invalid={!!detailErrors.recipientEmail}
                      />
                      <span class="mt-1 block text-xs text-muted-foreground"
                        >{copy.details.recipientEmailHint}</span
                      >
                      {#if detailErrors.recipientEmail}
                        <span class="mt-1 block text-xs text-destructive">
                          {detailErrors.recipientEmail === "same"
                            ? copy.fieldErrors.recipientSame
                            : copy.fieldErrors.emailInvalid}
                        </span>
                      {/if}
                    </label>
                  {/if}

                  <div class="flex items-center justify-between gap-3 pt-4">
                    <button type="button" class="checkout-secondary" onclick={() => goTo("kind")}
                      >{copy.actions.back}</button
                    >
                    <button type="submit" class="checkout-primary" data-testid="details-next"
                      >{copy.actions.next}</button
                    >
                  </div>
                </form>
              {:else if draft.step === "method"}
                <div class="space-y-6" data-testid="step-method">
                  <h2 class="text-lg font-bold">{copy.method.title}</h2>
                  <div class="grid sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      class="checkout-option relative text-left rounded-2xl border p-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed {draft.method ===
                      'paypal'
                        ? 'is-selected border-primary bg-primary/10'
                        : 'border-border/60 hover:border-primary/50'}"
                      onclick={() => (draft.method = "paypal")}
                      disabled={!!config && !config.paypal.ready}
                      aria-pressed={draft.method === "paypal"}
                      data-testid="method-paypal"
                    >
                      <span
                        class="absolute right-3 top-3 rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-500"
                        >{copy.method.paypal.badge}</span
                      >
                      <Icon icon="logos:paypal" class="h-6 w-auto mb-3" />
                      <span class="block font-semibold">{copy.method.paypal.title}</span>
                      <span class="block text-xs text-muted-foreground mt-1"
                        >{copy.method.paypal.text}</span
                      >
                    </button>
                    <button
                      type="button"
                      class="checkout-option relative text-left rounded-2xl border p-5 cursor-pointer {draft.method ===
                      'pago_movil'
                        ? 'is-selected border-primary bg-primary/10'
                        : 'border-border/60 hover:border-primary/50'}"
                      onclick={() => (draft.method = "pago_movil")}
                      aria-pressed={draft.method === "pago_movil"}
                      data-testid="method-pago_movil"
                    >
                      <span
                        class="absolute right-3 top-3 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-500"
                        >{copy.method.pagoMovil.badge}</span
                      >
                      <span
                        class="grid place-items-center w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 mb-3"
                      >
                        <Icon icon="mdi:cellphone-arrow-down" class="w-5 h-5" />
                      </span>
                      <span class="block font-semibold">{copy.method.pagoMovil.title}</span>
                      <span class="block text-xs text-muted-foreground mt-1"
                        >{copy.method.pagoMovil.text}</span
                      >
                    </button>
                  </div>

                  {#if draft.method === "pago_movil"}
                    <div>
                      <p class="mb-2 text-sm font-medium">{copy.method.months}</p>
                      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {#each MONTH_OPTIONS as option (option)}
                          <button
                            type="button"
                            class="checkout-option rounded-xl border px-2 py-3 text-sm font-semibold cursor-pointer {draft.months ===
                            option
                              ? 'is-selected border-primary bg-primary/10 text-primary'
                              : 'border-border/60 hover:border-primary/50'}"
                            onclick={() => (draft.months = option)}
                            aria-pressed={draft.months === option}
                            data-testid="months-{option}"
                          >
                            {monthLabel(option)}
                          </button>
                        {/each}
                      </div>
                    </div>
                  {/if}

                  <div class="flex items-center justify-between gap-3 pt-4">
                    <button type="button" class="checkout-secondary" onclick={() => goTo("details")}
                      >{copy.actions.back}</button
                    >
                    <button
                      type="button"
                      class="checkout-primary"
                      onclick={startPayment}
                      disabled={busy || !config || (draft.method === "pago_movil" && !rate)}
                      data-testid="start-payment"
                    >
                      {#if busy}
                        <Icon icon="mdi:loading" class="w-4 h-4 animate-spin" />
                        {copy.actions.preparing}
                      {:else}
                        {copy.actions.toPayment}
                        <Icon icon="mdi:arrow-right" class="w-4 h-4 primary-arrow" />
                      {/if}
                    </button>
                  </div>
                </div>
              {:else if draft.step === "payment"}
                <div class="space-y-5" data-testid="step-payment">
                  {#if draft.method === "paypal"}
                    <div>
                      <h2 class="text-lg font-bold">{copy.paypal.title}</h2>
                      <p class="mt-1 text-sm text-muted-foreground">{copy.paypal.text}</p>
                    </div>
                    {#if paypalState === "loading"}
                      <p class="text-sm text-muted-foreground animate-pulse">
                        {copy.paypal.loading}
                      </p>
                    {:else if paypalState === "approving"}
                      <p class="text-sm text-primary animate-pulse">{copy.paypal.approving}</p>
                    {/if}
                    <div
                      bind:this={paypalContainer}
                      class="max-w-md"
                      data-testid="paypal-buttons"
                    ></div>
                    {#if paypalState === "failed"}
                      <button
                        type="button"
                        class="checkout-secondary"
                        onclick={() => goTo("method")}>{copy.actions.back}</button
                      >
                    {/if}
                  {:else}
                    <div>
                      <h2 class="text-lg font-bold">{copy.pagoMovil.title}</h2>
                      <p class="mt-1 text-sm text-muted-foreground">{copy.pagoMovil.text}</p>
                    </div>
                    <dl class="grid sm:grid-cols-2 gap-3" data-testid="pago-movil-data">
                      {#each [{ id: "bank", label: copy.pagoMovil.bank, value: `${PAGO_MOVIL.bankCode} · ${PAGO_MOVIL.bankName}`, raw: PAGO_MOVIL.bankCode }, { id: "phone", label: copy.pagoMovil.phone, value: PAGO_MOVIL.phone, raw: PAGO_MOVIL.phone.replace("-", "") }, { id: "id", label: copy.pagoMovil.idNumber, value: PAGO_MOVIL.idNumber, raw: PAGO_MOVIL.idNumber }, { id: "amount", label: copy.pagoMovil.amount, value: purchase?.amountVes !== null && purchase?.amountVes !== undefined ? formatBolivars(purchase.amountVes, locale) : "—", raw: purchase?.amountVes?.toFixed(2) ?? "" }] as item (item.id)}
                        <div class="rounded-2xl border border-border/60 bg-background/50 p-3.5">
                          <dt class="text-xs text-muted-foreground">{item.label}</dt>
                          <dd class="mt-1 flex items-center justify-between gap-2">
                            <span
                              class="font-semibold tabular-nums {item.id === 'amount'
                                ? 'text-lg text-primary'
                                : ''}"
                              data-testid="pm-{item.id}">{item.value}</span
                            >
                            {#if item.raw}
                              {@render copyButton(item.raw, `pm-${item.id}`)}
                            {/if}
                          </dd>
                        </div>
                      {/each}
                    </dl>

                    <form
                      class="space-y-4 border-t border-border/60 pt-5"
                      onsubmit={(event) => {
                        event.preventDefault();
                        submitPagoMovil();
                      }}
                      novalidate
                      data-testid="pago-movil-form"
                    >
                      <h3 class="font-semibold">{copy.pagoMovil.formTitle}</h3>
                      <div class="grid sm:grid-cols-2 gap-4">
                        <label class="block">
                          <span class="mb-1.5 block text-sm font-medium"
                            >{copy.pagoMovil.reference}</span
                          >
                          <input
                            class="checkout-field font-mono"
                            class:has-error={paymentErrors.reference}
                            name="reference"
                            inputmode="numeric"
                            autocomplete="off"
                            maxlength="20"
                            bind:value={draft.payment.reference}
                          />
                          <span
                            class="mt-1 block text-xs {paymentErrors.reference
                              ? 'text-destructive'
                              : 'text-muted-foreground'}"
                          >
                            {fieldError(
                              paymentErrors.reference,
                              copy.fieldErrors.referenceInvalid
                            ) || copy.pagoMovil.referenceHint}
                          </span>
                        </label>
                        <label class="block">
                          <span class="mb-1.5 block text-sm font-medium"
                            >{copy.pagoMovil.payerPhone}</span
                          >
                          <input
                            class="checkout-field font-mono"
                            class:has-error={paymentErrors.phone}
                            name="phone"
                            type="tel"
                            inputmode="tel"
                            autocomplete="tel"
                            placeholder="0412-1234567"
                            bind:value={draft.payment.phone}
                          />
                          {#if paymentErrors.phone}
                            <span class="mt-1 block text-xs text-destructive"
                              >{copy.fieldErrors.phoneInvalid}</span
                            >
                          {/if}
                        </label>
                      </div>

                      <div>
                        <p class="mb-1.5 text-sm font-medium">{copy.pagoMovil.payerBank}</p>
                        <input
                          class="checkout-field"
                          name="bankSearch"
                          placeholder={copy.pagoMovil.searchBank}
                          autocomplete="off"
                          bind:value={bankQuery}
                        />
                        <div
                          class="mt-2 max-h-52 overflow-y-auto rounded-2xl border border-border/60 p-1.5 grid sm:grid-cols-2 gap-1"
                          role="listbox"
                          aria-label={copy.pagoMovil.payerBank}
                        >
                          {#each filteredBanks as bank (bank.code)}
                            <button
                              type="button"
                              role="option"
                              aria-selected={draft.payment.bank === bank.code}
                              class="text-left rounded-xl px-3 py-2 text-sm transition cursor-pointer {draft
                                .payment.bank === bank.code
                                ? 'bg-primary/15 text-primary font-semibold'
                                : 'hover:bg-muted/70'}"
                              onclick={() => (draft.payment.bank = bank.code)}
                              data-testid="bank-{bank.code}"
                            >
                              <span class="font-mono text-xs text-muted-foreground"
                                >{bank.code}</span
                              >
                              {bank.name}
                            </button>
                          {/each}
                        </div>
                        {#if paymentErrors.bank}
                          <span class="mt-1 block text-xs text-destructive"
                            >{copy.fieldErrors.bankInvalid}</span
                          >
                        {/if}
                      </div>

                      <div>
                        <p class="mb-1.5 text-sm font-medium">{copy.pagoMovil.date}</p>
                        <div class="flex flex-wrap gap-2">
                          {#each [{ value: today, label: copy.pagoMovil.today }, { value: yesterday, label: copy.pagoMovil.yesterday }] as option (option.value)}
                            <button
                              type="button"
                              class="checkout-option rounded-xl border px-4 py-2.5 text-sm font-semibold cursor-pointer {draft
                                .payment.date === option.value && !pickOtherDate
                                ? 'is-selected border-primary bg-primary/10 text-primary'
                                : 'border-border/60 hover:border-primary/50'}"
                              onclick={() => {
                                pickOtherDate = false;
                                draft.payment.date = option.value;
                              }}
                              data-testid="date-{option.label}"
                            >
                              {option.label}
                            </button>
                          {/each}
                          <button
                            type="button"
                            class="checkout-option rounded-xl border px-4 py-2.5 text-sm font-semibold cursor-pointer {pickOtherDate
                              ? 'is-selected border-primary bg-primary/10 text-primary'
                              : 'border-border/60 hover:border-primary/50'}"
                            onclick={() => (pickOtherDate = true)}
                          >
                            {copy.pagoMovil.otherDate}
                          </button>
                          {#if pickOtherDate}
                            <input
                              class="checkout-field w-auto"
                              type="date"
                              name="date"
                              max={today}
                              min={daysAgo(new Date(), 30)}
                              bind:value={draft.payment.date}
                            />
                          {/if}
                        </div>
                        {#if paymentErrors.date}
                          <span class="mt-1 block text-xs text-destructive"
                            >{copy.fieldErrors.dateInvalid}</span
                          >
                        {/if}
                      </div>

                      <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <button type="button" class="checkout-secondary" onclick={changeDetails}
                          >{copy.actions.changeData}</button
                        >
                        <button
                          type="submit"
                          class="checkout-primary"
                          disabled={busy}
                          data-testid="send-pago-movil"
                        >
                          {#if busy}
                            <Icon icon="mdi:loading" class="w-4 h-4 animate-spin" />
                            {copy.actions.sending}
                          {:else}
                            {copy.actions.send}
                          {/if}
                        </button>
                      </div>
                    </form>
                  {/if}

                  {#if draft.method === "paypal" && paypalState !== "approving"}
                    <button type="button" class="checkout-secondary" onclick={changeDetails}
                      >{copy.actions.changeData}</button
                    >
                  {/if}
                </div>
              {:else if purchase}
                <div class="space-y-5" data-testid="step-status" data-status={purchase.status}>
                  {#if purchase.status === "completed" && purchase.licenseKey}
                    <div class="text-center">
                      <div class="success-burst relative mx-auto w-20 h-20" aria-hidden="true">
                        <span class="success-ring"></span>
                        <span class="success-ring delay"></span>
                        {#each CONFETTI as piece, index (index)}
                          <span
                            class="confetti"
                            style:--angle="{piece.angle}deg"
                            style:--distance="{piece.distance}px"
                            style:--hue={piece.hue}
                          ></span>
                        {/each}
                        <span
                          class="checkout-pop relative grid place-items-center w-20 h-20 rounded-full bg-emerald-500/15 text-emerald-500"
                        >
                          <Icon icon="mdi:check-decagram" class="w-11 h-11" />
                        </span>
                      </div>
                      <h2 class="mt-3 text-2xl font-extrabold">
                        {purchase.kind === "renew"
                          ? copy.status.renewedTitle
                          : copy.status.completedTitle}
                      </h2>
                      <p class="text-sm text-muted-foreground">{copy.status.completedText}</p>
                    </div>
                    <div
                      class="rounded-2xl border border-primary/30 bg-gradient-to-br from-sky-500/10 to-violet-600/10 p-5 text-center"
                    >
                      <p
                        class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {copy.status.licenseKey}
                      </p>
                      <p
                        class="mt-2 font-mono text-xl sm:text-2xl font-bold tracking-wider break-all"
                        data-testid="license-key"
                      >
                        {purchase.licenseKey}
                      </p>
                      {#if purchase.kind !== "renew"}
                        <div class="mt-3 flex justify-center">
                          {@render copyButton(purchase.licenseKey, "license")}
                        </div>
                      {/if}
                      {#if purchase.paidUntil}
                        <p class="mt-3 text-sm text-muted-foreground">
                          {fill(copy.status.paidUntil, { date: formatDate(purchase.paidUntil) })}
                        </p>
                      {/if}
                    </div>
                    <p class="text-sm text-muted-foreground">
                      {purchase.kind === "gift"
                        ? fill(copy.status.giftText, { email: purchase.recipientEmail })
                        : purchase.kind === "renew"
                          ? copy.status.renewedText
                          : copy.status.activateHint}
                    </p>
                    {#if purchase.method === "paypal"}
                      <p class="text-xs text-muted-foreground">{copy.status.subscriptionNote}</p>
                    {/if}
                  {:else if purchase.status === "reviewing"}
                    <div class="text-center">
                      <span
                        class="mx-auto grid place-items-center w-16 h-16 rounded-full bg-amber-500/15 text-amber-500"
                      >
                        <Icon icon="mdi:timer-sand" class="w-8 h-8 animate-pulse" />
                      </span>
                      <h2 class="mt-3 text-xl font-bold">{copy.status.reviewingTitle}</h2>
                      <p class="mt-1 text-sm text-muted-foreground">{copy.status.reviewingText}</p>
                    </div>
                  {:else if purchase.status === "rejected"}
                    <div class="text-center">
                      <span
                        class="mx-auto grid place-items-center w-16 h-16 rounded-full bg-destructive/15 text-destructive"
                      >
                        <Icon icon="mdi:alert-circle-outline" class="w-8 h-8" />
                      </span>
                      <h2 class="mt-3 text-xl font-bold">{copy.status.rejectedTitle}</h2>
                      <p class="mt-1 text-sm text-muted-foreground">{copy.status.rejectedText}</p>
                      {#if purchase.reviewNote}
                        <p class="mt-2 text-sm font-medium">
                          {fill(copy.status.reason, { note: purchase.reviewNote })}
                        </p>
                      {/if}
                    </div>
                    <div class="flex justify-center">
                      <button type="button" class="checkout-primary" onclick={retryPagoMovil}
                        >{copy.actions.retry}</button
                      >
                    </div>
                  {:else if purchase.status === "cancelled"}
                    <div class="text-center">
                      <h2 class="text-xl font-bold">{copy.status.cancelledTitle}</h2>
                      <p class="mt-1 text-sm text-muted-foreground">{copy.status.cancelledText}</p>
                    </div>
                  {:else}
                    <div class="text-center">
                      <span
                        class="mx-auto grid place-items-center w-16 h-16 rounded-full bg-primary/15 text-primary"
                      >
                        <Icon icon="mdi:loading" class="w-8 h-8 animate-spin" />
                      </span>
                      <h2 class="mt-3 text-xl font-bold">
                        {awaitsPaypal ? copy.status.paypalPendingTitle : copy.status.pendingTitle}
                      </h2>
                      <p class="mt-1 text-sm text-muted-foreground">
                        {awaitsPaypal ? copy.status.paypalPendingText : copy.status.pendingText}
                      </p>
                    </div>
                    {#if !awaitsPaypal}
                      <div class="flex justify-center">
                        <button
                          type="button"
                          class="checkout-primary"
                          onclick={() => goTo("payment")}>{copy.actions.toPayment}</button
                        >
                      </div>
                    {/if}
                  {/if}

                  {#if privateLink}
                    <div class="rounded-2xl border border-border/60 bg-background/50 p-4">
                      <div class="flex items-center justify-between gap-3">
                        <p class="text-sm font-semibold">{copy.status.privateLink}</p>
                        {@render copyButton(privateLink, "link")}
                      </div>
                      <p class="mt-1 text-xs text-muted-foreground">
                        {copy.status.privateLinkHint}
                      </p>
                    </div>
                  {/if}

                  <div class="flex flex-wrap justify-center gap-3">
                    {#if draft.purchase && (purchase.status === "reviewing" || purchase.status === "pending")}
                      <button
                        type="button"
                        class="checkout-secondary"
                        onclick={() => draft.purchase && refresh(draft.purchase, false)}
                      >
                        {copy.actions.refresh}
                      </button>
                    {/if}
                    <button
                      type="button"
                      class="checkout-secondary"
                      onclick={startOver}
                      data-testid="start-over">{copy.actions.newPurchase}</button
                    >
                  </div>
                </div>
              {:else}
                <p class="text-center text-sm text-muted-foreground animate-pulse">
                  {copy.paypal.loading}
                </p>
              {/if}
            </div>
          {/key}
        </div>
      </section>

      <aside class="space-y-4 lg:sticky lg:top-6">
        <div
          class="rounded-3xl border border-border/60 dark:border-white/[0.08] bg-card/85 dark:bg-card/60 backdrop-blur-md p-6"
          data-testid="checkout-summary"
        >
          <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {copy.summary.title}
          </p>
          <p class="mt-2 font-semibold">{copy.summary.plan}</p>
          <p class="text-sm text-muted-foreground">
            {copy.kinds[draft.kind].title}{draft.method === "pago_movil"
              ? ` · ${monthLabel(draft.months)}`
              : ""}
          </p>
          {#if draft.buyerEmail && draft.kind !== "gift"}
            <p class="mt-2 text-xs text-muted-foreground break-all">
              {fill(copy.summary.forEmail, { email: draft.buyerEmail })}
            </p>
          {/if}
          {#if draft.kind === "gift" && draft.recipientEmail}
            <p class="mt-2 text-xs text-muted-foreground break-all">
              {fill(copy.summary.giftFor, { email: draft.recipientEmail })}
            </p>
          {/if}
          {#if draft.kind === "renew" && draft.buyerEmail}
            <p class="mt-2 text-xs text-muted-foreground break-all">
              {fill(copy.summary.renewFor, { email: draft.buyerEmail })}
            </p>
          {/if}
          <div class="mt-4 border-t border-border/60 pt-4 flex items-end justify-between gap-3">
            <span class="text-sm text-muted-foreground">{copy.summary.total}</span>
            <div class="text-right">
              <p class="text-2xl font-extrabold tabular-nums" data-testid="summary-total">
                {formatDollars(shownTotal.current, locale)}
              </p>
              {#if draft.method === "pago_movil" && totalVes !== null}
                <p
                  class="text-sm font-semibold text-primary tabular-nums"
                  data-testid="summary-ves"
                >
                  {formatBolivars(purchase?.amountVes ?? totalVes, locale)}
                </p>
              {:else if draft.method === "paypal"}
                <p class="text-xs text-muted-foreground">
                  {fill(copy.summary.monthly, { amount: formatDollars(priceUsd, locale) })}
                </p>
              {/if}
            </div>
          </div>
          {#if rate}
            <p class="mt-3 text-[11px] text-muted-foreground">
              {fill(copy.rateNote, {
                rate: rate.ves.toLocaleString(locale === "en" ? "en-US" : "es-VE", {
                  maximumFractionDigits: 2,
                }),
                date: rate.date,
              })}
            </p>
          {/if}
        </div>

        {#if pastPurchases.length > 0}
          <div
            class="rounded-3xl border border-border/60 dark:border-white/[0.08] bg-card/85 dark:bg-card/60 backdrop-blur-md p-6"
            data-testid="checkout-history"
          >
            <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {copy.history.title}
            </p>
            <ul class="mt-3 space-y-2">
              {#each pastPurchases as entry (entry.id)}
                <li class="flex items-center justify-between gap-2 text-sm">
                  <span class="min-w-0 truncate">
                    {copy.history.kinds[entry.kind]} · {new Date(
                      entry.createdAt
                    ).toLocaleDateString(locale === "en" ? "en-US" : "es-VE")}
                  </span>
                  <button
                    type="button"
                    class="shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 cursor-pointer"
                    onclick={() => refresh({ id: entry.id, token: entry.token }, true)}
                  >
                    {copy.history.open}
                  </button>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </aside>
    </div>
  </main>
</div>

<style>
  :global(.checkout-field) {
    width: 100%;
    border-radius: 0.875rem;
    border: 1px solid var(--color-border);
    background: color-mix(in srgb, var(--color-background) 70%, transparent);
    padding: 0.7rem 0.9rem;
    font-size: 0.925rem;
    color: var(--color-foreground);
    transition:
      border-color 0.15s,
      box-shadow 0.15s;
  }

  :global(.checkout-field:focus) {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent);
  }

  :global(.checkout-field.has-error) {
    border-color: var(--color-destructive);
  }

  :global(.checkout-primary) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 9999px;
    padding: 0.7rem 1.4rem;
    font-weight: 700;
    font-size: 0.925rem;
    color: white;
    background-image: linear-gradient(90deg, #0ea5e9, #2563eb, #7c3aed);
    box-shadow: 0 10px 24px -12px rgb(37 99 235 / 0.6);
    cursor: pointer;
    transition:
      transform 0.15s,
      filter 0.15s,
      opacity 0.15s;
  }

  :global(.checkout-primary:hover:not(:disabled)) {
    transform: translateY(-1px);
    filter: brightness(1.08);
  }

  :global(.checkout-primary:disabled) {
    opacity: 0.55;
    cursor: not-allowed;
  }

  :global(.checkout-secondary) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    padding: 0.65rem 1.2rem;
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
    cursor: pointer;
    transition:
      color 0.15s,
      background-color 0.15s;
  }

  :global(.checkout-secondary:hover) {
    color: var(--color-foreground);
    background: color-mix(in srgb, var(--color-muted) 70%, transparent);
  }

  :global(.checkout-field.has-error) {
    animation: checkout-shake 0.42s cubic-bezier(0.36, 0.07, 0.19, 0.97);
  }

  :global(.checkout-primary) {
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }

  :global(.checkout-primary::after) {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(
      110deg,
      transparent 30%,
      rgb(255 255 255 / 0.35) 50%,
      transparent 70%
    );
    transform: translateX(-120%);
    transition: transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  :global(.checkout-primary:hover:not(:disabled)::after) {
    transform: translateX(120%);
  }

  :global(.checkout-primary:active:not(:disabled)) {
    transform: scale(0.97);
  }

  :global(.checkout-primary:hover .primary-arrow) {
    transform: translateX(3px);
  }

  :global(.primary-arrow) {
    transition: transform 0.2s ease;
  }

  :global(.checkout-option) {
    transition:
      transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1),
      box-shadow 0.25s ease,
      border-color 0.2s ease,
      background-color 0.2s ease;
  }

  :global(.checkout-option:hover) {
    transform: translateY(-2px);
    box-shadow: 0 14px 30px -18px rgb(37 99 235 / 0.45);
  }

  :global(.checkout-option:active) {
    transform: translateY(0) scale(0.98);
  }

  :global(.checkout-option.is-selected) {
    box-shadow:
      0 0 0 1px var(--color-primary),
      0 16px 34px -18px rgb(37 99 235 / 0.6);
  }

  :global(.checkout-option.is-selected .option-icon) {
    animation: option-bounce 0.5s cubic-bezier(0.2, 1.4, 0.4, 1);
  }

  :global(.option-icon) {
    transition: transform 0.25s ease;
  }

  :global(.checkout-option:hover .option-icon) {
    transform: scale(1.08) rotate(-4deg);
  }

  .step-dot {
    transition:
      background-color 0.3s ease,
      box-shadow 0.3s ease,
      transform 0.3s ease;
  }

  .step-dot.is-current {
    animation: step-pulse 2.2s ease-in-out infinite;
  }

  .step-fill {
    transition: width 0.55s cubic-bezier(0.65, 0, 0.35, 1);
  }

  .checkout-banner {
    box-shadow: 0 18px 40px -28px rgb(15 23 42 / 0.6);
  }

  .checkout-banner.tone-soon {
    border-color: rgb(245 158 11 / 0.3);
    background-image: linear-gradient(
      110deg,
      rgb(245 158 11 / 0.14),
      rgb(245 158 11 / 0.04) 60%,
      transparent
    );
  }

  .checkout-banner.tone-soon .banner-icon {
    color: rgb(245 158 11);
    background: rgb(245 158 11 / 0.16);
  }

  .checkout-banner.tone-error {
    border-color: color-mix(in srgb, var(--color-destructive) 40%, transparent);
    background-image: linear-gradient(
      110deg,
      color-mix(in srgb, var(--color-destructive) 16%, transparent),
      color-mix(in srgb, var(--color-destructive) 4%, transparent) 60%,
      transparent
    );
    animation: checkout-shake 0.42s cubic-bezier(0.36, 0.07, 0.19, 0.97) 0.25s;
  }

  .checkout-banner.tone-error .banner-icon {
    color: var(--color-destructive);
    background: color-mix(in srgb, var(--color-destructive) 16%, transparent);
  }

  .checkout-banner.tone-info {
    border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
    background-image: linear-gradient(
      110deg,
      color-mix(in srgb, var(--color-primary) 14%, transparent),
      transparent 70%
    );
  }

  .checkout-banner.tone-info .banner-icon {
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 16%, transparent);
  }

  .checkout-pop {
    animation: checkout-pop 0.55s cubic-bezier(0.2, 1.4, 0.4, 1) both;
  }

  .success-ring {
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    border: 2px solid rgb(16 185 129 / 0.55);
    animation: success-ring 1.4s ease-out 0.15s both;
  }

  .success-ring.delay {
    animation-delay: 0.45s;
  }

  .confetti {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 7px;
    height: 7px;
    margin: -3.5px;
    border-radius: 2px;
    background: hsl(var(--hue) 90% 60%);
    opacity: 0;
    transform: rotate(var(--angle)) translateX(0);
    animation: confetti-burst 0.9s cubic-bezier(0.15, 0.8, 0.3, 1) 0.2s both;
  }

  @keyframes checkout-pop {
    from {
      opacity: 0;
      transform: scale(0.4);
    }
  }

  @keyframes checkout-shake {
    10%,
    90% {
      transform: translateX(-1px);
    }
    20%,
    80% {
      transform: translateX(3px);
    }
    30%,
    50%,
    70% {
      transform: translateX(-5px);
    }
    40%,
    60% {
      transform: translateX(5px);
    }
  }

  @keyframes option-bounce {
    0% {
      transform: scale(1);
    }
    40% {
      transform: scale(1.22) rotate(-6deg);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes step-pulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 rgb(37 99 235 / 0.45);
    }
    50% {
      box-shadow: 0 0 0 7px rgb(37 99 235 / 0);
    }
  }

  @keyframes success-ring {
    from {
      opacity: 0.9;
      transform: scale(0.8);
    }
    to {
      opacity: 0;
      transform: scale(2.1);
    }
  }

  @keyframes confetti-burst {
    0% {
      opacity: 1;
      transform: rotate(var(--angle)) translateX(0) scale(1);
    }
    100% {
      opacity: 0;
      transform: rotate(var(--angle)) translateX(var(--distance)) scale(0.6);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .checkout-pop,
    .step-dot.is-current,
    .success-ring,
    .confetti,
    .checkout-banner.tone-error,
    :global(.checkout-field.has-error),
    :global(.checkout-option.is-selected .option-icon) {
      animation: none;
    }

    :global(.checkout-option),
    :global(.checkout-option:hover),
    :global(.checkout-primary::after),
    .step-fill {
      transition: none;
      transform: none;
    }
  }
</style>
