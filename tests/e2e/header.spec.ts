import { expect, test } from "@playwright/test";

const LANGUAGE_BUTTON = /Cambiar a Inglés|Switch to Spanish/;
const THEME_BUTTON = /modo (claro|oscuro)|(light|dark) mode/i;

for (const path of ["/", "/rumbo/"]) {
  test(`header controls share the same height on ${path}`, async ({ page }) => {
    await page.goto(path);
    const language = page.getByRole("button", { name: LANGUAGE_BUTTON }).first();
    const theme = page.getByRole("button", { name: THEME_BUTTON }).first();
    await expect(language).toBeVisible();
    await expect(theme).toBeVisible();

    const languageBox = await language.boundingBox();
    const themeBox = await theme.boundingBox();
    expect(languageBox).not.toBeNull();
    expect(themeBox).not.toBeNull();
    expect(Math.abs(languageBox!.height - themeBox!.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(languageBox!.y - themeBox!.y)).toBeLessThanOrEqual(1);
  });

  test(`language toggle uses an image flag instead of an emoji on ${path}`, async ({ page }) => {
    await page.goto(path);
    const language = page.getByRole("button", { name: LANGUAGE_BUTTON }).first();
    await expect(language).toBeVisible();
    expect(await language.textContent()).not.toMatch(/\p{Regional_Indicator}/u);
    await expect(language.locator("svg")).toHaveCount(1);
  });
}

test("language toggle switches the page language", async ({ page }) => {
  await page.goto("/rumbo/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await page.getByRole("button", { name: LANGUAGE_BUTTON }).first().click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("only where you need it");
});
