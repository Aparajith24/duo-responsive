import { DuoStateSync, HingeGutter, useIphoneDuo } from "iphone-duo-responsive";
import { useRelaxedDuoState } from "./useRelaxedDuoState";

function Pill({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className={`pill ${good ? "pill-good" : ""}`}>
      <span className="pill-label">{label}</span>
      <span className="pill-value">{value}</span>
    </div>
  );
}

export function App() {
  const strict = useIphoneDuo();
  const relaxed = useRelaxedDuoState();

  return (
    <>
      {/* Mounts data-duo-state + --duo-width/--duo-height on <html> */}
      <DuoStateSync />

      <div className="page">
        <header>
          <h1>iphone-duo-responsive</h1>
          <p>
            Resize this window (or use Chrome DevTools device toolbar) to <strong>466 × 678</strong> for
            "folded" and <strong>890 × 626</strong> for "unfolded". No real Duo needed to see the layout react.
          </p>
        </header>

        <section className="readout">
          <div className="readout-block">
            <h2>useIphoneDuo() — strict (real default)</h2>
            <div className="pills">
              <Pill label="state" value={strict.state} good={strict.isDuo} />
              <Pill label="size" value={`${strict.width} × ${strict.height}`} />
              <Pill label="dpr" value={String(window.devicePixelRatio)} />
            </div>
            <p className="hint">
              Requires devicePixelRatio === 3 and touch support to match, so on a plain desktop browser
              window this will usually read "not-duo" even at the right size — that's correct, expected
              behavior (it's guarding against false positives). Enable a mobile device + touch emulation
              in DevTools to satisfy it for real.
            </p>
          </div>

          <div className="readout-block">
            <h2>Relaxed (size only, no dpr/touch check)</h2>
            <div className="pills">
              <Pill label="state" value={relaxed.state} good={relaxed.state !== "not-duo"} />
              <Pill label="size" value={`${relaxed.width} × ${relaxed.height}`} />
            </div>
            <p className="hint">This is what drives the layout demo below, so it works on any desktop browser.</p>
          </div>
        </section>

        <section className={`layout-demo ${relaxed.state}`}>
          <h2>Layout reacting to fold state (driven by the relaxed reading, works on any desktop browser)</h2>
          <div className="two-pane">
            <div className="pane pane-a">Pane A</div>
            {relaxed.state === "unfolded" && <div className="gutter" style={{ width: 24 }} aria-hidden="true" />}
            <div className="pane pane-b">Pane B</div>
          </div>
          <p className="hint">
            Narrow/tall (~466×678): stacked. Wide/short (~890×626): side by side with a gutter straddling
            the crease.
          </p>
        </section>

        <section className="readout-block">
          <h2>{"<HingeGutter />"} (library component, strict — needs real dpr/touch match)</h2>
          <div style={{ display: "flex", border: "1px dashed var(--border)", minHeight: 40 }}>
            <div style={{ flex: 1, padding: 8 }}>Sidebar</div>
            <HingeGutter size={24} />
            <div style={{ flex: 1, padding: 8 }}>Content</div>
          </div>
          <p className="hint">Renders nothing unless the strict hook above reports "unfolded".</p>
        </section>
      </div>
    </>
  );
}
