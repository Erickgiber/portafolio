import { describe, expect, it } from "vitest";
import {
  DRAFT_KEY,
  DRAFT_MAX_AGE_MS,
  HISTORY_KEY,
  HISTORY_LIMIT,
  accessFromUrl,
  amountUsd,
  amountVes,
  emailFromUrl,
  emptyDraft,
  kindFromUrl,
  normalizePhone,
  normalizeReference,
  purchaseRequest,
  purchaseUrl,
  readHistory,
  rememberPurchase,
  restoreDraft,
  saveDraft,
  stepAfterLoad,
  validateDetails,
  validatePayment,
} from "../../src/lib/checkout/state";

const ACCESS = {
  id: "3f2b8c1e-4a5d-4b6c-9d7e-1f2a3b4c5d6e",
  token: "abcdefghijklmnopqrstuvwxyz012345",
};
const NOW = Date.parse("2026-10-14T15:00:00Z");

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
}

describe("details", () => {
  it("requires a valid buyer email", () => {
    const draft = { ...emptyDraft(NOW), buyerEmail: "nope" };
    expect(validateDetails(draft)).toEqual({ buyerEmail: "invalid" });
    expect(validateDetails({ ...draft, buyerEmail: "ana@mail.com" })).toEqual({});
  });

  it("requires a different recipient email for gifts", () => {
    const draft = { ...emptyDraft(NOW), kind: "gift" as const, buyerEmail: "ana@mail.com" };
    expect(validateDetails(draft).recipientEmail).toBe("invalid");
    expect(validateDetails({ ...draft, recipientEmail: "ANA@mail.com" }).recipientEmail).toBe(
      "same"
    );
    expect(validateDetails({ ...draft, recipientEmail: "leo@mail.com" })).toEqual({});
  });

  it("renews with the email alone", () => {
    const draft = { ...emptyDraft(NOW), kind: "renew" as const, buyerName: "x".repeat(200) };
    expect(validateDetails(draft)).toEqual({ buyerEmail: "invalid" });
    expect(validateDetails({ ...draft, buyerEmail: "ana@mail.com" })).toEqual({});
    expect(purchaseRequest({ ...draft, buyerEmail: "ana@mail.com" }).buyerName).toBe("");
  });

  it("sends only the fields that apply to each kind", () => {
    const request = purchaseRequest({
      ...emptyDraft(NOW),
      kind: "new",
      method: "paypal",
      months: 6,
      buyerEmail: " Ana@Mail.com ",
      recipientEmail: "leo@mail.com",
    });
    expect(request).toMatchObject({ months: 1, buyerEmail: "ana@mail.com", recipientEmail: "" });
  });
});

describe("pago móvil", () => {
  const banks = ["0191", "0134"];
  const today = new Date("2026-10-14T12:00:00");

  it("normalizes phones and references", () => {
    expect(normalizePhone("0412 020 4257")).toBe("0412-0204257");
    expect(normalizePhone("+58 424 1234567")).toBe("0424-1234567");
    expect(normalizePhone("0212-1234567")).toBe("");
    expect(normalizeReference("ref 1234-5678")).toBe("12345678");
    expect(normalizeReference("12")).toBe("");
  });

  it("reports every missing field", () => {
    expect(validatePayment({ reference: "", phone: "", bank: "", date: "" }, banks, today)).toEqual(
      {
        reference: "invalid",
        phone: "invalid",
        bank: "invalid",
        date: "invalid",
      }
    );
  });

  it("accepts a complete payment from the last days", () => {
    expect(
      validatePayment(
        { reference: "00123456", phone: "04141234567", bank: "0134", date: "2026-10-13" },
        banks,
        today
      )
    ).toEqual({});
  });

  it("rejects dates in the future or too old", () => {
    const base = { reference: "00123456", phone: "04141234567", bank: "0134" };
    expect(validatePayment({ ...base, date: "2026-10-20" }, banks, today).date).toBe("invalid");
    expect(validatePayment({ ...base, date: "2026-08-01" }, banks, today).date).toBe("invalid");
  });
});

describe("draft storage", () => {
  it("restores a saved draft with its purchase", () => {
    const storage = memoryStorage();
    const draft = {
      ...emptyDraft(NOW),
      step: "payment" as const,
      buyerEmail: "ana@mail.com",
      purchase: ACCESS,
    };
    saveDraft(storage, draft, NOW);
    expect(restoreDraft(storage, NOW + 1000)).toMatchObject({
      step: "payment",
      buyerEmail: "ana@mail.com",
      purchase: ACCESS,
    });
  });

  it("goes back to the payment method when a later step lost its purchase", () => {
    const storage = memoryStorage();
    saveDraft(storage, { ...emptyDraft(NOW), step: "status" }, NOW);
    expect(restoreDraft(storage, NOW)?.step).toBe("method");
  });

  it("forgets drafts older than a week", () => {
    const storage = memoryStorage();
    saveDraft(storage, emptyDraft(NOW), NOW);
    expect(restoreDraft(storage, NOW + DRAFT_MAX_AGE_MS + 1)).toBeNull();
  });

  it("ignores corrupted or tampered data", () => {
    expect(restoreDraft(memoryStorage({ [DRAFT_KEY]: "{not json" }), NOW)).toBeNull();
    const tampered = memoryStorage({
      [DRAFT_KEY]: JSON.stringify({
        savedAt: NOW,
        step: "hacked",
        kind: "free",
        method: "cash",
        months: 99,
        purchase: { id: "x", token: "y" },
      }),
    });
    expect(restoreDraft(tampered, NOW)).toMatchObject({
      step: "kind",
      kind: "new",
      method: "paypal",
      months: 1,
      purchase: null,
    });
  });

  it("keeps working when storage throws", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    expect(restoreDraft(broken, NOW)).toBeNull();
    expect(() => saveDraft(broken, emptyDraft(NOW), NOW)).not.toThrow();
    expect(readHistory(broken)).toEqual([]);
  });
});

describe("purchase history", () => {
  it("keeps the newest purchases first without duplicates", () => {
    const storage = memoryStorage();
    rememberPurchase(storage, { ...ACCESS, createdAt: 1, kind: "new" });
    const other = { id: "4f2b8c1e-4a5d-4b6c-9d7e-1f2a3b4c5d6e", token: ACCESS.token };
    rememberPurchase(storage, { ...other, createdAt: 2, kind: "gift" });
    const history = rememberPurchase(storage, { ...ACCESS, createdAt: 3, kind: "new" });
    expect(history.map((entry) => entry.id)).toEqual([ACCESS.id, other.id]);
    expect(JSON.parse(storage.data.get(HISTORY_KEY)!)).toHaveLength(2);
  });

  it("keeps at most the configured number of purchases", () => {
    const storage = memoryStorage();
    for (let index = 0; index < HISTORY_LIMIT + 3; index++) {
      const id = `${index.toString(16).padStart(8, "0")}-4a5d-4b6c-9d7e-1f2a3b4c5d6e`;
      rememberPurchase(storage, { id, token: ACCESS.token, createdAt: index, kind: "new" });
    }
    expect(readHistory(storage)).toHaveLength(HISTORY_LIMIT);
  });
});

describe("private links", () => {
  it("round-trips the purchase access through the URL", () => {
    const url = purchaseUrl("https://erickgiber.dev/vitral/comprar/", ACCESS);
    expect(accessFromUrl(new URL(url).search)).toEqual(ACCESS);
  });

  it("ignores links without a valid id or token", () => {
    expect(accessFromUrl("?compra=abc&token=short")).toBeNull();
    expect(accessFromUrl("")).toBeNull();
  });

  it("reads a valid email sent by the Vitral app", () => {
    expect(emailFromUrl("?tipo=renew&email=Ana%40Mail.com")).toBe("ana@mail.com");
    expect(emailFromUrl("?tipo=renew&email=not-an-email")).toBe("");
    expect(emailFromUrl("?tipo=renew")).toBe("");
    expect(emailFromUrl("?tipo=renew&email=ana.perez%2Bvip%40mail.com")).toBe(
      "ana.perez+vip@mail.com"
    );
  });

  it("reads the preselected purchase kind", () => {
    expect(kindFromUrl("?tipo=gift")).toBe("gift");
    expect(kindFromUrl("?tipo=other")).toBeNull();
  });
});

describe("amounts and steps", () => {
  it("computes dollars and bolívares", () => {
    expect(amountUsd(3, 2)).toBe(6);
    expect(amountVes(6, 36.5179)).toBe(219.11);
  });

  it("resumes on the right step for each purchase state", () => {
    expect(stepAfterLoad("pending", "pago_movil", false)).toBe("payment");
    expect(stepAfterLoad("pending", "paypal", false)).toBe("payment");
    expect(stepAfterLoad("pending", "paypal", true)).toBe("status");
    expect(stepAfterLoad("reviewing", "pago_movil", false)).toBe("status");
    expect(stepAfterLoad("completed", "paypal", true)).toBe("status");
  });
});
