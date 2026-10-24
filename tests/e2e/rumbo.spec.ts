import { expect, test } from "@playwright/test";
import {
  curtainStops,
  curtainTop,
  expectCurtainClosed,
  expectCurtainOpen,
  scrollInstantly,
} from "./support/page";

const MANIFEST =
  "https://zoaxdegcwadmiwmznvrb.supabase.co/storage/v1/object/public/updates/rumbo/latest.json";
const PART =
  "https://zoaxdegcwadmiwmznvrb.supabase.co/storage/v1/object/public/updates/rumbo/Rumbo-Setup-9.9.9.part01";
const INSTALLER = Buffer.from("MZ installer for tests");

test.beforeEach(async ({ page }) => {
  await page.route(`${MANIFEST}**`, (route) =>
    route.fulfill({
      json: {
        version: "9.9.9",
        fileName: "Rumbo-Setup.exe",
        size: INSTALLER.length,
        sha256: "0".repeat(64),
        publishedAt: "2026-10-18T00:00:00Z",
        parts: [{ url: PART, size: INSTALLER.length }],
      },
    })
  );
  await page.route(PART, (route) =>
    route.fulfill({ body: INSTALLER, contentType: "application/octet-stream" })
  );
  await page.goto("/rumbo/");
});

test("shows the published version and the free note", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Proton VPN");
  await expect(page.getByText("9.9.9")).toBeVisible();
  await expect(page.getByTestId("rumbo-free-note")).toContainText("Rumbo es gratis");
});

test("downloads the installer from its parts", async ({ page }) => {
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /Descargar Rumbo/ }).click();
  expect((await download).suggestedFilename()).toBe("Rumbo-Setup.exe");
  await expect(page.getByText("Descarga completa")).toBeVisible();
});

test("the guide link brings the Proton steps into view", async ({ page }) => {
  await page.getByRole("button", { name: /Cómo conseguir tu archivo de Proton VPN/ }).click();
  const guide = page.getByRole("heading", { name: "Tu archivo de Proton VPN" });
  await expect
    .poll(async () => (await guide.boundingBox())?.y ?? -1, { timeout: 5000 })
    .toBeGreaterThan(0);
  await expect(page.getByTestId("rumbo-proton-link")).toHaveAttribute(
    "href",
    "https://account.protonvpn.com/downloads"
  );
  for (const id of ["rumbo-signup-link", "rumbo-signup-hero"]) {
    await expect(page.getByTestId(id)).toHaveAttribute(
      "href",
      "https://account.protonvpn.com/signup?plan=free&ref=free-plan-upsell-modal-1-usd-continue-free"
    );
    await expect(page.getByTestId(id)).toHaveAttribute("target", "_blank");
  }
});

test("the hero fills the whole viewport", async ({ page }) => {
  const viewport = page.viewportSize()!;
  const hero = await page.locator("section[data-gamepad-sticky]").boundingBox();
  expect(hero).not.toBeNull();
  expect(hero!.width).toBeGreaterThanOrEqual(viewport.width - 20);
  expect(hero!.height).toBeGreaterThanOrEqual(viewport.height - 1);
  expect(await curtainTop(page)).toBeGreaterThanOrEqual(viewport.height - 1);
});

test("the scroll cue reveals the content and then hides", async ({ page }) => {
  const cue = page.getByTestId("rumbo-scroll-cue");
  await expect(cue).toBeVisible();
  await expect(cue).toContainText("Desliza para descubrir más");
  await cue.click();
  await expectCurtainOpen(page);
  await expect(cue).toHaveAttribute("aria-hidden", "true");
});

test("tapping the handle opens and closes the curtain", async ({ page }) => {
  const { closed } = await curtainStops(page);
  await scrollInstantly(page, closed + 250);
  const handle = page.getByTestId("rumbo-curtain-handle");

  await handle.click();
  await expectCurtainOpen(page);
  await expect(handle).toHaveAttribute("aria-label", /volver al inicio/);

  await handle.click();
  await expectCurtainClosed(page);
});

test("dragging the handle with the mouse snaps the curtain", async ({ page }) => {
  const { closed } = await curtainStops(page);
  await scrollInstantly(page, closed + 200);
  const handle = page.getByTestId("rumbo-curtain-handle");
  const box = (await handle.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y - 120, { steps: 6 });
  await page.mouse.move(x, y - 260, { steps: 6 });
  await page.mouse.up();
  await expectCurtainOpen(page);

  const openBox = (await handle.boundingBox())!;
  const top = openBox.y + openBox.height / 2;
  await page.mouse.move(x, top);
  await page.mouse.down();
  await page.mouse.move(x, top + 200, { steps: 6 });
  await page.mouse.move(x, top + 450, { steps: 6 });
  await page.mouse.up();
  await expectCurtainClosed(page);
});

test("content inside the curtain becomes fully visible once scrolled into view", async ({
  page,
}) => {
  await page.getByTestId("rumbo-scroll-cue").click();
  await expectCurtainOpen(page);
  const heading = page.getByRole("heading", { name: "Un proxy cómodo, no una VPN completa" });
  await expect
    .poll(() => heading.evaluate((element) => getComputedStyle(element).opacity), {
      timeout: 5000,
    })
    .toBe("1");
});

test("follows the selected language", async ({ page }) => {
  await page.getByRole("button", { name: /Cambiar a Inglés/ }).click();
  await expect(page.getByRole("button", { name: /Download Rumbo/ })).toBeVisible();
  await expect(page.getByTestId("rumbo-free-note")).toContainText("Rumbo is free");
  await expect(page.getByTestId("rumbo-scroll-cue")).toContainText("Scroll to discover more");
  await expect(page.getByRole("button", { name: /How to get your Proton VPN file/ })).toBeVisible();
  await expect(page.getByTestId("rumbo-curtain-handle")).toHaveAttribute(
    "aria-label",
    /Drag up or tap/
  );
  await expect(page.getByTestId("rumbo-hero-shot")).toHaveAttribute(
    "aria-label",
    /View larger image/
  );
});

test("the portfolio links to Rumbo without reloading", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => ((window as unknown as { marker: boolean }).marker = true));
  await page.locator('a[href="/rumbo/"]').first().click();
  await expect(page).toHaveURL(/\/rumbo\/$/);
  await expect(page.getByRole("button", { name: /Descargar Rumbo/ })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { marker?: boolean }).marker)).toBe(true);
});
