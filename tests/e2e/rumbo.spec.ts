import { expect, test } from "@playwright/test";

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
});

test("follows the selected language", async ({ page }) => {
  await page.getByRole("button", { name: /Cambiar a Inglés/ }).click();
  await expect(page.getByRole("button", { name: /Download Rumbo/ })).toBeVisible();
  await expect(page.getByTestId("rumbo-free-note")).toContainText("Rumbo is free");
});

test("the portfolio links to Rumbo without reloading", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => ((window as unknown as { marker: boolean }).marker = true));
  await page.locator('a[href="/rumbo/"]').first().click();
  await expect(page).toHaveURL(/\/rumbo\/$/);
  await expect(page.getByRole("button", { name: /Descargar Rumbo/ })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { marker?: boolean }).marker)).toBe(true);
});
