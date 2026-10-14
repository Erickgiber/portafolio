export type GamepadBrand = "xbox" | "playstation" | "nintendo" | "generic";

const BRAND_PATTERNS: [GamepadBrand, RegExp][] = [
  ["xbox", /045e|xbox|xinput/i],
  ["playstation", /054c|playstation|dualshock|dualsense/i],
  ["nintendo", /057e|nintendo|pro controller|joy-?con/i],
  ["playstation", /wireless controller/i],
];

export function brandFor(id: string): GamepadBrand {
  return BRAND_PATTERNS.find(([, pattern]) => pattern.test(id))?.[0] ?? "generic";
}
