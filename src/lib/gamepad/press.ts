import type { Control } from "./controls";
import type { GlyphControl } from "./glyphs";

const DIRECTION_CONTROLS = new Set<Control>(["up", "down", "left", "right"]);

export function glyphForPress(control: Control): GlyphControl {
  return DIRECTION_CONTROLS.has(control) ? "dpad" : (control as GlyphControl);
}
