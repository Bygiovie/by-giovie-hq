/* app.jsx — grid layout, per-component config, customize mode, controls */

const { useLocalStorage } = window;

const COMPONENTS = [
  { id: "brand", label: "Marca" },
  { id: "greeting", label: "Saludo" },
  { id: "clock", label: "Hora" },
  { id: "date", label: "Fecha" },
  { id: "search", label: "Buscador" },
  { id: "shortcuts", label: "Accesos directos" },
  { id: "weather", label: "Clima" },
];

// posición: anclaje por bordes (ax/ay) + desplazamiento en px (ox/oy)
//   ax: "left" | "center" | "right"   ·   ay: "top" | "center" | "bottom"
// así los elementos quedan pegados a su borde y NO se descuadran al cambiar de tamaño.
const DEFAULT_LAYOUT = {
  brand:     { ax: "left",   ox: 22, ay: "top",    oy: 20,  style: "auto", size: 0.88, opacity: null, color: null },
  greeting:  { ax: "left",   ox: 26, ay: "top",    oy: 150, style: "auto", size: 1,    opacity: 1, color: null },
  clock:     { ax: "left",   ox: 22, ay: "top",    oy: 205, style: "auto", size: 0.92, opacity: 1, color: null },
  date:      { ax: "left",   ox: 26, ay: "top",    oy: 360, style: "auto", size: 1,    opacity: 1, color: null },
  search:    { ax: "left",   ox: 26, ay: "top",    oy: 425, style: "auto", size: 1,    opacity: 1, color: null },
  shortcuts: { ax: "center", ox: 0,  ay: "bottom", oy: 34,  style: "auto", size: 1,    opacity: 1, color: null },
  weather:   { ax: "right",  ox: 22, ay: "top",    oy: 74,  style: "auto", size: 0.95, opacity: 1, color: null },
};

function Brand({ logo, textColor }) {
  return (
    <div className="brand" style={{ color: textColor || 'inherit' }}>
      <div className={"glyph" + (logo ? " has-img" : "")}>
        {logo ? <img src={logo} alt="logo" /> : "G"}
      </div>
      <div className="name">
        <b>By Giovie</b>
        <span><i className="dot" /> Inicio · v3</span>
      </div>
    </div>
  );
}

function Cell({ comp, cfg, customizing, stageRef, onGear, onMove, children }) {
  const ref = React.useRef(null);
  const scaleRef = React.useRef(null);
  const [drag, setDrag] = React.useState(null); // {left, top} px relativos al stage durante el arrastre
  const [pos, setPos] = React.useState(null);   // {left, top} px calculados desde el anclaje

  // calcula la posición real (px) a partir del anclaje + tamaño VISIBLE medido.
  // se recalcula al cambiar tamaño de ventana o del componente, manteniendo
  // cada elemento pegado a su borde sin saltos ni descuadres.
  React.useLayoutEffect(() => {
    const compute = () => {
      const stage = stageRef.current, el = scaleRef.current;
      if (!stage || !el) return;
      const g = stage.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const vw = r.width, vh = r.height;
      const ax = cfg.ax || "left", ay = cfg.ay || "top";
      const ox = cfg.ox != null ? cfg.ox : 22, oy = cfg.oy != null ? cfg.oy : 22;
      let left = ax === "left" ? ox : ax === "right" ? g.width - ox - vw : (g.width - vw) / 2 + ox;
      let top = ay === "top" ? oy : ay === "bottom" ? g.height - oy - vh : (g.height - vh) / 2 + oy;
      left = Math.max(0, Math.min(left, Math.max(0, g.width - vw)));
      top = Math.max(0, Math.min(top, Math.max(0, g.height - vh)));
      setPos({ left, top });
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (scaleRef.current) ro.observe(scaleRef.current);
    window.addEventListener("resize", compute);
    return () => { ro.disconnect(); window.removeEventListener("resize", compute); };
  }, [cfg.ax, cfg.ay, cfg.ox, cfg.oy, cfg.size]);

  const down = (e) => {
    if (!customizing) return;
    if (e.target.closest(".cell-gear")) return;
    const stage = stageRef.current;
    if (!stage) return;
    const vis = scaleRef.current.getBoundingClientRect();
    const grabX = e.clientX - vis.left, grabY = e.clientY - vis.top;
    const w = vis.width, h = vis.height;
    const sx = e.clientX, sy = e.clientY;
    let moved = false, last = null;
    const onMv = (ev) => {
      const g = stage.getBoundingClientRect();
      if (!moved && Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 4) moved = true;
      if (!moved) return;
      let left = ev.clientX - grabX - g.left;
      let top = ev.clientY - grabY - g.top;
      left = Math.max(0, Math.min(left, g.width - w));
      top = Math.max(0, Math.min(top, g.height - h));
      last = { left, top, w, h };
      setDrag({ left, top });
    };
    const onUp = () => {
      document.removeEventListener("pointermove", onMv);
      document.removeEventListener("pointerup", onUp);
      if (moved && last) {
        const g = stage.getBoundingClientRect();
        const cx = last.left + last.w / 2, cy = last.top + last.h / 2;
        let ax, ox;
        if (cx < g.width / 3) { ax = "left"; ox = Math.round(last.left); }
        else if (cx > g.width * 2 / 3) { ax = "right"; ox = Math.round(g.width - (last.left + last.w)); }
        else { ax = "center"; ox = Math.round(cx - g.width / 2); }
        let ay, oy;
        if (cy < g.height / 3) { ay = "top"; oy = Math.round(last.top); }
        else if (cy > g.height * 2 / 3) { ay = "bottom"; oy = Math.round(g.height - (last.top + last.h)); }
        else { ay = "center"; oy = Math.round(cy - g.height / 2); }
        onMove(comp.id, { ax, ox, ay, oy });
      }
      setDrag(null);
    };
    document.addEventListener("pointermove", onMv);
    document.addEventListener("pointerup", onUp);
  };

  const place = drag || pos;
  const cellStyle = place
    ? { left: place.left + "px", top: place.top + "px", right: "auto", bottom: "auto", transform: "none" }
    : { left: (cfg.ox != null ? cfg.ox : 22) + "px", top: (cfg.oy != null ? cfg.oy : 22) + "px", opacity: 0 };
  if (cfg.color) cellStyle["--accent"] = cfg.color;

  const scaleStyle = {
    transform: `scale(${cfg.size})`,
    transformOrigin: "top left",
    opacity: cfg.opacity,
  };

  return (
    <div ref={ref}
      className={"cell" + (customizing ? " customizing" : "") + (drag ? " dragging" : "")}
      style={cellStyle}
      data-sty={cfg.style !== "auto" ? cfg.style : undefined}
      onPointerDown={down}>
      {customizing && (
        <button className="cell-gear" title={"Ajustar " + comp.label}
          onClick={(e) => { e.stopPropagation(); onGear(comp.id, e.currentTarget.getBoundingClientRect()); }}>
          <window.IcSliders />
        </button>
      )}
      <div ref={scaleRef} className="cell-scale" style={scaleStyle}>{children}</div>
    </div>
  );
}

/* Independent draggable control button (click vs drag disambiguated) */
function FloatButton({ pos, setPos, title, active, spin, onClick, children }) {
  const ref = React.useRef(null);
  const st = React.useRef(null);
  const skip = React.useRef(false);
  const down = (e) => {
    const r = ref.current.getBoundingClientRect();
    st.current = { ox: e.clientX - r.left, oy: e.clientY - r.top, sx: e.clientX, sy: e.clientY, moved: false };
    try { ref.current.setPointerCapture(e.pointerId); } catch (_) {}
  };
  const move = (e) => {
    const s = st.current;
    if (!s) return;
    if (!s.moved && Math.abs(e.clientX - s.sx) + Math.abs(e.clientY - s.sy) > 4) s.moved = true;
    if (!s.moved) return;
    const sz = 44, m = 8;
    const left = Math.max(m, Math.min(e.clientX - s.ox, window.innerWidth - sz - m));
    const top = Math.max(m, Math.min(e.clientY - s.oy, window.innerHeight - sz - m));
    setPos({ left, top });
  };
  const up = () => {
    const s = st.current;
    st.current = null;
    skip.current = !!(s && s.moved);
  };
  return (
    <button ref={ref} className={"float-btn icon-btn" + (active ? " on" : "") + (spin ? " spin" : "")}
      title={title + " · arrastra para mover"}
      style={{ left: pos.left, top: pos.top }}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      onClick={() => { if (skip.current) { skip.current = false; return; } onClick(); }}>
      {children}
    </button>
  );
}

function App() {
  const [name, setName] = useLocalStorage("bg_name", "Giovie");
  const [city, setCity] = useLocalStorage("bg_city", "Coquimbo");

  const [engines, setEngines] = useLocalStorage("bg_engines", window.DEFAULT_ENGINES);
  const [activeEngine, setActiveEngine] = useLocalStorage("bg_active_engine", "google");
  const [multiEngine, setMultiEngine] = useLocalStorage("bg_multi", false);
  const [searchAlign, setSearchAlign] = useLocalStorage("bg_search_align", "left");

  const [shortcuts, setShortcuts] = useLocalStorage("bg_shortcuts", window.DEFAULT_SHORTCUTS);
  const [wallpaper, setWallpaper] = useLocalStorage("bg_wallpaper", window.WALLPAPERS[0]);
  const [userWallpapers, setUserWallpapers] = useLocalStorage("bg_user_wp", []);

  const [theme, setTheme] = useLocalStorage("bg_theme", "glass");
  const [accent, setAccent] = useLocalStorage("bg_accent", "#ff5a2c");
  const [logo, setLogo] = useLocalStorage("bg_logo", null);
  const [blur, setBlur] = useLocalStorage("bg_blur", 0);
  const [dim, setDim] = useLocalStorage("bg_dim", 0);
  const [vis, setVis] = useLocalStorage("bg_vis_v2", {
    brand: true, greeting: true, clock: true, date: true, search: true, shortcuts: true, weather: true,
  });
  const [layout, setLayout] = useLocalStorage("bg_layout_anchor", DEFAULT_LAYOUT);

  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [customizing, setCustomizing] = React.useState(false);
  const [popover, setPopover] = React.useState(null); // {id, rect}

  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const [gearPos, setGearPos] = useLocalStorage("bg_gearpos", { left: vw - 44 - 24, top: 22 });

  const cfgFor = (id) => ({ ...DEFAULT_LAYOUT[id], ...(layout[id] || {}) });
  const setConfig = (id, patch) => setLayout((l) => ({ ...l, [id]: { ...cfgFor(id), ...patch } }));

  const onGear = (id, rect) => setPopover((p) => (p && p.id === id ? null : { id, rect }));
  const onMove = (id, xy) => setConfig(id, xy);
  const stageRef = React.useRef(null);

  const isVideoWp = wallpaper.type === "video" ||
    (wallpaper.type === "image" && /\.(mp4|webm|ogv|ogg|mov|m4v)(\?|#|$)/i.test(wallpaper.value || ""));
  const bgStyle = wallpaper.type === "image" && !isVideoWp
    ? { backgroundImage: `url("${wallpaper.value}")` }
    : (wallpaper.type === "gradient" ? { backgroundImage: wallpaper.value } : {});

  const blurPx = Math.round((blur / 100) * 40);

  const slots = {
    brand: <div onClick={() => {...}} style={{ cursor: 'pointer' }}>
      <Brand logo={logo} textColor={cfgFor('brand').textColor} />
    </div>,
    greeting: <window.Greeting name={name} />,
    clock: <window.ClockTime />,
    date: <window.DateBar />,
    search: <window.SearchBar engines={engines} setEngines={setEngines}
      activeId={activeEngine} setActiveId={setActiveEngine} multi={multiEngine} setMulti={setMultiEngine}
      align={searchAlign} setAlign={setSearchAlign} />,
    shortcuts: <window.ShortcutsDock shortcuts={shortcuts} />,
    weather: <window.WeatherWidget city={city} onClick={() => setSettingsOpen(true)} />,
  };

  return (
    <div className="stage" data-sty={theme} style={{ "--accent": accent, "--panel-blur": blurPx + "px", "--dim": dim / 100 }}>
      {isVideoWp
        ? <video className="bg bg-video" src={wallpaper.value} autoPlay loop muted playsInline key={wallpaper.value} />
        : <div className="bg" style={bgStyle} />}
      <div className="bg-scrim" />
      <div className="bg-grain" />

      <div className="grid-layer" ref={stageRef}>
        {COMPONENTS.filter((c) => vis[c.id]).map((c) => (
          <Cell key={c.id} comp={c} cfg={cfgFor(c.id)} customizing={customizing}
            stageRef={stageRef} onGear={onGear} onMove={onMove}>
            {slots[c.id]}
          </Cell>
        ))}
      </div>

{/* botón para salir de edición */}
{customizing && (
  <FloatButton pos={gearPos} setPos={setGearPos}
    title="Terminar edición" 
    onClick={() => { setCustomizing(false); setPopover(null); }}>
    <window.IcCheck />
  </FloatButton>
)}
      {/* per-component popover */}
      {popover && (
        <window.ComponentPopover
          comp={COMPONENTS.find((c) => c.id === popover.id)}
          config={cfgFor(popover.id)}
          onConfig={(patch) => setConfig(popover.id, patch)}
          onClose={() => setPopover(null)}
          anchorRect={popover.rect}
        />
      )}

      {/* settings */}
      {settingsOpen && (
        <window.SettingsDrawer
          onClose={() => setSettingsOpen(false)}
          name={name} setName={setName}
          city={city} setCity={setCity}
          logo={logo} setLogo={setLogo}
          theme={theme} setTheme={setTheme}
          accent={accent} setAccent={setAccent}
          wallpaper={wallpaper} setWallpaper={setWallpaper}
          userWallpapers={userWallpapers} setUserWallpapers={setUserWallpapers}
          blur={blur} setBlur={setBlur}
          dim={dim} setDim={setDim}
          shortcuts={shortcuts} setShortcuts={setShortcuts}
          vis={vis} setVis={setVis}
          onEditLayout={() => { setSettingsOpen(false); setCustomizing(true); }}
        />
      )}

      {/* tweaks (exploración rápida) */}
      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Estética global" />
        <window.TweakRadio label="Estilo" value={theme}
          options={[{ value: "glass", label: "Glass" }, { value: "hud", label: "HUD" }, { value: "brutal", label: "Brutal" }]}
          onChange={setTheme} />
        <window.TweakColor label="Acento" value={accent}
          options={["#ff5a2c", "#18c98a", "#b6ff3c", "#14e3ff", "#b388ff"]}
          onChange={setAccent} />
        <window.TweakSlider label="Difuminado fondo" value={blur} min={0} max={100} unit="" onChange={setBlur} />
        <window.TweakToggle label="Multibúsqueda" value={multiEngine} onChange={setMultiEngine} />
        <window.TweakSection label="Diseño" />
        <window.TweakToggle label="Modo editar diseño" value={customizing} onChange={(v) => { setCustomizing(v); setPopover(null); }} />
      </window.TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
