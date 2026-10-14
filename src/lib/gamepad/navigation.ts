import { gamepadStore } from "../stores/gamepad.svelte";
import { gamepadLayers } from "../stores/gamepadLayers.svelte";
import type { GamepadBrand } from "./brand";
import {
  horizontalAxes,
  markCentered,
  readControls,
  stickValue,
  verticalAxes,
  type Control,
} from "./controls";
import { closestInDirection, edgeAnchor, type NavigationDirection } from "./spatial";

export interface GamepadNavigationOptions {
  scrollBy: (delta: number, immediate?: boolean) => void;
  editText: (field: HTMLInputElement | HTMLTextAreaElement) => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const TEXT_INPUT_TYPES = new Set([
  "text",
  "email",
  "search",
  "tel",
  "url",
  "password",
  "number",
  "",
]);
const DIRECTIONS = new Set<Control>(["up", "down", "left", "right"]);

const STICK_SCROLL_PX_PER_MS = 3.2;
const REPEAT_DELAY_MS = 380;
const REPEAT_INTERVAL_MS = 120;
const STEP_SCROLL_RATIO = 0.45;
const COMFORT_MARGIN_RATIO = 0.18;
const MAX_JUMP_RATIO = 1.1;
const MAX_TARGET_AREA_RATIO = 0.6;
const HIT_INSET_PX = 6;
const SECTION_MIN_GAP_PX = 40;
const SECTION_EDGE_PX = 8;

export const STICKY_ATTRIBUTE = "data-gamepad-sticky";
export const GAMEPAD_INPUT = "gamepad";
export const PRESS_EVENT = "gamepad:press";

export function isTextField(
  element: Element | null
): element is HTMLInputElement | HTMLTextAreaElement {
  if (element instanceof HTMLTextAreaElement) {
    return !element.readOnly;
  }

  return (
    element instanceof HTMLInputElement &&
    !element.readOnly &&
    TEXT_INPUT_TYPES.has(element.getAttribute("type")?.toLowerCase() ?? "")
  );
}

export type ActionVerb = "write" | "open" | "press";

const OPENS_SELECTOR =
  'a[href], [aria-haspopup]:not([aria-haspopup="false"]), [data-gamepad-verb="open"]';

export function actionVerb(element: Element | null): ActionVerb {
  if (isTextField(element)) {
    return "write";
  }

  return element?.matches(OPENS_SELECTOR) ? "open" : "press";
}

function inViewport(rect: DOMRect): boolean {
  return rect.bottom > 0 && rect.top < window.innerHeight;
}

function hits(element: HTMLElement, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) {
    return false;
  }

  const top = document.elementFromPoint(x, y);
  return !!top && element.contains(top);
}

function isReachable(element: HTMLElement): boolean {
  if (element.tabIndex < 0) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0 || element.closest('[aria-hidden="true"], [inert]')) {
    return false;
  }

  if (rect.width * rect.height > window.innerWidth * window.innerHeight * MAX_TARGET_AREA_RATIO) {
    return false;
  }

  if (!inViewport(rect)) {
    return (
      !element.closest(`[${STICKY_ATTRIBUTE}]`) && getComputedStyle(element).visibility !== "hidden"
    );
  }

  const points: [number, number][] = [
    [rect.left + rect.width / 2, rect.top + rect.height / 2],
    [rect.left + HIT_INSET_PX, rect.top + HIT_INSET_PX],
    [rect.right - HIT_INSET_PX, rect.bottom - HIT_INSET_PX],
  ];
  return points.some(([x, y]) => hits(element, x, y));
}

function isPinned(element: HTMLElement): boolean {
  for (
    let node: HTMLElement | null = element;
    node && node !== document.body;
    node = node.parentElement
  ) {
    if (getComputedStyle(node).position === "fixed") {
      return true;
    }
  }
  return false;
}

function scrollableAncestor(element: Element | null): HTMLElement | null {
  for (
    let node = element?.parentElement ?? null;
    node && node !== document.body;
    node = node.parentElement
  ) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
  }
  return null;
}

export function sectionTargets(): number[] {
  const tops = Array.from(document.querySelectorAll<HTMLElement>("section"))
    .filter((section) => section.offsetHeight > 0)
    .map((section) => {
      const margin = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
      return Math.max(0, section.getBoundingClientRect().top + window.scrollY - margin);
    })
    .sort((a, b) => a - b);
  return tops.filter((top, index) => index === 0 || top - tops[index - 1] > SECTION_MIN_GAP_PX);
}

export function nextSectionTop(direction: -1 | 1): number | null {
  const current = window.scrollY;
  const targets = sectionTargets();
  if (direction > 0) {
    return targets.find((top) => top > current + SECTION_EDGE_PX) ?? null;
  }

  const previous = targets.filter((top) => top < current - SECTION_EDGE_PX);
  return previous.length > 0 ? previous[previous.length - 1] : 0;
}

export function startGamepadNavigation({ scrollBy, editText }: GamepadNavigationOptions) {
  const held = new Map<Control, number>();
  let centered = new Set<number>();
  let padKey = "";
  const root = document.documentElement;

  function markGamepadInput() {
    root.dataset.input = GAMEPAD_INPUT;
  }

  function clearGamepadInput() {
    delete root.dataset.input;
  }

  function candidates(): HTMLElement[] {
    const scope = gamepadLayers.scope() ?? document;
    return Array.from(scope.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(isReachable);
  }

  function focused(): HTMLElement | null {
    const active = document.activeElement;
    if (
      !(active instanceof HTMLElement) ||
      active === document.body ||
      !inViewport(active.getBoundingClientRect()) ||
      !isReachable(active)
    ) {
      return null;
    }

    const scope = gamepadLayers.scope();
    return !scope || scope.contains(active) ? active : null;
  }

  function reveal(element: HTMLElement) {
    if (element.closest(`[${STICKY_ATTRIBUTE}]`) || gamepadLayers.scope()) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const margin = window.innerHeight * COMFORT_MARGIN_RATIO;
    if (rect.top < margin || rect.bottom > window.innerHeight - margin) {
      scrollBy(rect.top + rect.height / 2 - window.innerHeight / 2);
    }
  }

  function focus(element: HTMLElement) {
    element.focus({ preventScroll: true });
    reveal(element);
  }

  function step(direction: NavigationDirection) {
    if (!gamepadLayers.scope() && (direction === "up" || direction === "down")) {
      scrollBy((direction === "down" ? 1 : -1) * window.innerHeight * STEP_SCROLL_RATIO);
    }
  }

  function move(direction: NavigationDirection) {
    const current = focused();
    const skipPinned = !current && !gamepadLayers.scope();
    const anchor = current
      ? current.getBoundingClientRect()
      : edgeAnchor(direction, window.innerWidth, window.innerHeight);
    const options = candidates()
      .filter((element) => element !== current && !(skipPinned && isPinned(element)))
      .map((item) => ({ item, box: item.getBoundingClientRect() }));
    const best = closestInDirection(anchor, options, direction);
    const tooFar =
      best !== null &&
      !inViewport(best.box as DOMRect) &&
      best.score > window.innerHeight * MAX_JUMP_RATIO;
    if (best && !tooFar) {
      focus(best.item);
    } else {
      step(direction);
    }
  }

  function confirm() {
    const element = focused();
    if (!element) {
      return;
    }

    if (isTextField(element)) {
      editText(element);
    } else {
      element.click();
    }
  }

  function trigger(control: Control) {
    markGamepadInput();
    if (DIRECTIONS.has(control)) {
      move(control as NavigationDirection);
    } else if (control === "confirm") {
      confirm();
    } else if (control === "previous" || control === "next") {
      gamepadLayers.action("shoulders")?.run(control === "next" ? 1 : -1);
    } else if (control === "back" || control === "west" || control === "north") {
      gamepadLayers.action(control)?.run(1);
    }
    window.dispatchEvent(new CustomEvent<Control>(PRESS_EVENT, { detail: control }));
  }

  function handleSticks(pad: Gamepad, elapsed: number) {
    const layerStick = gamepadLayers.top()?.stick;
    if (layerStick) {
      const x = stickValue(pad, horizontalAxes(pad), centered);
      const y = stickValue(pad, verticalAxes(pad), centered);
      if (x !== 0 || y !== 0) {
        markGamepadInput();
        layerStick(x, y, elapsed);
      }
      return;
    }

    const value = stickValue(pad, verticalAxes(pad), centered);
    if (value === 0) {
      return;
    }

    markGamepadInput();
    const delta = value * STICK_SCROLL_PX_PER_MS * elapsed;
    const container = scrollableAncestor(document.activeElement);
    if (container) {
      container.scrollBy({ top: delta, behavior: "instant" });
    } else if (!gamepadLayers.scope()) {
      scrollBy(delta, true);
    }
  }

  function handleFrame(pad: Gamepad, brand: GamepadBrand, elapsed: number) {
    const now = performance.now();
    const key = `${pad.index}:${pad.id}`;
    if (key !== padKey) {
      padKey = key;
      centered = new Set();
      held.clear();
    }
    markCentered(centered, pad);
    const controls = readControls(pad, brand, !gamepadLayers.top()?.stick, centered);
    (Object.keys(controls) as Control[]).forEach((control) => {
      if (!controls[control]) {
        held.delete(control);
        return;
      }

      const nextAt = held.get(control);
      if (nextAt === undefined) {
        held.set(control, now + REPEAT_DELAY_MS);
        trigger(control);
      } else if (DIRECTIONS.has(control) && now >= nextAt) {
        held.set(control, now + REPEAT_INTERVAL_MS);
        trigger(control);
      }
    });

    handleSticks(pad, elapsed);
  }

  const releaseFrame = gamepadStore.onFrame(handleFrame);
  window.addEventListener("pointermove", clearGamepadInput, { passive: true });
  window.addEventListener("pointerdown", clearGamepadInput, { passive: true });
  return () => {
    releaseFrame();
    clearGamepadInput();
    window.removeEventListener("pointermove", clearGamepadInput);
    window.removeEventListener("pointerdown", clearGamepadInput);
  };
}
