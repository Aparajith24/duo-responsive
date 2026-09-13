import type { ClassifyOptions, DuoFoldState, DuoSnapshot, DuoViewportProfile } from "./types";

export type { ClassifyOptions } from "./types";

/**
 * Logical CSS viewport dimensions for the first-generation iPhone Duo, as
 * reported by webmobilefirst.com after launch (folded 466x678pt, unfolded
 * 890x626pt, devicePixelRatio 3). Safari does not expose a native fold API
 * (the CSS Viewport Segments spec is Chrome/Edge only), so this is a
 * best-effort viewport-shape heuristic, not a guarantee.
 */
export const IPHONE_DUO_PROFILE: DuoViewportProfile = {
  id: "iphone-duo",
  foldedLong: 678,
  foldedShort: 466,
  unfoldedLong: 890,
  unfoldedShort: 626,
  dpr: 3,
  tolerance: 20,
};

const registeredProfiles: DuoViewportProfile[] = [IPHONE_DUO_PROFILE];

/**
 * Register (or replace, by id) a viewport profile. Use this to add future
 * Duo models (e.g. a larger "iPhone Duo Max") without waiting on a package
 * update, or to widen/narrow tolerance for your own testing.
 */
export function registerDuoProfile(profile: DuoViewportProfile): void {
  const existingIndex = registeredProfiles.findIndex((p) => p.id === profile.id);
  if (existingIndex >= 0) {
    registeredProfiles[existingIndex] = profile;
  } else {
    registeredProfiles.push(profile);
  }
}

export function getDuoProfiles(): readonly DuoViewportProfile[] {
  return registeredProfiles;
}

function within(value: number, target: number, tolerance: number): boolean {
  return Math.abs(value - target) <= tolerance;
}

/**
 * Classify a viewport size against all registered Duo profiles.
 * Orientation-independent: compares the long/short edges regardless of
 * whether the device is held portrait or landscape in either fold state.
 */
export function classifyViewport(width: number, height: number, options: ClassifyOptions = {}): DuoSnapshot {
  const { strict = true, dpr, hasTouch } = options;
  const long = Math.max(width, height);
  const short = Math.min(width, height);

  for (const profile of registeredProfiles) {
    const tolerance = profile.tolerance ?? 20;

    const matchesFolded = within(long, profile.foldedLong, tolerance) && within(short, profile.foldedShort, tolerance);
    const matchesUnfolded = within(long, profile.unfoldedLong, tolerance) && within(short, profile.unfoldedShort, tolerance);

    if (!matchesFolded && !matchesUnfolded) continue;

    if (strict) {
      if (dpr !== undefined && dpr !== profile.dpr) continue;
      if (hasTouch === false) continue;
    }

    const state: DuoFoldState = matchesFolded ? "folded" : "unfolded";
    return { state, width, height, profileId: profile.id };
  }

  return { state: "not-duo", width, height, profileId: null };
}

function getPhysicalViewportSize(win: Window): { width: number; height: number } {
  const screenWidth = win.screen?.width;
  const screenHeight = win.screen?.height;
  if (screenWidth && screenHeight) {
    return { width: screenWidth, height: screenHeight };
  }
  return { width: win.innerWidth, height: win.innerHeight };
}

/** Read the current window size and classify it. Safe to call only in a browser. */
export function getFoldStateFromWindow(win: Window = window, options?: ClassifyOptions): DuoSnapshot {
  const dpr = win.devicePixelRatio;
  const hasTouch = "ontouchstart" in win || (win.navigator?.maxTouchPoints ?? 0) > 0;
  const { width, height } = getPhysicalViewportSize(win);
  return classifyViewport(width, height, {
    dpr,
    hasTouch,
    ...options,
  });
}
