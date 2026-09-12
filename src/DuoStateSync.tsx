import { useEffect } from "react";
import { useIphoneDuo } from "./useIphoneDuo";

/**
 * Mount once near your app root (e.g. Next.js root layout, as a client
 * component). Mirrors the current fold state onto <html> as
 * `data-duo-state="folded" | "unfolded" | "not-duo" | "unknown"` plus
 * `--duo-width` / `--duo-height` CSS custom properties, so plain CSS and
 * Tailwind (see `iphone-duo-responsive/tailwind`) can react to it without
 * every component needing the hook. Renders nothing.
 */
export function DuoStateSync(): null {
  const { state, width, height } = useIphoneDuo();

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-duo-state", state);
    root.style.setProperty("--duo-width", `${width}px`);
    root.style.setProperty("--duo-height", `${height}px`);
    return () => {
      root.removeAttribute("data-duo-state");
      root.style.removeProperty("--duo-width");
      root.style.removeProperty("--duo-height");
    };
  }, [state, width, height]);

  return null;
}
