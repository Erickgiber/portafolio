import { translations, type Locale, type Translations } from "../i18n/translations";

function createI18nStore() {
  let locale = $state<Locale>("es");
  let t = $derived<Translations>(translations[locale]);

  function updateDocumentMeta() {
    if (typeof document === "undefined") return;
    const currentT = translations[locale];
    if (currentT?.meta?.title) {
      document.title = currentT.meta.title;
    }
    document.documentElement.lang = locale;
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl && currentT?.meta?.description) {
      descEl.setAttribute("content", currentT.meta.description);
    }
  }

  function initLocale() {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("portfolio_lang") as Locale | null;
      if (stored === "es" || stored === "en") {
        locale = stored;
        updateDocumentMeta();
        return;
      }
      const browserLang = navigator.language?.slice(0, 2).toLowerCase();
      const initial: Locale = browserLang === "en" ? "en" : "es";
      locale = initial;
      updateDocumentMeta();
    } catch {
      locale = "es";
      updateDocumentMeta();
    }
  }

  function setLocale(newLocale: Locale) {
    locale = newLocale;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("portfolio_lang", newLocale);
        updateDocumentMeta();
      } catch {}
    }
  }

  function toggleLocale() {
    const nextLocale: Locale = locale === "es" ? "en" : "es";
    setLocale(nextLocale);
  }

  initLocale();

  return {
    get locale() {
      return locale;
    },
    get t() {
      return t;
    },
    setLocale,
    toggleLocale,
    initLocale,
  };
}

export const i18nStore = createI18nStore();
