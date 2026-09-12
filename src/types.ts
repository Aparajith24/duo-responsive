export type DuoFoldState = "folded" | "unfolded" | "not-duo" | "unknown";

export interface DuoViewportProfile {
  /** Human-readable id, e.g. "iphone-duo" */
  id: string;
  /** Longer edge of the logical CSS viewport in the folded state, in CSS px */
  foldedLong: number;
  /** Shorter edge of the logical CSS viewport in the folded state, in CSS px */
  foldedShort: number;
  /** Longer edge of the logical CSS viewport in the unfolded state, in CSS px */
  unfoldedLong: number;
  /** Shorter edge of the logical CSS viewport in the unfolded state, in CSS px */
  unfoldedShort: number;
  /** Device pixel ratio this device reports */
  dpr: number;
  /** +/- px tolerance when matching a viewport against this profile */
  tolerance?: number;
}

export interface DuoSnapshot {
  state: DuoFoldState;
  width: number;
  height: number;
  /** Which registered profile matched, if any */
  profileId: string | null;
}

export interface ClassifyOptions {
  /** Require devicePixelRatio + touch support to match before reporting folded/unfolded. Default true. */
  strict?: boolean;
  dpr?: number;
  hasTouch?: boolean;
}
