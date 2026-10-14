import { describe, expect, it } from "vitest";
import { browserCountry, formatMoney } from "../../src/lib/checkout/rate";

describe("browserCountry", () => {
  it("reads the region of the browser language", () => {
    expect(browserCountry("es-VE")).toBe("VE");
    expect(browserCountry("es-MX")).toBe("MX");
    expect(browserCountry("pt-BR")).toBe("BR");
  });

  it("ignores languages without a country region", () => {
    expect(browserCountry("es-419")).toBe("");
    expect(browserCountry("not a language")).toBe("");
  });
});

describe("formatMoney", () => {
  it("formats amounts in the visitor currency", () => {
    expect(formatMoney(73.04, "VES", "es", "VE")).toMatch(/73,04/);
    expect(formatMoney(36.8, "MXN", "es", "MX")).toMatch(/36\.80/);
    expect(formatMoney(8200, "COP", "es", "CO")).toMatch(/8\.200/);
  });

  it("falls back to a plain amount for unknown currencies", () => {
    expect(formatMoney(5, "XYZ1", "es")).toBe("5.00 XYZ1");
  });
});
