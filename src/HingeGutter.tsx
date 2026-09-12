import type { CSSProperties } from "react";
import { useIphoneDuo } from "./useIphoneDuo";

export interface HingeGutterProps {
  /** Width in px of the comfort band straddling the physical crease. Default 32. */
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * The Duo's display is one continuous OLED panel (no hinge gap to lay out
 * around, unlike Surface Duo-style dual-screen devices) but it does have a
 * physical crease down the middle when unfolded. Drop this as a flex/grid
 * child between two panes to keep interactive controls and small text off
 * the crease for comfort. Renders nothing unless the device is unfolded.
 */
export function HingeGutter({ size = 32, className, style }: HingeGutterProps) {
  const { isUnfolded } = useIphoneDuo();
  if (!isUnfolded) return null;
  return <div aria-hidden="true" className={className} style={{ width: size, flexShrink: 0, ...style }} />;
}
