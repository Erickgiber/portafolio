function numberLocale(locale: string, country?: string): string {
  const language = locale === "en" ? "en" : "es";
  return country ? `${language}-${country}` : language === "en" ? "en-US" : "es-VE";
}

export function formatMoney(
  amount: number,
  currency: string,
  locale: string,
  country?: string
): string {
  try {
    return new Intl.NumberFormat(numberLocale(locale, country), {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function formatBolivars(amount: number, locale: string): string {
  return formatMoney(amount, "VES", locale, "VE");
}

export function formatDollars(amount: number, locale: string): string {
  return formatMoney(amount, "USD", locale);
}

export function browserCountry(language: string): string {
  try {
    const region = new Intl.Locale(language).maximize().region ?? "";
    return /^[A-Z]{2}$/.test(region) ? region : "";
  } catch {
    return "";
  }
}
