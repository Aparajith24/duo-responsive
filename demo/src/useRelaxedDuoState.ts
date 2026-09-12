import { useEffect, useState } from "react";
import { classifyViewport, type DuoSnapshot } from "iphone-duo-responsive";

/**
 * Demo-only helper: classifies the viewport WITHOUT requiring
 * devicePixelRatio===3 or touch support, so you can see fold/unfold
 * detection purely from window size on a plain desktop browser (no device
 * emulation needed). The real `useIphoneDuo()` hook uses strict matching
 * by default — see the side-by-side reading in the demo UI.
 */
export function useRelaxedDuoState(): DuoSnapshot {
  const [snapshot, setSnapshot] = useState<DuoSnapshot>(() =>
    classifyViewport(window.innerWidth, window.innerHeight, { strict: false })
  );

  useEffect(() => {
    const update = () => setSnapshot(classifyViewport(window.innerWidth, window.innerHeight, { strict: false }));
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return snapshot;
}
