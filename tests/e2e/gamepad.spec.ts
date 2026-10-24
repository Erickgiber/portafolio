import { expect, test, type Page } from "@playwright/test";
import {
  BUTTON,
  PAD_IDS,
  connectGamepad,
  disconnectGamepad,
  holdAxis,
  installGamepadMock,
  pressButton,
} from "./support/gamepad";
import { scrollY } from "./support/page";

const LEFT_STICK_Y = 1;

async function glyphLoaded(page: Page, selector: string): Promise<boolean> {
  return page
    .locator(`${selector} img`)
    .first()
    .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0);
}

test.beforeEach(async ({ page }) => {
  await installGamepadMock(page);
});

test("shows nothing until a controller connects", async ({ page }) => {
  await page.goto("/rumbo/");
  await expect(page.getByTestId("gamepad-indicator")).toHaveCount(0);
  await expect(page.getByTestId("gamepad-legend")).toHaveCount(0);
});

test("detects an Xbox controller and shows its own buttons", async ({ page }) => {
  await page.goto("/rumbo/");
  await connectGamepad(page, PAD_IDS.xbox);

  await expect(page.getByTestId("gamepad-indicator")).toHaveAttribute("data-brand", "xbox");
  await expect(page.getByTestId("gamepad-notice")).toContainText("Mando de Xbox conectado");
  const legend = page.getByTestId("gamepad-legend");
  await expect(legend.locator('[data-glyph="xbox:back"]')).toHaveAttribute("data-glyph-name", "B");
  await expect(legend.locator('[data-glyph="xbox:west"]')).toHaveAttribute("data-glyph-name", "X");
  await expect(legend.locator('[data-glyph="xbox:previous"]')).toHaveAttribute(
    "data-glyph-name",
    "LB"
  );
  expect(await glyphLoaded(page, '[data-testid="gamepad-legend"] [data-glyph="xbox:back"]')).toBe(
    true
  );
});

test("uses PlayStation symbols for a DualSense", async ({ page }) => {
  await page.goto("/rumbo/");
  await connectGamepad(page, PAD_IDS.playstation);
  await expect(page.getByTestId("gamepad-indicator")).toHaveAttribute("data-brand", "playstation");
  const legend = page.getByTestId("gamepad-legend");
  await expect(legend.locator('[data-glyph="playstation:back"]')).toHaveAttribute(
    "data-glyph-name",
    "○"
  );
  await expect(legend.locator('[data-glyph="playstation:north"]')).toHaveAttribute(
    "data-glyph-name",
    "△"
  );
  await expect(legend.locator('[data-glyph="playstation:next"]')).toHaveAttribute(
    "data-glyph-name",
    "R1"
  );
});

test("shows the indicator in the portfolio header too and hides it on disconnect", async ({
  page,
}) => {
  await page.goto("/");
  await connectGamepad(page, PAD_IDS.nintendo);
  await expect(page.getByTestId("gamepad-indicator")).toHaveAttribute("data-brand", "nintendo");
  await disconnectGamepad(page);
  await expect(page.getByTestId("gamepad-indicator")).toHaveCount(0);
  await expect(page.getByTestId("gamepad-notice")).toContainText("Mando desconectado");
});

test("the D-pad moves focus and a prompt with the confirm button follows it", async ({ page }) => {
  await page.goto("/rumbo/");
  await connectGamepad(page, PAD_IDS.xbox);
  await pressButton(page, BUTTON.down);

  const prompt = page.getByTestId("gamepad-prompt");
  await expect(prompt).toBeVisible();
  await expect(prompt.locator('[data-glyph="xbox:confirm"]')).toHaveAttribute(
    "data-glyph-name",
    "A"
  );
  await expect(page.getByTestId("gamepad-legend").locator('[data-legend="confirm"]')).toHaveCount(
    0
  );

  const focusedBefore = await page.evaluate(() => document.activeElement?.outerHTML);
  await pressButton(page, BUTTON.down);
  const focusedAfter = await page.evaluate(() => document.activeElement?.outerHTML);
  expect(focusedAfter).not.toBe(focusedBefore);
});

test("the prompt names the action of the focused element", async ({ page }) => {
  await page.goto("/rumbo/");
  await connectGamepad(page, PAD_IDS.xbox);
  await pressButton(page, BUTTON.down);
  await page.getByTestId("rumbo-hero-shot").focus();
  await expect(page.getByTestId("gamepad-prompt-label")).toHaveText("Abrir");

  await page.getByRole("button", { name: /Cómo conseguir tu archivo de Proton VPN/ }).focus();
  await expect(page.getByTestId("gamepad-prompt-label")).toHaveText("Pulsar");
});

test("confirm opens the viewer, shoulders browse, west zooms and back closes", async ({ page }) => {
  await page.goto("/rumbo/");
  await connectGamepad(page, PAD_IDS.xbox);
  await page.getByTestId("rumbo-hero-shot").focus();

  await pressButton(page, BUTTON.south);
  await expect(page.getByTestId("image-viewer")).toBeVisible();
  await expect(page.getByTestId("viewer-counter")).toHaveText("1 de 4");
  await expect(page.locator(".prompt-glyph.is-pressed")).toHaveCount(1);

  await pressButton(page, BUTTON.next);
  await expect(page.getByTestId("viewer-counter")).toHaveText("2 de 4");
  await pressButton(page, BUTTON.previous);
  await expect(page.getByTestId("viewer-counter")).toHaveText("1 de 4");

  await pressButton(page, BUTTON.west);
  await expect
    .poll(async () => Number(await page.getByTestId("viewer-stage").getAttribute("data-scale")))
    .toBeGreaterThan(1);

  await expect(
    page.getByTestId("gamepad-legend").locator('[data-legend="shoulders"]')
  ).toContainText("Imagen");

  await pressButton(page, BUTTON.east);
  await expect(page.getByTestId("image-viewer")).toBeHidden();
  await expect(page.getByTestId("rumbo-hero-shot")).toBeFocused();
});

test("Nintendo controllers confirm with A on the right and go back with B", async ({ page }) => {
  await page.goto("/rumbo/");
  await connectGamepad(page, PAD_IDS.nintendo);
  await page.getByTestId("rumbo-hero-shot").focus();

  await pressButton(page, BUTTON.south);
  await expect(page.getByTestId("image-viewer")).toHaveCount(0);

  await pressButton(page, BUTTON.east);
  await expect(page.getByTestId("image-viewer")).toBeVisible();

  await pressButton(page, BUTTON.south);
  await expect(page.getByTestId("image-viewer")).toBeHidden();
});

test("the stick scrolls the page fast enough", async ({ page }) => {
  await page.goto("/rumbo/");
  await connectGamepad(page, PAD_IDS.xbox);
  const before = await scrollY(page);
  await holdAxis(page, LEFT_STICK_Y, 1, 700);
  await expect.poll(() => scrollY(page)).toBeGreaterThan(before + 1200);

  const middle = await scrollY(page);
  await holdAxis(page, LEFT_STICK_Y, -1, 300);
  await expect.poll(() => scrollY(page)).toBeLessThan(middle);
});

test("north toggles the theme and west toggles the language", async ({ page }) => {
  await page.goto("/rumbo/");
  await connectGamepad(page, PAD_IDS.xbox);
  const html = page.locator("html");
  const wasDark = await html.evaluate((element) => element.classList.contains("dark"));

  await pressButton(page, BUTTON.north);
  await expect
    .poll(() => html.evaluate((element) => element.classList.contains("dark")))
    .toBe(!wasDark);

  await pressButton(page, BUTTON.west);
  await expect(html).toHaveAttribute("lang", "en");
  await expect(page.getByTestId("gamepad-indicator")).toBeVisible();
  await expect(page.getByTestId("gamepad-legend")).toContainText("Language");
});

test("back on the Rumbo page returns to the portfolio", async ({ page }) => {
  await page.goto("/rumbo/");
  await connectGamepad(page, PAD_IDS.xbox);
  await expect(page.getByTestId("gamepad-legend").locator('[data-legend="back"]')).toContainText(
    "Portafolio"
  );
  await pressButton(page, BUTTON.east);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("#contact")).toBeAttached();
});

test("shoulder buttons jump between portfolio sections", async ({ page }) => {
  await page.goto("/");
  await connectGamepad(page, PAD_IDS.xbox);
  await pressButton(page, BUTTON.next);
  await expect.poll(() => scrollY(page), { timeout: 5000 }).toBeGreaterThan(100);
  const first = await scrollY(page);
  await page.waitForTimeout(800);
  await pressButton(page, BUTTON.next);
  await expect.poll(() => scrollY(page), { timeout: 5000 }).toBeGreaterThan(first + 50);
});

test("text fields open an on-screen keyboard that types into the form", async ({ page }) => {
  await page.goto("/");
  await connectGamepad(page, PAD_IDS.xbox);
  const name = page.locator("#name");
  await name.scrollIntoViewIfNeeded();
  await name.focus();
  await expect(page.getByTestId("gamepad-prompt-label")).toHaveText("Escribir");

  await pressButton(page, BUTTON.south);
  const keyboard = page.getByTestId("virtual-keyboard");
  await expect(keyboard).toBeVisible();
  await expect(keyboard.locator('[data-key="1"]')).toBeFocused();

  await pressButton(page, BUTTON.south);
  await pressButton(page, BUTTON.down);
  await expect(keyboard.locator('[data-key="q"]')).toBeFocused();
  await pressButton(page, BUTTON.south);
  await expect(page.getByTestId("virtual-keyboard-preview")).toHaveText("1q");
  await expect(name).toHaveValue("1q");

  await expect(page.getByTestId("gamepad-legend").locator('[data-legend="west"]')).toContainText(
    "Borrar"
  );
  await pressButton(page, BUTTON.west);
  await expect(name).toHaveValue("1");
  await pressButton(page, BUTTON.north);
  await expect(name).toHaveValue("1 ");

  await pressButton(page, BUTTON.east);
  await expect(keyboard).toBeHidden();
  await expect(name).toBeFocused();
  await expect(name).toHaveValue("1 ");
});

test("using the mouse hides the controller prompt", async ({ page }) => {
  await page.goto("/rumbo/");
  await connectGamepad(page, PAD_IDS.xbox);
  await pressButton(page, BUTTON.down);
  await expect(page.getByTestId("gamepad-prompt")).toBeVisible();
  await page.mouse.move(200, 200);
  await page.mouse.move(260, 240);
  await expect(page.getByTestId("gamepad-prompt")).toHaveCount(0);
});

test("the D-pad keeps going down past the hero instead of jumping back to the header", async ({
  page,
}) => {
  await page.goto("/");
  await connectGamepad(page, PAD_IDS.xbox);
  const inHeader = () => page.evaluate(() => !!document.activeElement?.closest("header"));

  let previous = await scrollY(page);
  let reachedAbout = false;
  for (let press = 0; press < 14; press++) {
    await pressButton(page, BUTTON.down);
    await page.waitForTimeout(250);
    const current = await scrollY(page);
    expect(current).toBeGreaterThanOrEqual(previous - 2);
    if (current > 0) {
      expect(await inHeader()).toBe(false);
    }
    previous = current;
    const aboutTop = await page
      .locator("#about")
      .evaluate((element) => element.getBoundingClientRect().top);
    reachedAbout ||= aboutTop < 200;
  }
  expect(reachedAbout).toBe(true);
});
