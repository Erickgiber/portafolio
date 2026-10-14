import { expect, test, type CDPSession, type Page } from "@playwright/test";
import { curtainStops, expectCurtainOpen, scrollInstantly } from "./support/page";

type TouchPoint = { x: number; y: number; id: number };

const STEP_MS = 16;

async function touch(cdp: CDPSession, type: string, touchPoints: TouchPoint[]) {
  await cdp.send("Input.dispatchTouchEvent", { type, touchPoints });
}

async function gesture(
  page: Page,
  cdp: CDPSession,
  paths: { from: { x: number; y: number }; to: { x: number; y: number } }[],
  steps = 10
) {
  const at = (progress: number) =>
    paths.map((path, index) => ({
      id: index + 1,
      x: path.from.x + (path.to.x - path.from.x) * progress,
      y: path.from.y + (path.to.y - path.from.y) * progress,
    }));
  await touch(cdp, "touchStart", at(0));
  for (let step = 1; step <= steps; step++) {
    await page.waitForTimeout(STEP_MS);
    await touch(cdp, "touchMove", at(step / steps));
  }
  await touch(cdp, "touchEnd", []);
  await page.waitForTimeout(120);
}

async function tap(cdp: CDPSession, x: number, y: number) {
  await touch(cdp, "touchStart", [{ x, y, id: 1 }]);
  await touch(cdp, "touchEnd", []);
}

async function stageCenter(page: Page) {
  const box = (await page.getByTestId("viewer-stage").boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function scale(page: Page): Promise<number> {
  return Number(await page.getByTestId("viewer-stage").getAttribute("data-scale"));
}

async function openViewer(page: Page, cdp: CDPSession) {
  const shot = page.getByTestId("vitral-hero-shot");
  await shot.scrollIntoViewIfNeeded();
  const box = (await shot.boundingBox())!;
  await tap(cdp, box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByTestId("image-viewer")).toBeVisible();
}

let cdp: CDPSession;

test.beforeEach(async ({ page }) => {
  cdp = await page.context().newCDPSession(page);
  await page.goto("/vitral/");
});

test("the hero spans the full width without horizontal scroll", async ({ page }) => {
  const viewport = page.viewportSize()!;
  const hero = (await page.locator("section[data-gamepad-sticky]").boundingBox())!;
  expect(hero.width).toBeGreaterThanOrEqual(viewport.width - 1);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("swiping changes images and swiping down closes the viewer", async ({ page }) => {
  await openViewer(page, cdp);
  const center = await stageCenter(page);
  const counter = page.getByTestId("viewer-counter");

  await gesture(page, cdp, [{ from: center, to: { x: center.x - 220, y: center.y } }]);
  await expect(counter).toHaveText("2 de 4");

  await gesture(page, cdp, [{ from: center, to: { x: center.x + 220, y: center.y } }]);
  await expect(counter).toHaveText("1 de 4");

  await gesture(page, cdp, [{ from: center, to: { x: center.x, y: center.y + 240 } }]);
  await expect(page.getByTestId("image-viewer")).toBeHidden();
});

test("double tap zooms in and out", async ({ page }) => {
  await openViewer(page, cdp);
  const center = await stageCenter(page);
  await tap(cdp, center.x, center.y);
  await page.waitForTimeout(80);
  await tap(cdp, center.x, center.y);
  await expect.poll(() => scale(page)).toBeGreaterThan(1);

  await page.waitForTimeout(400);
  await tap(cdp, center.x, center.y);
  await page.waitForTimeout(80);
  await tap(cdp, center.x, center.y);
  await expect.poll(() => scale(page)).toBe(1);
  await expect(page.getByTestId("image-viewer")).toBeVisible();
});

test("pinching zooms the image without changing it", async ({ page }) => {
  await openViewer(page, cdp);
  const center = await stageCenter(page);
  await gesture(page, cdp, [
    { from: { x: center.x - 30, y: center.y }, to: { x: center.x - 120, y: center.y } },
    { from: { x: center.x + 30, y: center.y }, to: { x: center.x + 120, y: center.y } },
  ]);
  await expect.poll(() => scale(page)).toBeGreaterThan(1.5);
  await expect(page.getByTestId("viewer-counter")).toHaveText("1 de 4");
});

test("the curtain handle follows a touch drag", async ({ page }) => {
  const { closed } = await curtainStops(page);
  await scrollInstantly(page, closed + 180);
  const handle = (await page.getByTestId("vitral-curtain-handle").boundingBox())!;
  const start = { x: handle.x + handle.width / 2, y: handle.y + handle.height / 2 };
  await gesture(page, cdp, [{ from: start, to: { x: start.x, y: start.y - 260 } }], 12);
  await expectCurtainOpen(page);
});
