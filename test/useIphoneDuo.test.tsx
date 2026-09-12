import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useIphoneDuo } from "../src/useIphoneDuo";

function setViewport(width: number, height: number, dpr = 3) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
  Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: dpr });
}

beforeEach(() => {
  Object.defineProperty(window, "ontouchstart", { configurable: true, value: () => {} });
  setViewport(466, 678);
});

afterEach(() => {
  cleanup();
});

describe("useIphoneDuo", () => {
  it("reports the folded state for the folded viewport size", async () => {
    const { result } = renderHook(() => useIphoneDuo());
    await waitFor(() => expect(result.current.state).toBe("folded"));
    expect(result.current.isFolded).toBe(true);
    expect(result.current.isDuo).toBe(true);
  });

  it("updates to unfolded when the viewport resizes", async () => {
    const { result } = renderHook(() => useIphoneDuo());
    await waitFor(() => expect(result.current.state).toBe("folded"));

    act(() => {
      setViewport(890, 626);
      window.dispatchEvent(new Event("resize"));
    });

    await waitFor(() => expect(result.current.state).toBe("unfolded"));
    expect(result.current.isUnfolded).toBe(true);
  });

  it("reports not-duo for an ordinary phone viewport", async () => {
    setViewport(393, 852);
    const { result } = renderHook(() => useIphoneDuo());
    await waitFor(() => expect(result.current.state).toBe("not-duo"));
    expect(result.current.isDuo).toBe(false);
  });
});
