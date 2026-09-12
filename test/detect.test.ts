import { describe, expect, it } from "vitest";
import { classifyViewport, getDuoProfiles, registerDuoProfile } from "../src/detect";

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
