import { useSyncExternalStore } from "react";
import { getCurrentDuoSnapshot, subscribeDuoState } from "./subscribe";
import type { DuoSnapshot } from "./types";

const SERVER_SNAPSHOT: DuoSnapshot = { state: "unknown", width: 0, height: 0, profileId: null };

function getServerSnapshot(): DuoSnapshot {
  return SERVER_SNAPSHOT;
}

export interface UseIphoneDuoResult extends DuoSnapshot {
  /** true once we're confident this is a Duo, in either fold state */
  isDuo: boolean;
  isFolded: boolean;
  isUnfolded: boolean;
}

/**
 * React hook reporting the iPhone Duo's fold state, derived from viewport
 * shape since Safari has no native fold-detection API. Returns
 * state: "unknown" during SSR and until the first client render settles,
 * so gate any layout branching on `isDuo`/`isFolded`/`isUnfolded` rather
 * than assuming a default to avoid hydration mismatches.
 */
export function useIphoneDuo(): UseIphoneDuoResult {
  const snapshot = useSyncExternalStore(subscribeDuoState, getCurrentDuoSnapshot, getServerSnapshot);

  return {
    ...snapshot,
    isDuo: snapshot.state === "folded" || snapshot.state === "unfolded",
    isFolded: snapshot.state === "folded",
    isUnfolded: snapshot.state === "unfolded",
  };
}
