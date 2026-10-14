import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { allGlyphSources, glyphFor } from "../../src/lib/gamepad/glyphs";
import { glyphForPress } from "../../src/lib/gamepad/press";

const publicDir = join(process.cwd(), "public");

describe("glyphFor", () => {
  it("uses the Xbox face buttons", () => {
    expect(glyphFor("xbox", "confirm").name).toBe("A");
    expect(glyphFor("xbox", "back").name).toBe("B");
    expect(glyphFor("xbox", "west").name).toBe("X");
    expect(glyphFor("xbox", "north").name).toBe("Y");
    expect(glyphFor("xbox", "previous").name).toBe("LB");
  });

  it("uses the PlayStation symbols", () => {
    expect(glyphFor("playstation", "confirm").src).toContain("cross");
    expect(glyphFor("playstation", "back").src).toContain("circle");
    expect(glyphFor("playstation", "west").src).toContain("square");
    expect(glyphFor("playstation", "north").src).toContain("triangle");
    expect(glyphFor("playstation", "next").name).toBe("R1");
  });

  it("uses the Nintendo layout where A sits on the right", () => {
    expect(glyphFor("nintendo", "confirm").src).toContain("switch_button_a");
    expect(glyphFor("nintendo", "back").src).toContain("switch_button_b");
    expect(glyphFor("nintendo", "west").name).toBe("Y");
    expect(glyphFor("nintendo", "north").name).toBe("X");
    expect(glyphFor("nintendo", "previous").name).toBe("L");
  });

  it("points every glyph at a file that ships with the site", () => {
    const sources = allGlyphSources();
    expect(sources.length).toBeGreaterThan(20);
    for (const source of sources) {
      expect(existsSync(join(publicDir, source)), source).toBe(true);
    }
  });
});

describe("glyphForPress", () => {
  it("shows the D-pad for directional presses", () => {
    expect(glyphForPress("up")).toBe("dpad");
    expect(glyphForPress("left")).toBe("dpad");
    expect(glyphForPress("confirm")).toBe("confirm");
  });
});
