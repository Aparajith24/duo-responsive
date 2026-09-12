export type { DuoFoldState, DuoSnapshot, DuoViewportProfile, ClassifyOptions } from "./types";

export { IPHONE_DUO_PROFILE, registerDuoProfile, getDuoProfiles, classifyViewport, getFoldStateFromWindow } from "./detect";

export { subscribeDuoState, getCurrentDuoSnapshot } from "./subscribe";

export { useIphoneDuo } from "./useIphoneDuo";
export type { UseIphoneDuoResult } from "./useIphoneDuo";

export { DuoStateSync } from "./DuoStateSync";
export { HingeGutter } from "./HingeGutter";
export type { HingeGutterProps } from "./HingeGutter";
