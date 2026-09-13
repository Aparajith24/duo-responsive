import { describe, expect, it } from "vitest";
import { classifyViewport, getDuoProfiles, getFoldStateFromWindow, registerDuoProfile } from "../src/detect";

describe("classifyViewport", () => {
  it("classifies the folded iPhone Duo viewport", () => {
    const result = classifyViewport(466, 678, { dpr: 3, hasTouch: true });
    expect(result.state).toBe("folded");
    expect(result.profileId).toBe("iphone-duo");
  });

  it("classifies the unfolded iPhone Duo viewport", () => {
    const result = classifyViewport(890, 626, { dpr: 3, hasTouch: true });
    expect(result.state).toBe("unfolded");
  });

  it("classifies the unfolded viewport rotated to portrait", () => {
    const result = classifyViewport(626, 890, { dpr: 3, hasTouch: true });
    expect(result.state).toBe("unfolded");
  });

  it("tolerates small measurement noise", () => {
    const result = classifyViewport(470, 682, { dpr: 3, hasTouch: true });
    expect(result.state).toBe("folded");
  });

  it("reports not-duo for a regular phone viewport", () => {
    const result = classifyViewport(393, 852, { dpr: 3, hasTouch: true });
    expect(result.state).toBe("not-duo");
  });

  it("reports not-duo for a desktop-sized viewport", () => {
    const result = classifyViewport(1440, 900, { dpr: 2, hasTouch: false });
    expect(result.state).toBe("not-duo");
  });

  it("rejects a matching size with the wrong devicePixelRatio in strict mode", () => {
    const result = classifyViewport(466, 678, { dpr: 2, hasTouch: true });
    expect(result.state).toBe("not-duo");
  });

  it("rejects a matching size with no touch support in strict mode", () => {
    const result = classifyViewport(466, 678, { dpr: 3, hasTouch: false });
    expect(result.state).toBe("not-duo");
  });

  it("ignores dpr/touch when strict is false", () => {
    const result = classifyViewport(466, 678, { strict: false, dpr: 2, hasTouch: false });
    expect(result.state).toBe("folded");
  });

  it("lets consumers register a future Duo profile", () => {
    registerDuoProfile({
      id: "iphone-duo-max",
      foldedLong: 720,
      foldedShort: 500,
      unfoldedLong: 950,
      unfoldedShort: 680,
      dpr: 3,
    });

    expect(getDuoProfiles().some((p) => p.id === "iphone-duo-max")).toBe(true);

    const result = classifyViewport(720, 500, { dpr: 3, hasTouch: true });
    expect(result.state).toBe("folded");
    expect(result.profileId).toBe("iphone-duo-max");
  });
});

describe("getFoldStateFromWindow", () => {
  function fakeWindow(overrides: Partial<{ innerWidth: number; innerHeight: number; screenWidth: number; screenHeight: number; dpr: number }>): Window {
    return {
      innerWidth: overrides.innerWidth ?? 0,
      innerHeight: overrides.innerHeight ?? 0,
      screen: { width: overrides.screenWidth ?? 0, height: overrides.screenHeight ?? 0 },
      devicePixelRatio: overrides.dpr ?? 3,
      navigator: { maxTouchPoints: 5 },
      ontouchstart: null,
    } as unknown as Window;
  }

  it("uses screen dimensions, not innerWidth/innerHeight, so Safari page zoom doesn't misclassify fold state", () => {
    // Unfolded device, but Safari's aA "Zoom In" has shrunk the layout
    // viewport to look folded-sized. screen.width/height still report the
    // true unfolded physical size and should win.
    const win = fakeWindow({ innerWidth: 466, innerHeight: 678, screenWidth: 890, screenHeight: 626 });
    const result = getFoldStateFromWindow(win);
    expect(result.state).toBe("unfolded");
  });

  it("falls back to innerWidth/innerHeight when screen dimensions are unavailable", () => {
    const win = fakeWindow({ innerWidth: 466, innerHeight: 678, screenWidth: 0, screenHeight: 0 });
    const result = getFoldStateFromWindow(win);
    expect(result.state).toBe("folded");
  });
});
