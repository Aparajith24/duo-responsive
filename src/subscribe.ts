import { getFoldStateFromWindow } from "./detect";
import type { DuoSnapshot } from "./types";

type Listener = (snapshot: DuoSnapshot) => void;

const listeners = new Set<Listener>();
let current: DuoSnapshot | null = null;
let rafId: number | null = null;
let attached = false;

function computeAndNotify(): void {
  rafId = null;
  const next = getFoldStateFromWindow();
  const prev = current;
  current = next;
  if (!prev || prev.state !== next.state || prev.width !== next.width || prev.height !== next.height) {
    listeners.forEach((listener) => listener(next));
  }
}

function scheduleUpdate(): void {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(computeAndNotify);
}

function attach(): void {
  if (attached || typeof window === "undefined") return;
  attached = true;
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("orientationchange", scheduleUpdate);
  current = getFoldStateFromWindow();
}

function detach(): void {
  if (!attached || typeof window === "undefined") return;
  window.removeEventListener("resize", scheduleUpdate);
  window.removeEventListener("orientationchange", scheduleUpdate);
  attached = false;
  current = null;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

/** Subscribe to fold-state changes. A single resize/orientationchange listener is shared across all subscribers. */
export function subscribeDuoState(listener: Listener): () => void {
  attach();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) detach();
  };
}

/** Get the last computed snapshot, computing one on first access. Returns an "unknown" snapshot on the server. */
export function getCurrentDuoSnapshot(): DuoSnapshot {
  if (typeof window === "undefined") {
    return { state: "unknown", width: 0, height: 0, profileId: null };
  }
  if (!current) {
    current = getFoldStateFromWindow();
  }
  return current;
}
