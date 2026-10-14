const RATES_URL = "https://open.er-api.com/v6/latest/USD";
const CACHE_KEY = "vitral_ves_rate_v1";
const CACHE_MS = 30 * 60_000;
const REQUEST_TIMEOUT_MS = 6_000;

export type BolivarRate = { ves: number; date: string };

function cached(): (BolivarRate & { fetchedAt: number }) | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? "null");
    return saved && Number.isFinite(saved.ves) && Date.now() - saved.fetchedAt < CACHE_MS
      ? saved
      : null;
  } catch {
    return null;
  }
}

export async function loadBolivarRate(): Promise<BolivarRate | null> {
  const saved = cached();
  if (saved) {
    return { ves: saved.ves, date: saved.date };
  }

  try {
    const response = await fetch(RATES_URL, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    const payload = (await response.json()) as {
      result?: string;
      rates?: Record<string, number>;
      time_last_update_unix?: number;
    };
    const ves = Number(payload.rates?.VES);
    if (!response.ok || payload.result !== "success" || !Number.isFinite(ves) || ves <= 0) {
      return null;
    }

    const date = new Date((payload.time_last_update_unix ?? Date.now() / 1000) * 1000)
      .toISOString()
      .slice(0, 10);
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ves, date, fetchedAt: Date.now() }));
    } catch {}
    return { ves, date };
  } catch {
    return null;
  }
}

export function formatBolivars(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "es-VE", {
    style: "currency",
    currency: "VES",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDollars(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "es-VE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}
