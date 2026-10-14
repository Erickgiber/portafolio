import type {
  PagoMovilForm,
  PurchaseAccess,
  PurchaseKind,
  PurchaseMethod,
  PurchaseStatus,
} from "./state";

import { browserCountry } from "./rate";

export type Bank = { code: string; name: string };

export type LocalPrice = { country: string; currency: string; rate: number; date: string };

export type CheckoutConfig = {
  priceUsd: number;
  monthOptions: number[];
  paypal: { ready: boolean; clientId: string; planId: string; environment: "sandbox" | "live" };
  rate: { ves: number; date: string } | null;
  local: LocalPrice | null;
  banks: Bank[];
};

export type Purchase = {
  id: string;
  kind: PurchaseKind;
  method: PurchaseMethod;
  status: PurchaseStatus;
  months: number;
  amountUsd: number;
  amountVes: number | null;
  rateVes: number | null;
  rateDate: string | null;
  buyerEmail: string;
  recipientEmail: string;
  licenseKey: string | null;
  paidUntil: string | null;
  subscriptionStatus: string;
  paymentReference: string;
  reviewNote: string;
  createdAt: string;
  completedAt: string | null;
};

export class CheckoutError extends Error {
  constructor(
    readonly code: string,
    readonly fields: Record<string, string> = {}
  ) {
    super(code);
  }
}

const API_URL = ((import.meta.env.VITE_VITRAL_API_URL as string | undefined) ?? "").replace(
  /\/$/,
  ""
);
const REQUEST_TIMEOUT_MS = 15_000;

export const checkoutAvailable = API_URL !== "";

async function request<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  if (!checkoutAvailable) {
    throw new CheckoutError("unavailable");
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.token ? { "X-Purchase-Token": init.token } : {}),
      },
      signal: init.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      redirect: "error",
    });
  } catch {
    throw new CheckoutError("network");
  }

  const payload = (await response.json().catch(() => null)) as
    | ({ error?: string; fields?: Record<string, string> } & T)
    | null;
  if (!payload) {
    throw new CheckoutError("server_error");
  }
  if (!response.ok) {
    throw new CheckoutError(payload.error ?? "server_error", payload.fields ?? {});
  }
  return payload;
}

function isConfig(value: Partial<CheckoutConfig>): value is CheckoutConfig {
  return (
    typeof value.priceUsd === "number" &&
    typeof value.paypal?.ready === "boolean" &&
    Array.isArray(value.banks) &&
    Array.isArray(value.monthOptions) &&
    (value.local === null || typeof value.local?.currency === "string")
  );
}

export async function loadConfig(signal?: AbortSignal): Promise<CheckoutConfig> {
  const country = typeof navigator === "undefined" ? "" : browserCountry(navigator.language);
  const query = country ? `?country=${country}` : "";
  const config = await request<Partial<CheckoutConfig>>(`/api/checkout/config${query}`, { signal });
  if (!isConfig(config)) {
    throw new CheckoutError("server_error");
  }
  return config;
}

export async function createPurchase(
  body: Record<string, unknown>
): Promise<{ purchase: Purchase; access: PurchaseAccess }> {
  const result = await request<{ purchase: Purchase; token: string }>("/api/checkout/purchases", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return { purchase: result.purchase, access: { id: result.purchase.id, token: result.token } };
}

export async function fetchPurchase(
  access: PurchaseAccess,
  signal?: AbortSignal
): Promise<Purchase> {
  const result = await request<{ purchase: Purchase }>(`/api/checkout/purchases/${access.id}`, {
    token: access.token,
    signal,
  });
  return result.purchase;
}

export async function linkSubscription(
  access: PurchaseAccess,
  subscriptionId: string
): Promise<Purchase> {
  const result = await request<{ purchase: Purchase }>(
    `/api/checkout/purchases/${access.id}/paypal`,
    {
      method: "POST",
      token: access.token,
      body: JSON.stringify({ subscriptionId }),
    }
  );
  return result.purchase;
}

export async function sendPagoMovil(
  access: PurchaseAccess,
  payment: PagoMovilForm
): Promise<Purchase> {
  const result = await request<{ purchase: Purchase }>(
    `/api/checkout/purchases/${access.id}/pago-movil`,
    {
      method: "POST",
      token: access.token,
      body: JSON.stringify(payment),
    }
  );
  return result.purchase;
}
