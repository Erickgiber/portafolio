import type { GamepadBrand } from "./brand";
import { backButton, confirmButton, type FaceButton } from "./controls";

export type GlyphControl =
  | "confirm"
  | "back"
  | "west"
  | "north"
  | "previous"
  | "next"
  | "dpad"
  | "stick"
  | "pan";

export type Glyph = { src: string; name: string };

type GlyphSet = {
  faces: Record<FaceButton, Glyph>;
  previous: Glyph;
  next: Glyph;
  dpad: Glyph;
  stick: Glyph;
  pan: Glyph;
};

const BASE = "/gamepad";

function glyph(folder: string, file: string, name: string): Glyph {
  return { src: `${BASE}/${folder}/${file}.svg`, name };
}

const XBOX: GlyphSet = {
  faces: {
    south: glyph("xbox", "xbox_button_color_a", "A"),
    east: glyph("xbox", "xbox_button_color_b", "B"),
    west: glyph("xbox", "xbox_button_color_x", "X"),
    north: glyph("xbox", "xbox_button_color_y", "Y"),
  },
  previous: glyph("xbox", "xbox_lb", "LB"),
  next: glyph("xbox", "xbox_rb", "RB"),
  dpad: glyph("xbox", "xbox_dpad", "D-pad"),
  stick: glyph("xbox", "xbox_stick_l_vertical", "LS"),
  pan: glyph("xbox", "xbox_stick_l", "LS"),
};

const GLYPHS: Record<GamepadBrand, GlyphSet> = {
  xbox: XBOX,
  generic: XBOX,
  playstation: {
    faces: {
      south: glyph("playstation", "playstation_button_color_cross", "✕"),
      east: glyph("playstation", "playstation_button_color_circle", "○"),
      west: glyph("playstation", "playstation_button_color_square", "□"),
      north: glyph("playstation", "playstation_button_color_triangle", "△"),
    },
    previous: glyph("playstation", "playstation_trigger_l1", "L1"),
    next: glyph("playstation", "playstation_trigger_r1", "R1"),
    dpad: glyph("playstation", "playstation_dpad", "D-pad"),
    stick: glyph("playstation", "playstation_stick_l_vertical", "L3"),
    pan: glyph("playstation", "playstation_stick_l", "L3"),
  },
  nintendo: {
    faces: {
      south: glyph("switch", "switch_button_b", "B"),
      east: glyph("switch", "switch_button_a", "A"),
      west: glyph("switch", "switch_button_y", "Y"),
      north: glyph("switch", "switch_button_x", "X"),
    },
    previous: glyph("switch", "switch_button_l", "L"),
    next: glyph("switch", "switch_button_r", "R"),
    dpad: glyph("switch", "switch_dpad", "D-pad"),
    stick: glyph("switch", "switch_stick_l_vertical", "L"),
    pan: glyph("switch", "switch_stick_l", "L"),
  },
};

export function glyphFor(brand: GamepadBrand, control: GlyphControl): Glyph {
  const set = GLYPHS[brand];
  switch (control) {
    case "confirm":
      return set.faces[confirmButton(brand)];
    case "back":
      return set.faces[backButton(brand)];
    case "west":
    case "north":
      return set.faces[control];
    default:
      return set[control];
  }
}

export function allGlyphSources(): string[] {
  return Array.from(
    new Set(
      Object.values(GLYPHS).flatMap((set) => [
        ...Object.values(set.faces).map((face) => face.src),
        set.previous.src,
        set.next.src,
        set.dpad.src,
        set.stick.src,
        set.pan.src,
      ])
    )
  );
}
