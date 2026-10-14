import { expect, test } from "@playwright/test";
import {
  curtainStops,
  curtainTop,
  expectCurtainClosed,
  expectCurtainOpen,
  scrollInstantly,
} from "./support/page";

test.beforeEach(async ({ page }) => {
  await page.goto("/vitral/");
  await expect(page.getByTestId("vitral-curtain")).toBeAttached();
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
  const cue = page.getByTestId("vitral-scroll-cue");
  await expect(cue).toBeVisible();
  await expect(cue).toContainText("Desliza para descubrir más");
  await cue.click();
  await expectCurtainOpen(page);
  await expect(cue).toHaveAttribute("aria-hidden", "true");
});

test("tapping the handle opens and closes the curtain", async ({ page }) => {
  const { closed } = await curtainStops(page);
  await scrollInstantly(page, closed + 250);
  const handle = page.getByTestId("vitral-curtain-handle");

  await handle.click();
  await expectCurtainOpen(page);
  await expect(handle).toHaveAttribute("aria-label", /volver al inicio/);

  await handle.click();
  await expectCurtainClosed(page);
});

test("dragging the handle with the mouse snaps the curtain", async ({ page }) => {
  const { closed } = await curtainStops(page);
  await scrollInstantly(page, closed + 200);
  const handle = page.getByTestId("vitral-curtain-handle");
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

test("the tips link brings the usage tips into view", async ({ page }) => {
  await page.getByRole("button", { name: /Consejos para que el botón central/ }).click();
  const tips = page.getByRole("heading", { name: "Consejos para usarlo mejor" });
  await expect
    .poll(async () => (await tips.boundingBox())?.y ?? -1, { timeout: 5000 })
    .toBeGreaterThan(0);
  const box = (await tips.boundingBox())!;
  expect(box.y).toBeLessThan(page.viewportSize()!.height);
});

test("content inside the curtain becomes fully visible once scrolled into view", async ({
  page,
}) => {
  await page.getByTestId("vitral-scroll-cue").click();
  await expectCurtainOpen(page);
  const heading = page.getByRole("heading", { name: "Todo lo que esperas de una consola" });
  await expect
    .poll(() => heading.evaluate((element) => getComputedStyle(element).opacity), {
      timeout: 5000,
    })
    .toBe("1");
});

test("every visible text follows the selected language", async ({ page }) => {
  await page.getByRole("button", { name: /Cambiar a Inglés/ }).click();
  await expect(page.getByTestId("vitral-scroll-cue")).toContainText("Scroll to discover more");
  await expect(page.getByRole("button", { name: /Download Vitral/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Tips so the home button/ })).toBeVisible();
  await expect(page.getByTestId("vitral-curtain-handle")).toHaveAttribute(
    "aria-label",
    /Drag up or tap/
  );
  await expect(page.getByTestId("vitral-hero-shot")).toHaveAttribute(
    "aria-label",
    /View larger image/
  );
});
