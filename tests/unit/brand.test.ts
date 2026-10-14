import { describe, expect, it } from "vitest";
import { brandFor } from "../../src/lib/gamepad/brand";

describe("brandFor", () => {
  it.each([
    ["Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b13)", "xbox"],
    ["Xbox 360 Controller (XInput STANDARD GAMEPAD)", "xbox"],
    ["045e-02ea-Microsoft X-Box One S pad", "xbox"],
    ["DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)", "playstation"],
    ["Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 09cc)", "playstation"],
    ["054c-05c4-Sony Computer Entertainment Wireless Controller", "playstation"],
    ["Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)", "nintendo"],
    ["057e-2006-Joy-Con (L)", "nintendo"],
    ["Generic USB Joystick (Vendor: 0079 Product: 0006)", "generic"],
    ["", "generic"],
  ])("detects %s as %s", (id, brand) => {
    expect(brandFor(id)).toBe(brand);
  });
});
