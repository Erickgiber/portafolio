import { expect, test, type Page } from "@playwright/test";

async function openFromLink(page: Page, href: string, scope = page.locator("body")) {
  const link = scope.locator(`a[href="${href}"]`).first();
  await link.scrollIntoViewIfNeeded();
  await link.click();
}

async function backToPortfolio(page: Page) {
  await page.locator('header a[href="/"]').first().click();
  await expect.poll(() => new URL(page.url()).pathname).toBe("/");
  await expect(page.getByRole("heading", { name: "Proyectos Destacados" })).toBeAttached();
}

test("portfolio → Rumbo → portfolio returns to the same place", async ({ page }) => {
  await page.goto("/");
  await openFromLink(page, "/rumbo/");
  await expect(page).toHaveURL(/\/rumbo\/$/);

  await backToPortfolio(page);
  await page.goForward();
  await expect(page).toHaveURL(/\/rumbo\/$/);
  await expect(page.getByRole("button", { name: /Descargar Rumbo/ })).toBeVisible();
});

test("opening Rumbo directly leads back to the portfolio", async ({ page }) => {
  await page.goto("/rumbo/");
  await backToPortfolio(page);
  await page.goBack();
  await expect(page).toHaveURL(/\/rumbo\/$/);
});

test("going to Rumbo twice never loops", async ({ page }) => {
  await page.goto("/");
  await openFromLink(page, "/rumbo/");
  await backToPortfolio(page);
  await openFromLink(page, "/rumbo/");
  await backToPortfolio(page);
});

test("the Vitral card opens vitral.space in a new tab", async ({ page }) => {
  await page.goto("/");
  const link = page.locator('a[href="https://vitral.space/"]');
  await expect(link).toHaveCount(1);
  await expect(link).toHaveAttribute("target", "_blank");
});
