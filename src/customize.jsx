/* customize.jsx — per-component popover: position, style, size(s), opacity, color, panel */

const TINT_PRESETS = [
  "#ff5a2c", "#ff8a3c", "#ffd23c", "#b6ff3c", "#3cff8a", "#18c98a", "#14e3ff", "#3c8aff",
  "#b388ff", "#ff3c8a", "#ff3c3c", "#0fae5a", "#e8e8ec", "#9aa0aa", "#5b616b", "#0a0a0c",
];

const BRD_PRESETS = [
  "#ffffff", "#ff5a2c", "#18c98a", "#b6ff3c", "#14e3ff", "#b388ff", "#ff3c8a", "#5b616b",
];

const STYLE_OPTS = [
  { v: "auto", l: "Auto" },
  { v: "glass", l: "Glass" },
  { v: "hud", l: "HUD" },
  { v: "brutal", l: "Brutal" },
  { v: "plain", l: "Plano" },
];

function PositionPicker({ value, onChange }) {
  const { cols, rows } = window.GRID || { cols: 5, rows: 5 };
  return (
    <div className="pos-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols * rows }, (_, i) => (
        <button key={i} className={"pos-cell" + (i === value ? " on" : "")}
          title={`Fila ${Math.floor(i / cols) + 1}, Col ${(i % cols) + 1}`}
          onClick={() => onChange(i)} />
      ))}
    </div>
  );
}

const ANCHOR_LABELS = ["↖ Arriba izq.", "↑ Arriba", "↗ Arriba der.", "← Izquierda", "• Centro", "→ Derecha", "↙ Abajo izq.", "↓ Abajo", "↘ Abajo der."];

function AnchorPicker({ value, onChange }) {
  return (
    <div className="anchor-grid">
      {Array.from({ length: 9 }, (_, i) => (
        <button key={i} className={"anchor-cell" + (i === value ? " on" : "")}
          title={ANCHOR_LABELS[i]} onClick={() => onChange(i)}>
          <span />
        </button>
      ))}
    </div>
  );
}

function Slider({ label, value, min, max, step, fmt, onChange }) {
  return (
    <>
      <div className="cp-lbl">{label} <span className="cp-val">{fmt ? fmt(value) : value}</span></div>
      <input type="range" className="cp-slider" min={min} max={max} step={step}
        value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </>
  );
}

function ComponentPopover({ comp, config, onConfig, onClose, anchorRect }) {
  const ref = React.useRef(null);
  const [box, setBox] = React.useState({ left: -9999, top: -9999 });
  const [moved, setMoved] = React.useState(false);
  const [open, setOpen] = React.useState("size");

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !anchorRect || moved) return;
    const w = el.offsetWidth, h = el.offsetHeight;
    const pad = 10;
    let left = anchorRect.right + 12;
    let top = anchorRect.top;
    // prefer to the right of the gear; flip left if no room
    if (left + w > window.innerWidth - pad) left = anchorRect.left - w - 12;
    if (left < pad) left = Math.max(pad, Math.min(anchorRect.left, window.innerWidth - w - pad));
    top = Math.max(pad, Math.min(top, window.innerHeight - h - pad));
    setBox({ left, top });
  }, [anchorRect, moved]);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); };
  }, []);

  const startDrag = (e) => {
    if (e.target.closest(".x")) return;
    const r = ref.current.getBoundingClientRect();
    const ox = e.clientX - r.left, oy = e.clientY - r.top;
    setMoved(true);
    const onMove = (ev) => {
      const w = ref.current.offsetWidth, h = ref.current.offsetHeight, m = 6;
      const left = Math.max(m, Math.min(ev.clientX - ox, window.innerWidth - w - m));
      const top = Math.max(m, Math.min(ev.clientY - oy, window.innerHeight - h - m));
      setBox({ left, top });
    };
    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };

  const pct = (n) => Math.round(n * 100) + "%";

  const styLabel = (STYLE_OPTS.find((s) => s.v === config.style) || STYLE_OPTS[0]).l;

  const sections = [
    {
      id: "size", title: "Tamaño y opacidad",
      summary: `${pct(config.size)} · ${pct(config.opacity)}`,
      body: (
        <>
          <Slider label="Tamaño" value={config.size} min={0.4} max={2.4} step={0.05} fmt={pct}
            onChange={(v) => onConfig({ size: v })} />
          <Slider label="Opacidad" value={config.opacity} min={0.25} max={1} step={0.05} fmt={pct}
            onChange={(v) => onConfig({ opacity: v })} />
        </>
      ),
    },
    {
      id: "style", title: "Estilo y color",
      summary: styLabel,
      swatch: config.color || "var(--accent)",
      body: (
        <>
          <div className="cp-lbl">Estilo de interfaz</div>
          <div className="sty-chips">
            {STYLE_OPTS.map((s) => (
              <button key={s.v} className={config.style === s.v ? "on" : ""} onClick={() => onConfig({ style: s.v })}>{s.l}</button>
            ))}
          </div>
          <div className="cp-lbl">Color de acento</div>
          <window.ColorPicker value={config.color || ""} presets={TINT_PRESETS}
            onChange={(c) => onConfig({ color: c })}
            onReset={config.color ? () => onConfig({ color: null }) : null} />
        </>
      ),
    },
  ];

  return (
    <div ref={ref} className="cpop compact" style={{ left: box.left, top: box.top }}>
      <h3 className="cpop-drag" onPointerDown={startDrag}>
        <span className="cpop-grip" aria-hidden="true"><window.IcSliders /></span>
        {comp.label}
        <button className="x" onClick={onClose}>×</button>
      </h3>

      <div className="cp-acc">
        {sections.map((s) => {
          const isOpen = open === s.id;
          return (
            <div key={s.id} className={"cp-sec" + (isOpen ? " open" : "")}>
              <button className="cp-sec-head" onClick={() => setOpen(isOpen ? null : s.id)}>
                <span className="cp-sec-title">{s.title}</span>
                {!isOpen && (
                  <span className="cp-sec-sum">
                    {s.swatch && <i className="cp-sec-dot" style={{ background: s.swatch }} />}
                    {s.summary}
                  </span>
                )}
                <span className="cp-sec-chev"><window.IcChevron /></span>
              </button>
              {isOpen && <div className="cp-sec-body">{s.body}</div>}
            </div>

            <div className="cp-lbl">Color de texto</div>
              <window.ColorPicker value={config.textColor || ""} presets={BRD_PRESETS}
                onChange={(c) => onConfig({ textColor: c })}
                onReset={config.textColor ? () => onConfig({ textColor: null }) : null}
            />
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { ComponentPopover, PositionPicker, TINT_PRESETS });
