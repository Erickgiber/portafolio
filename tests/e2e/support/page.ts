import { expect, type Page } from "@playwright/test";

export async function curtainTop(page: Page): Promise<number> {
  return page
    .getByTestId("rumbo-curtain")
    .evaluate((element) => element.getBoundingClientRect().top);
}

export async function curtainStops(page: Page) {
  return page.getByTestId("rumbo-curtain").evaluate((element) => {
    const open = element.getBoundingClientRect().top + window.scrollY;
    return { open, closed: Math.max(0, open - window.innerHeight) };
  });
}

export async function scrollInstantly(page: Page, top: number) {
  await page.evaluate((target) => window.scrollTo({ top: target, behavior: "instant" }), top);
  await page.waitForTimeout(150);
}

export async function expectCurtainOpen(page: Page) {
  await expect.poll(() => curtainTop(page), { timeout: 4000 }).toBeLessThan(4);
}

export async function expectCurtainClosed(page: Page) {
  const height = await page.evaluate(() => window.innerHeight);
  await expect.poll(() => curtainTop(page), { timeout: 4000 }).toBeGreaterThan(height - 4);
}

export async function scrollY(page: Page): Promise<number> {
  return page.evaluate(() => window.scrollY);
}
