import { expect, test, type Page } from "@playwright/test";
import { scrollY } from "./support/page";

async function openFromHero(page: Page) {
  await page.getByTestId("rumbo-hero-shot").click();
  await expect(page.getByTestId("image-viewer")).toBeVisible();
}

async function scale(page: Page): Promise<number> {
  return Number(await page.getByTestId("viewer-stage").getAttribute("data-scale"));
}

test.beforeEach(async ({ page }) => {
  await page.goto("/rumbo/");
});

test("opens on the clicked image with its title", async ({ page }) => {
  await openFromHero(page);
  await expect(page.getByTestId("viewer-counter")).toHaveText("1 de 4");
  await expect(page.getByTestId("viewer-title")).toHaveText("Inicio");
  await expect(page.getByTestId("viewer-image")).toHaveAttribute("src", "/rumbo/home.webp");
  await expect(page.getByRole("dialog", { name: "Visor de imágenes" })).toBeVisible();
});

test("navigates with the keyboard, the arrows and the thumbnails, wrapping around", async ({
  page,
}) => {
  await openFromHero(page);
  const counter = page.getByTestId("viewer-counter");

  await page.keyboard.press("ArrowRight");
  await expect(counter).toHaveText("2 de 4");
  await expect(page.getByTestId("viewer-title")).toHaveText("Tus sitios");

  await page.getByTestId("viewer-next").click();
  await expect(counter).toHaveText("3 de 4");

  await page.getByTestId("viewer-previous").click();
  await expect(counter).toHaveText("2 de 4");

  await page.getByTestId("viewer-thumbnail").nth(3).click();
  await expect(counter).toHaveText("4 de 4");

  await page.keyboard.press("ArrowRight");
  await expect(counter).toHaveText("1 de 4");

  await page.keyboard.press("ArrowLeft");
  await expect(counter).toHaveText("4 de 4");
});

test("closes with Escape and returns focus to the image that opened it", async ({ page }) => {
  await openFromHero(page);
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("image-viewer")).toBeHidden();
  await expect(page.getByTestId("rumbo-hero-shot")).toBeFocused();
});

test("zooms with the buttons, the keyboard and the mouse wheel", async ({ page }) => {
  await openFromHero(page);
  await expect(page.getByTestId("viewer-zoom-out")).toBeDisabled();

  await page.getByTestId("viewer-zoom-in").click();
  expect(await scale(page)).toBeGreaterThan(1);
  await expect(page.getByTestId("viewer-zoom-out")).toBeEnabled();

  await page.keyboard.press("0");
  expect(await scale(page)).toBe(1);

  const stage = (await page.getByTestId("viewer-stage").boundingBox())!;
  await page.mouse.move(stage.x + stage.width / 2, stage.y + stage.height / 2);
  await page.mouse.wheel(0, -400);
  await expect.poll(() => scale(page)).toBeGreaterThan(1);
});

test("dragging a zoomed image pans it without changing the image", async ({ page }) => {
  await openFromHero(page);
  await page.getByTestId("viewer-zoom-in").click();
  await page.getByTestId("viewer-zoom-in").click();
  const image = page.getByTestId("viewer-image");
  const before = await image.evaluate((element) => element.style.transform);

  const stage = (await page.getByTestId("viewer-stage").boundingBox())!;
  const x = stage.x + stage.width / 2;
  const y = stage.y + stage.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 200, y - 80, { steps: 8 });
  await page.mouse.up();

  await expect.poll(() => image.evaluate((element) => element.style.transform)).not.toBe(before);
  await expect(page.getByTestId("viewer-counter")).toHaveText("1 de 4");
});

test("swiping with the mouse changes the image when not zoomed", async ({ page }) => {
  await openFromHero(page);
  const image = (await page.getByTestId("viewer-image").boundingBox())!;
  const x = image.x + image.width / 2;
  const y = image.y + image.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 220, y, { steps: 6 });
  await page.mouse.up();
  await expect(page.getByTestId("viewer-counter")).toHaveText("2 de 4");
});

test("locks the page scroll while open", async ({ page }) => {
  await openFromHero(page);
  const before = await scrollY(page);
  const stage = (await page.getByTestId("viewer-stage").boundingBox())!;
  await page.mouse.move(stage.x + 20, stage.y + 20);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(400);
  expect(await scrollY(page)).toBe(before);
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");

  await page.keyboard.press("Escape");
  await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
});

test("clicking the backdrop closes the viewer", async ({ page }) => {
  await openFromHero(page);
  const stage = (await page.getByTestId("viewer-stage").boundingBox())!;
  await page.mouse.click(stage.x + 12, stage.y + 12);
  await expect(page.getByTestId("image-viewer")).toBeHidden();
});

test("keeps keyboard focus trapped inside", async ({ page }) => {
  await openFromHero(page);
  for (let step = 0; step < 12; step++) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(
      () => !!document.activeElement?.closest('[data-testid="image-viewer"]')
    );
    expect(inside).toBe(true);
  }
});

test("opens from the screenshots inside the curtain", async ({ page }) => {
  const shot = page.getByTestId("rumbo-shot").nth(1);
  await shot.scrollIntoViewIfNeeded();
  await shot.click();
  await expect(page.getByTestId("viewer-counter")).toHaveText("3 de 4");
  await expect(page.getByTestId("viewer-title")).toHaveText("Claves de Proton VPN");
});

test("viewer texts follow the selected language", async ({ page }) => {
  await page.getByRole("button", { name: /Cambiar a Inglés/ }).click();
  await openFromHero(page);
  await expect(page.getByTestId("viewer-counter")).toHaveText("1 of 4");
  await expect(page.getByTestId("viewer-title")).toHaveText("Home");
  await expect(page.getByTestId("viewer-close")).toHaveAttribute("aria-label", "Close viewer");
});
