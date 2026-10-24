import { describe, expect, it } from "vitest";
import { translations } from "../../src/lib/i18n/translations";
import { rumboCopy } from "../../src/lib/data/rumbo";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(shape);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, nested]) => [key, shape(nested)])
    );
  }
  return typeof value;
}

function emptyStrings(value: unknown, path = ""): string[] {
  if (typeof value === "string") {
    return value.trim() === "" ? [path] : [];
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, nested]) => emptyStrings(nested, `${path}.${key}`));
  }
  return [];
}

describe("translations", () => {
  it("have the same keys in Spanish and English", () => {
    expect(shape(translations.en)).toEqual(shape(translations.es));
  });

  it("have no empty texts", () => {
    expect(emptyStrings(translations.es)).toEqual([]);
    expect(emptyStrings(translations.en)).toEqual([]);
  });
});

describe("Rumbo copy", () => {
  it("has the same structure in Spanish and English", () => {
    expect(shape(rumboCopy.en)).toEqual(shape(rumboCopy.es));
  });

  it("has no empty texts", () => {
    expect(emptyStrings(rumboCopy.es)).toEqual([]);
    expect(emptyStrings(rumboCopy.en)).toEqual([]);
  });

  it("keeps the same images in both languages", () => {
    expect(rumboCopy.en.shots.map((shot) => shot.image)).toEqual(
      rumboCopy.es.shots.map((shot) => shot.image)
    );
    expect(rumboCopy.en.homeShot.image).toBe(rumboCopy.es.homeShot.image);
  });

  it("has a counter template with both placeholders", () => {
    for (const copy of Object.values(rumboCopy)) {
      expect(copy.viewer.counter).toContain("{current}");
      expect(copy.viewer.counter).toContain("{total}");
    }
  });
});
