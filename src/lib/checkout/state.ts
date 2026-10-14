export type PurchaseKind = "new" | "gift" | "renew";
export type PurchaseMethod = "paypal" | "pago_movil";
export type PurchaseStatus = "pending" | "reviewing" | "completed" | "rejected" | "cancelled";
export type CheckoutStep = "kind" | "details" | "method" | "payment" | "status";

export const STEPS: CheckoutStep[] = ["kind", "details", "method", "payment", "status"];
export const MONTH_OPTIONS = [1, 3, 6, 12] as const;
export const DRAFT_KEY = "vitral_checkout_draft_v1";
export const HISTORY_KEY = "vitral_checkout_purchases_v1";
export const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const HISTORY_LIMIT = 10;

export type PurchaseAccess = { id: string; token: string };

export type PagoMovilForm = {
  reference: string;
  phone: string;
  bank: string;
  date: string;
};

export type CheckoutDraft = {
  step: CheckoutStep;
  kind: PurchaseKind;
  method: PurchaseMethod;
  months: number;
  buyerName: string;
  buyerEmail: string;
  recipientName: string;
  recipientEmail: string;
  payment: PagoMovilForm;
  purchase: PurchaseAccess | null;
  savedAt: number;
};

export type HistoryEntry = PurchaseAccess & { createdAt: number; kind: PurchaseKind };

export type DetailErrors = Partial<
  Record<"buyerEmail" | "recipientEmail" | "buyerName" | "recipientName", "invalid" | "same">
>;

export type PaymentErrors = Partial<Record<keyof PagoMovilForm, "invalid">>;

type Storage = Pick<globalThis.Storage, "getItem" | "setItem" | "removeItem">;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^04(12|14|16|22|24|26)\d{7}$/;
const REFERENCE_PATTERN = /^\d{4,20}$/;
const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,64}$/;
const NAME_LIMIT = 80;
const DAY_MS = 86_400_000;

export function emptyDraft(now: number): CheckoutDraft {
  return {
    step: "kind",
    kind: "new",
    method: "paypal",
    months: 1,
    buyerName: "",
    buyerEmail: "",
    recipientName: "",
    recipientEmail: "",
    payment: { reference: "", phone: "", bank: "", date: "" },
    purchase: null,
    savedAt: now,
  };
}

export function isEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value.trim());
}

export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  const local = digits.startsWith("58") && digits.length === 12 ? `0${digits.slice(2)}` : digits;
  return PHONE_PATTERN.test(local) ? `${local.slice(0, 4)}-${local.slice(4)}` : "";
}

export function normalizeReference(value: string): string {
  const digits = value.replace(/\D/g, "");
  return REFERENCE_PATTERN.test(digits) ? digits : "";
}

export function isoDate(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function daysAgo(today: Date, days: number): string {
  return isoDate(new Date(today.getTime() - days * DAY_MS));
}

export function isPaymentDate(value: string, today: Date): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00`);
  const end = new Date(`${isoDate(today)}T00:00:00`).getTime() + DAY_MS;
  return (
    !Number.isNaN(date.getTime()) && date.getTime() <= end && date.getTime() >= end - 31 * DAY_MS
  );
}

export function validateDetails(draft: CheckoutDraft): DetailErrors {
  const errors: DetailErrors = {};
  if (draft.kind !== "renew" && draft.buyerName.length > NAME_LIMIT) {
    errors.buyerName = "invalid";
  }
  if (!isEmail(draft.buyerEmail)) {
    errors.buyerEmail = "invalid";
  }
  if (draft.kind === "gift") {
    if (!isEmail(draft.recipientEmail)) {
      errors.recipientEmail = "invalid";
    } else if (
      draft.recipientEmail.trim().toLowerCase() === draft.buyerEmail.trim().toLowerCase()
    ) {
      errors.recipientEmail = "same";
    }
    if (draft.recipientName.length > NAME_LIMIT) {
      errors.recipientName = "invalid";
    }
  }
  return errors;
}

export function validatePayment(
  payment: PagoMovilForm,
  bankCodes: string[],
  today: Date
): PaymentErrors {
  const errors: PaymentErrors = {};
  if (!normalizeReference(payment.reference)) {
    errors.reference = "invalid";
  }
  if (!normalizePhone(payment.phone)) {
    errors.phone = "invalid";
  }
  if (!bankCodes.includes(payment.bank)) {
    errors.bank = "invalid";
  }
  if (!isPaymentDate(payment.date, today)) {
    errors.date = "invalid";
  }
  return errors;
}

export function purchaseRequest(draft: CheckoutDraft) {
  return {
    kind: draft.kind,
    method: draft.method,
    months: draft.method === "paypal" ? 1 : draft.months,
    buyerName: draft.kind === "renew" ? "" : draft.buyerName.trim(),
    buyerEmail: draft.buyerEmail.trim().toLowerCase(),
    recipientName: draft.kind === "gift" ? draft.recipientName.trim() : "",
    recipientEmail: draft.kind === "gift" ? draft.recipientEmail.trim().toLowerCase() : "",
  };
}

export function isPurchaseAccess(value: unknown): value is PurchaseAccess {
  const access = value as Partial<PurchaseAccess> | null;
  return (
    !!access &&
    typeof access.id === "string" &&
    typeof access.token === "string" &&
    ID_PATTERN.test(access.id) &&
    TOKEN_PATTERN.test(access.token)
  );
}

function readJson(storage: Storage, key: string): unknown {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(storage: Storage, key: string, value: unknown) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {}
}

function pick<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return options.find((option) => option === value) ?? fallback;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.slice(0, 300) : "";
}

export function restoreDraft(storage: Storage, now: number): CheckoutDraft | null {
  const saved = readJson(storage, DRAFT_KEY) as Partial<CheckoutDraft> | null;
  if (!saved || typeof saved.savedAt !== "number" || now - saved.savedAt > DRAFT_MAX_AGE_MS) {
    return null;
  }

  const base = emptyDraft(now);
  const payment = (saved.payment ?? {}) as Partial<PagoMovilForm>;
  const purchase = isPurchaseAccess(saved.purchase) ? saved.purchase : null;
  const step = pick(saved.step, STEPS, "kind");
  return {
    step: !purchase && (step === "payment" || step === "status") ? "method" : step,
    kind: pick(saved.kind, ["new", "gift", "renew"] as const, base.kind),
    method: pick(saved.method, ["paypal", "pago_movil"] as const, base.method),
    months: MONTH_OPTIONS.find((months) => months === saved.months) ?? base.months,
    buyerName: text(saved.buyerName),
    buyerEmail: text(saved.buyerEmail),
    recipientName: text(saved.recipientName),
    recipientEmail: text(saved.recipientEmail),
    payment: {
      reference: text(payment.reference),
      phone: text(payment.phone),
      bank: text(payment.bank),
      date: text(payment.date),
    },
    purchase,
    savedAt: saved.savedAt,
  };
}

export function saveDraft(storage: Storage, draft: CheckoutDraft, now: number) {
  writeJson(storage, DRAFT_KEY, { ...draft, savedAt: now });
}

export function clearDraft(storage: Storage) {
  try {
    storage.removeItem(DRAFT_KEY);
  } catch {}
}

export function readHistory(storage: Storage): HistoryEntry[] {
  const saved = readJson(storage, HISTORY_KEY);
  if (!Array.isArray(saved)) {
    return [];
  }
  return saved
    .filter(
      (entry): entry is HistoryEntry =>
        isPurchaseAccess(entry) && typeof (entry as HistoryEntry).createdAt === "number"
    )
    .map((entry) => ({
      id: entry.id,
      token: entry.token,
      createdAt: entry.createdAt,
      kind: pick(entry.kind, ["new", "gift", "renew"] as const, "new"),
    }))
    .slice(0, HISTORY_LIMIT);
}

export function rememberPurchase(storage: Storage, entry: HistoryEntry): HistoryEntry[] {
  const history = [entry, ...readHistory(storage).filter((saved) => saved.id !== entry.id)].slice(
    0,
    HISTORY_LIMIT
  );
  writeJson(storage, HISTORY_KEY, history);
  return history;
}

export function accessFromUrl(search: string): PurchaseAccess | null {
  const params = new URLSearchParams(search);
  const access = { id: params.get("compra") ?? "", token: params.get("token") ?? "" };
  return isPurchaseAccess(access) ? access : null;
}

export function purchaseUrl(base: string, access: PurchaseAccess): string {
  const url = new URL(base);
  url.search = new URLSearchParams({ compra: access.id, token: access.token }).toString();
  url.hash = "";
  return url.toString();
}

export function amountUsd(months: number, priceUsd: number): number {
  return Math.round(priceUsd * months * 100) / 100;
}

export function amountVes(usd: number, rate: number): number {
  return Math.round(usd * rate * 100) / 100;
}

export function stepAfterLoad(
  status: PurchaseStatus,
  method: PurchaseMethod,
  hasSubscription: boolean
): CheckoutStep {
  if (status !== "pending") {
    return "status";
  }
  return method === "paypal" && hasSubscription ? "status" : "payment";
}

export function kindFromUrl(search: string): PurchaseKind | null {
  const kind = new URLSearchParams(search).get("tipo");
  return kind === "new" || kind === "gift" || kind === "renew" ? kind : null;
}

export function emailFromUrl(search: string): string {
  const email = (new URLSearchParams(search).get("email") ?? "").trim().toLowerCase();
  return isEmail(email) ? email : "";
}
