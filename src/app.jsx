/* app.jsx — grid layout, per-component config, customize mode, controls */

const { useLocalStorage, useIndexedState } = window;

const COMPONENTS = [
  { id: "brand", label: "Marca" },
  { id: "greeting", label: "Saludo" },
  { id: "clock", label: "Hora" },
  { id: "date", label: "Fecha" },
  { id: "search", label: "Buscador" },
  { id: "shortcuts", label: "Accesos directos" },
  { id: "weather", label: "Clima" },
];

// posición libre: x / y en % del escenario (esquina superior izquierda del componente)
const DEFAULT_LAYOUT = {
  brand:     { x: 2,  y: 4,  style: "auto", size: 0.88, opacity: 1, color: null },
  greeting:  { x: 3,  y: 19, style: "auto", size: 1,    opacity: 1, color: null },
  clock:     { x: 2.5, y: 27, style: "auto", size: 0.92, opacity: 1, color: null },
  date:      { x: 3,  y: 47, style: "auto", size: 1,    opacity: 1, color: null },
  search:    { x: 3,  y: 56, style: "auto", size: 1,    opacity: 1, color: null },
  shortcuts: { x: 30, y: 82, style: "auto", size: 1,    opacity: 1, color: null },
  weather:   { x: 73, y: 7,  style: "auto", size: 0.95, opacity: 1, color: null },
};

function Brand({ logo }) {
  return (
    <div className="brand">
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
  const [drag, setDrag] = React.useState(null); // {x, y} % while dragging

  const down = (e) => {
    if (!customizing) return;
    if (e.target.closest(".cell-gear")) return;
    const r = ref.current.getBoundingClientRect();
    // tamaño VISIBLE (escalado): .cell-scale incluye su transform: scale()
    const scaleEl = ref.current.querySelector(".cell-scale");
    const vis = scaleEl ? scaleEl.getBoundingClientRect() : r;
    const ox = e.clientX - r.left, oy = e.clientY - r.top, w = vis.width, h = vis.height;
    const sx = e.clientX, sy = e.clientY;
    let moved = false, last = null;
    const onMv = (ev) => {
      if (!stageRef.current) return;
      if (!moved && Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 4) moved = true;
      if (!moved) return;
      const g = stageRef.current.getBoundingClientRect();
      let left = ev.clientX - ox - g.left;
      let top = ev.clientY - oy - g.top;
      left = Math.max(0, Math.min(left, g.width - w));
      top = Math.max(0, Math.min(top, g.height - h));
      last = { x: (left / g.width) * 100, y: (top / g.height) * 100 };
      setDrag(last);
    };
    const onUp = () => {
      document.removeEventListener("pointermove", onMv);
      document.removeEventListener("pointerup", onUp);
      if (moved && last) onMove(comp.id, last);
      setDrag(null);
    };
    document.addEventListener("pointermove", onMv);
    document.addEventListener("pointerup", onUp);
  };

  const x = drag ? drag.x : (cfg.x != null ? cfg.x : 4);
  const y = drag ? drag.y : (cfg.y != null ? cfg.y : 4);

  const cellStyle = { left: x + "%", top: y + "%", transform: "none" };
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
      <div className="cell-scale" style={scaleStyle}>{children}</div>
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
  // Fondos en IndexedDB: las imágenes en base64 superan el tope de localStorage
  // (~5MB) y se perdían al recargar. IndexedDB las conserva.
  const [wallpaper, setWallpaper] = useIndexedState("bg_wallpaper", window.WALLPAPERS[0]);
  const [userWallpapers, setUserWallpapers] = useIndexedState("bg_user_wp", []);
  // ajuste del fondo: "contain" (foto completa, sin recortar ni zoom) | "cover" (llena, recorta)
  // por defecto Completo: se ve la imagen entera sin cortes
  const [bgFit, setBgFit] = useLocalStorage("bg_fit", "contain");

  const [theme, setTheme] = useLocalStorage("bg_theme", "glass");
  const [accent, setAccent] = useLocalStorage("bg_accent", "#ff5a2c");
  const [logo, setLogo] = useLocalStorage("bg_logo", null);
  const [blur, setBlur] = useLocalStorage("bg_blur", 0);
  const [dim, setDim] = useLocalStorage("bg_dim", 0);
  const [vis, setVis] = useLocalStorage("bg_vis_v2", {
    brand: true, greeting: true, clock: true, date: true, search: true, shortcuts: true, weather: true,
  });
  const [layout, setLayout] = useLocalStorage("bg_layout_free", DEFAULT_LAYOUT);

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
  // en "contain" mostramos la foto entera (sin el zoom 1.04 que recortaría bordes)
  const bgStyle = wallpaper.type === "image" && !isVideoWp
    ? { backgroundImage: `url("${wallpaper.value}")`, backgroundSize: bgFit,
        transform: bgFit === "contain" ? "scale(1)" : "scale(1.04)" }
    : (wallpaper.type === "gradient" ? { backgroundImage: wallpaper.value } : {});

  const blurPx = Math.round((blur / 100) * 40);

  const slots = {
    brand: <Brand logo={logo} />,
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
        ? <video className="bg bg-video" src={wallpaper.value} autoPlay loop muted playsInline key={wallpaper.value} style={{ objectFit: bgFit }} />
        : <>
            {/* relleno borroso para fotos que no llenan (modo Completo): sin barras negras */}
            {wallpaper.type === "image" && bgFit === "contain" &&
              <div className="bg bg-fill" style={{ backgroundImage: `url("${wallpaper.value}")` }} />}
            <div className="bg" style={bgStyle} />
          </>}
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

      {/* hint mientras editas (sin barra inferior; el engranaje sale del modo) */}

      {/* botón flotante único: Ajustes / Salir de edición */}
      <FloatButton pos={gearPos} setPos={setGearPos}
        title={customizing ? "Terminar edición" : "Ajustes"} spin={!customizing} active={customizing}
        onClick={() => { if (customizing) { setCustomizing(false); setPopover(null); } else { setSettingsOpen(true); } }}>
        {customizing ? <window.IcCheck /> : <window.IcGear />}
      </FloatButton>

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
          bgFit={bgFit} setBgFit={setBgFit}
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
