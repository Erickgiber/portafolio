import { expect, test, type Page, type Route } from "@playwright/test";
import {
  BUTTON,
  PAD_IDS,
  connectGamepad,
  installGamepadMock,
  pressButton,
} from "./support/gamepad";

const API = "https://api.vitral.test";
const PURCHASE_ID = "3f2b8c1e-4a5d-4b6c-9d7e-1f2a3b4c5d6e";
const TOKEN = "abcdefghijklmnopqrstuvwxyz012345";
const RATE = 36.5;

type Purchase = Record<string, unknown>;

function purchase(overrides: Purchase = {}): Purchase {
  return {
    id: PURCHASE_ID,
    kind: "new",
    method: "pago_movil",
    status: "pending",
    months: 3,
    amountUsd: 6,
    amountVes: 219,
    rateVes: RATE,
    rateDate: "2026-10-14",
    buyerEmail: "ana@mail.com",
    recipientEmail: "",
    licenseKey: null,
    paidUntil: null,
    subscriptionStatus: "",
    paymentReference: "",
    reviewNote: "",
    createdAt: "2026-10-14T15:00:00.000Z",
    completedAt: null,
    ...overrides,
  };
}

async function mockApi(page: Page, state: { current: Purchase }) {
  const requests: { method: string; url: string; body: unknown; token: string | null }[] = [];
  await page.route("https://open.er-api.com/**", (route) =>
    route.fulfill({
      json: { result: "success", rates: { VES: RATE }, time_last_update_unix: 1_792_000_000 },
    })
  );
  await page.route(`${API}/**`, async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    requests.push({
      method: request.method(),
      url: url.pathname,
      body: request.postDataJSON?.() ?? null,
      token: request.headers()["x-purchase-token"] ?? null,
    });
    if (url.pathname === "/api/checkout/config") {
      return route.fulfill({
        json: {
          priceUsd: 2,
          monthOptions: [1, 3, 6, 12],
          paypal: { ready: false, clientId: "", planId: "", environment: "sandbox" },
          rate: { ves: RATE, date: "2026-10-14" },
          local: { country: "VE", currency: "VES", rate: RATE, date: "2026-10-14" },
          banks: [
            { code: "0134", name: "Banesco" },
            { code: "0191", name: "BNC Banco Nacional de Crédito" },
          ],
        },
      });
    }
    if (url.pathname === "/api/checkout/purchases" && request.method() === "POST") {
      const body = request.postDataJSON() as Purchase;
      state.current = purchase({ ...body, amountUsd: Number(body.months) * 2 });
      return route.fulfill({ status: 201, json: { purchase: state.current, token: TOKEN } });
    }
    if (url.pathname.endsWith("/pago-movil")) {
      const body = request.postDataJSON() as Purchase;
      state.current = { ...state.current, status: "reviewing", paymentReference: body.reference };
      return route.fulfill({ json: { purchase: state.current } });
    }
    if (url.pathname === `/api/checkout/purchases/${PURCHASE_ID}`) {
      return route.fulfill({ json: { purchase: state.current } });
    }
    return route.fulfill({ status: 404, json: { error: "not_found" } });
  });
  return requests;
}

test("buys a license with Pago Móvil and keeps the progress after reloading", async ({ page }) => {
  const state = { current: purchase() };
  const requests = await mockApi(page, state);
  await page.goto("/vitral/comprar/");

  await page.getByTestId("kind-new").click();
  await page.locator('input[name="buyerEmail"]').fill("Ana@Mail.com");
  await page.getByTestId("details-next").click();

  await page.getByTestId("method-pago_movil").click();
  await page.getByTestId("months-3").click();
  await expect(page.getByTestId("summary-total")).toContainText("6");
  await page.getByTestId("start-payment").click();

  await expect(page.getByTestId("step-payment")).toBeVisible();
  await expect(page.getByTestId("pm-phone")).toHaveText("0412-0204257");
  await expect(page.getByTestId("pm-id")).toHaveText("V28733885");
  await expect(page.getByTestId("pm-bank")).toContainText("0191");
  await expect(page).toHaveURL(new RegExp(`compra=${PURCHASE_ID}`));

  const created = requests.find((entry) => entry.url === "/api/checkout/purchases");
  expect(created?.body).toMatchObject({
    kind: "new",
    method: "pago_movil",
    months: 3,
    buyerEmail: "ana@mail.com",
  });

  await page.locator('input[name="reference"]').fill("00123456");
  await page.reload();
  await expect(page.getByTestId("step-payment")).toBeVisible();
  await expect(page.locator('input[name="reference"]')).toHaveValue("00123456");

  await page.getByTestId("send-pago-movil").click();
  await expect(page.getByText("Escribe un teléfono como 0412-1234567.")).toBeVisible();
  await expect(page.getByText("Elige el banco desde el que pagaste.")).toBeVisible();
  expect(requests.some((entry) => entry.url.endsWith("/pago-movil"))).toBe(false);
  await page.locator('input[name="phone"]').fill("0414 1234567");
  await page.getByTestId("bank-0134").click();
  await page.getByRole("button", { name: "Hoy" }).click();
  await page.getByTestId("send-pago-movil").click();

  await expect(page.getByTestId("step-status")).toHaveAttribute("data-status", "reviewing");
  const sent = requests.find((entry) => entry.url.endsWith("/pago-movil"));
  expect(sent?.token).toBe(TOKEN);
  expect(sent?.body).toMatchObject({ reference: "00123456", bank: "0134" });

  await page.reload();
  await expect(page.getByTestId("step-status")).toHaveAttribute("data-status", "reviewing");
  await expect(page.getByTestId("checkout-history")).toBeVisible();
});

test("a gift needs a recipient email different from the buyer's", async ({ page }) => {
  await mockApi(page, { current: purchase() });
  await page.goto("/vitral/comprar/?tipo=gift");
  await expect(page.getByTestId("step-details")).toBeVisible();
  await page.locator('input[name="buyerEmail"]').fill("ana@mail.com");
  await page.locator('input[name="recipientEmail"]').fill("ANA@mail.com");
  await page.getByTestId("details-next").click();
  await expect(page.getByText("Debe ser un correo distinto al tuyo.")).toBeVisible();

  await page.locator('input[name="recipientEmail"]').fill("leo@mail.com");
  await page.getByTestId("details-next").click();
  await expect(page.getByTestId("step-method")).toBeVisible();
});

test("the private link shows a completed purchase with its license key", async ({ page }) => {
  await mockApi(page, {
    current: purchase({
      status: "completed",
      licenseKey: "VTRL-AB12C-DE34F-GH56J",
      paidUntil: "2027-01-14T15:00:00.000Z",
    }),
  });
  await page.goto(`/vitral/comprar/?compra=${PURCHASE_ID}&token=${TOKEN}`);
  await expect(page.getByTestId("step-status")).toHaveAttribute("data-status", "completed");
  await expect(page.getByTestId("license-key")).toHaveText("VTRL-AB12C-DE34F-GH56J");
});

test("PayPal is offered only when the server has it configured", async ({ page }) => {
  await mockApi(page, { current: purchase() });
  await page.goto("/vitral/comprar/");
  await page.getByTestId("kind-new").click();
  await page.locator('input[name="buyerEmail"]').fill("ana@mail.com");
  await page.getByTestId("details-next").click();
  await expect(page.getByTestId("method-paypal")).toBeDisabled();
});

test("the Vitral page shows the price in the visitor's currency and links to the checkout", async ({
  page,
}) => {
  await mockApi(page, { current: purchase() });
  await page.goto("/vitral/");
  await expect(page.getByTestId("vitral-price-local")).toContainText("73");
  await page.getByTestId("gift-license").click();
  await expect(page).toHaveURL(/\/vitral\/comprar\//);
  await expect(page.getByTestId("step-details")).toBeVisible();
  await expect(page.locator('input[name="recipientEmail"]')).toBeVisible();
});

test("renewing asks only for the email linked to the license", async ({ page }) => {
  await mockApi(page, { current: purchase() });
  await page.goto("/vitral/comprar/?tipo=renew");
  await expect(page.getByTestId("step-details")).toBeVisible();
  await expect(page.locator('input[name="buyerName"]')).toHaveCount(0);
  await expect(page.locator('input[name="renewKey"]')).toHaveCount(0);
  await page.locator('input[name="buyerEmail"]').fill("ana@mail.com");
  await page.getByTestId("details-next").click();
  await expect(page.getByTestId("step-method")).toBeVisible();
});

test("the Vitral app opens the renewal with the email already filled in", async ({ page }) => {
  await mockApi(page, { current: purchase() });
  await page.goto("/vitral/comprar/?tipo=renew&email=ana%40mail.com");
  await expect(page.getByTestId("step-details")).toBeVisible();
  await expect(page.locator('input[name="buyerEmail"]')).toHaveValue("ana@mail.com");
  await expect(page).toHaveURL(/\/vitral\/comprar\/$/);
  await page.getByTestId("details-next").click();
  await expect(page.getByTestId("step-method")).toBeVisible();
});

test("the renewal can be completed with a controller", async ({ page }) => {
  await installGamepadMock(page);
  const state = { current: purchase({ kind: "renew", months: 1, amountUsd: 2, amountVes: 73 }) };
  await mockApi(page, state);
  await page.goto("/vitral/comprar/?tipo=renew&email=ana%40mail.com");
  await connectGamepad(page, PAD_IDS.xbox);
  await page.locator('input[name="buyerEmail"]').focus();
  await pressButton(page, BUTTON.down);
  await expect(page.getByTestId("details-next")).toBeFocused();
  await pressButton(page, BUTTON.south);
  await expect(page.getByTestId("step-method")).toBeVisible();
  await page.getByTestId("method-pago_movil").focus();
  await pressButton(page, BUTTON.south);
  await expect(page.getByTestId("method-pago_movil")).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("start-payment").focus();
  await pressButton(page, BUTTON.south);
  await expect(page.getByTestId("step-payment")).toBeVisible();
});
