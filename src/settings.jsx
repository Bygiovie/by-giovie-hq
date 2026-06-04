/* settings.jsx — settings drawer: profile, appearance, background, blur, visibility */

const WALLPAPERS = [
  { id: "karina", type: "image", value: "assets/wallpaper-karina.jpg", thumb: "assets/wallpaper-karina.jpg" },
  // fondos fijos del repo (viajan a cualquier dispositivo) — carpeta fondos/
  { id: "ballet",       type: "image", value: "fondos/Firefly_Gemini Flash_- ._- _- --`--( ballet chica )--`--__score_9,score_8_up,score_7_up,cute face,,tongton 336863.png", thumb: "fondos/Firefly_Gemini Flash_- ._- _- --`--( ballet chica )--`--__score_9,score_8_up,score_7_up,cute face,,tongton 336863.png" },
  { id: "karina-arm1080", type: "image", value: "fondos/celebrity_karina_aespa_girl_group_armageddon-wallpaper-1920x1080.jpg", thumb: "fondos/celebrity_karina_aespa_girl_group_armageddon-wallpaper-1920x1080.jpg" },
  { id: "karina-arm-a", type: "image", value: "fondos/karina-aespa-armageddon-my-power-4k-wallpaper-uhdpaper.com-506@0@j.jpg", thumb: "fondos/karina-aespa-armageddon-my-power-4k-wallpaper-uhdpaper.com-506@0@j.jpg" },
  { id: "karina-arm-b", type: "image", value: "fondos/karina-aespa-armageddon-my-power-4k-wallpaper-uhdpaper.com-510@0@j.jpg", thumb: "fondos/karina-aespa-armageddon-my-power-4k-wallpaper-uhdpaper.com-510@0@j.jpg" },
  { id: "karina-bt-a",  type: "image", value: "fondos/karina-aespa-better-things-4k-wallpaper-uhdpaper.com-662@1@l.jpg", thumb: "fondos/karina-aespa-better-things-4k-wallpaper-uhdpaper.com-662@1@l.jpg" },
  { id: "karina-bt-b",  type: "image", value: "fondos/karina-aespa-better-things-4k-wallpaper-uhdpaper.com-663@1@l.jpg", thumb: "fondos/karina-aespa-better-things-4k-wallpaper-uhdpaper.com-663@1@l.jpg" },
  { id: "karina-dirty", type: "image", value: "fondos/karina-aespa-dirty-work-iphone-16-pro-4k-wallpaper-uhdpaper.com-350@5@g.jpg", thumb: "fondos/karina-aespa-dirty-work-iphone-16-pro-4k-wallpaper-uhdpaper.com-350@5@g.jpg" },
  { id: "karina-life-a", type: "image", value: "fondos/karina-aespa-live-my-life-4k-wallpaper-uhdpaper.com-389@0@j.jpg", thumb: "fondos/karina-aespa-live-my-life-4k-wallpaper-uhdpaper.com-389@0@j.jpg" },
  { id: "karina-life-b", type: "image", value: "fondos/karina-aespa-live-my-life-4k-wallpaper-uhdpaper.com-391@0@j.jpg", thumb: "fondos/karina-aespa-live-my-life-4k-wallpaper-uhdpaper.com-391@0@j.jpg" },
  { id: "ember",  type: "gradient",
    value: "radial-gradient(130% 120% at 18% 12%, #2c0f08 0%, #0a0a0c 58%), linear-gradient(135deg, rgba(255,90,44,0.18), transparent 60%)",
    thumb: "linear-gradient(140deg,#ff5a2c,#1a0a08)" },
  { id: "abyss",  type: "gradient",
    value: "radial-gradient(130% 120% at 82% 8%, #07242f 0%, #06070a 60%), linear-gradient(135deg, rgba(20,227,255,0.14), transparent 60%)",
    thumb: "linear-gradient(140deg,#14e3ff,#06141a)" },
  { id: "emerald", type: "gradient",
    value: "radial-gradient(130% 120% at 25% 18%, #04241a 0%, #06070a 60%), linear-gradient(135deg, rgba(24,201,138,0.16), transparent 60%)",
    thumb: "linear-gradient(140deg,#18c98a,#04140e)" },
  { id: "violet", type: "gradient",
    value: "radial-gradient(130% 120% at 28% 82%, #1d1033 0%, #07060a 60%), linear-gradient(135deg, rgba(179,136,255,0.16), transparent 60%)",
    thumb: "linear-gradient(140deg,#b388ff,#0a0716)" },
  { id: "carbon", type: "gradient",
    value: "linear-gradient(160deg, #16171c 0%, #0a0a0c 100%)",
    thumb: "linear-gradient(160deg,#2a2c33,#0a0a0c)" },
];

const ACCENT_PRESETS = [
  "#ff5a2c", "#ff2d6f", "#ffd23c", "#b6ff3c",
  "#18c98a", "#0fae5a", "#14e3ff", "#3c8aff",
  "#b388ff", "#f4f4f6",
];

function Toggle({ on, onClick }) {
  return <button className={"sw" + (on ? " on" : "")} onClick={onClick} role="switch" aria-checked={on}><i /></button>;
}
function Row({ label, sub, children }) {
  return (<div className="row"><div className="rl">{label}{sub && <small>{sub}</small>}</div>{children}</div>);
}
function CityInput({ city, setCity }) {
  const [val, setVal] = React.useState(city);
  React.useEffect(() => setVal(city), [city]);
  const commit = () => { const v = val.trim(); if (v && v !== city) setCity(v); };
  return (<input value={val} placeholder="Ciudad" onChange={(e) => setVal(e.target.value)} onBlur={commit}
    onKeyDown={(e) => { if (e.key === "Enter") { commit(); e.target.blur(); } }} />);
}

function SettingsDrawer(props) {
  const {
    onClose, name, setName, city, setCity, logo, setLogo,
    theme, setTheme, accent, setAccent,
    wallpaper, setWallpaper, userWallpapers, setUserWallpapers, bgFit, setBgFit,
    blur, setBlur, dim, setDim, shortcuts, setShortcuts, vis, setVis, onEditLayout,
  } = props;

  const [customWp, setCustomWp] = React.useState("");
  const [err, setErr] = React.useState("");
  const fileRef = React.useRef(null);
  const logoRef = React.useRef(null);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const toggleVis = (k) => setVis((v) => ({ ...v, [k]: !v[k] }));

  const onLogoFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setErr("");
    try {
      const dataURL = await window.resizeImageFile(f, 256, 0.9);
      setLogo(dataURL);
    } catch (e2) { setErr("No se pudo cargar el logo."); }
    e.target.value = "";
  };

  const onFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setErr("");
    try {
      const isAnim = /gif|webp/i.test(f.type) || f.type.startsWith("video/");
      if (isAnim) {
        // preservar animación: guardar el archivo tal cual (sin recomprimir)
        if (f.size > 8 * 1024 * 1024) {
          setErr("El archivo animado es muy grande para guardarlo aquí (máx ~8MB). Usa una URL.");
          e.target.value = ""; return;
        }
        const dataURL = await window.fileToDataURL(f);
        const type = f.type.startsWith("video/") ? "video" : "image";
        const w = { id: "u_" + Date.now().toString(36), type, value: dataURL, thumb: type === "video" ? null : dataURL, user: true, animated: true };
        setUserWallpapers((list) => [w, ...list]);
        setWallpaper(w);
      } else {
        // imagen estática: alta calidad, casi sin pérdida
        const dataURL = await window.resizeImageFile(f, 3840, 0.95);
        const w = { id: "u_" + Date.now().toString(36), type: "image", value: dataURL, thumb: dataURL, user: true };
        setUserWallpapers((list) => [w, ...list]);
        setWallpaper(w);
      }
    } catch (e2) { setErr("No se pudo cargar la imagen."); }
    e.target.value = "";
  };

  const applyCustomWp = () => {
    const u = customWp.trim();
    if (!u) return;
    const url = /^https?:\/\//i.test(u) ? u : "https://" + u;
    const isVid = /\.(mp4|webm|ogv|ogg|mov|m4v)(\?|#|$)/i.test(url);
    const w = { id: "url_" + Date.now().toString(36), type: isVid ? "video" : "image",
      value: url, thumb: isVid ? null : url, user: true, animated: isVid || /\.(gif|webp)(\?|#|$)/i.test(url) };
    setUserWallpapers((list) => [w, ...list]);
    setWallpaper(w);
    setCustomWp("");
  };

  const delUserWp = (id) => {
    setUserWallpapers((list) => list.filter((w) => w.id !== id));
    if (wallpaper.id === id) setWallpaper(WALLPAPERS[0]);
  };

  return (
    <div className="overlay" style={{ background: "rgba(4,5,9,0.4)" }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="drawer" onMouseDown={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h2>Ajustes</h2>
          <button className="icon-btn" onClick={onClose} title="Cerrar" style={{ width: 38, height: 38 }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>×</span>
          </button>
        </div>

        {/* perfil */}
        <div className="drawer-sec">
          <div className="sec-t">Diseño</div>
          <button className="upload-btn" style={{ marginTop: 0 }} onClick={onEditLayout}>
            <window.IcLayout /> Editar diseño — mover elementos
          </button>
          <p style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 8, lineHeight: 1.4 }}>
            Cierra los ajustes y te deja arrastrar cada elemento libremente.
          </p>
        </div>

        {/* perfil */}
        <div className="drawer-sec">
          <div className="sec-t">Perfil</div>
          <div className="field"><label>Nombre</label>
            <input value={name} placeholder="Tu nombre" onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Logo de la marca</label>
            <div className="logo-edit">
              <div className={"logo-prev" + (logo ? " has-img" : "")}>
                {logo ? <img src={logo} alt="logo" /> : "G"}
              </div>
              <button className="btn ghost" style={{ flex: 1 }} onClick={() => logoRef.current && logoRef.current.click()}>
                {logo ? "Cambiar logo" : "Subir logo"}
              </button>
              {logo && <button className="cp-reset" style={{ height: 40 }} onClick={() => setLogo(null)}>Quitar</button>}
            </div>
            <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onLogoFile} />
          </div>
          <div className="field"><label>Ubicación del clima</label>
            <CityInput city={city} setCity={setCity} />
          </div>
        </div>

        {/* apariencia */}
        <div className="drawer-sec">
          <div className="sec-t">Apariencia global</div>
          <Row label="Estilo por defecto"><span /></Row>
          <div className="seg" style={{ marginTop: -6, marginBottom: 16 }}>
            {[["glass", "Glass"], ["hud", "HUD"], ["brutal", "Brutal"]].map(([v, l]) => (
              <button key={v} className={theme === v ? "on" : ""} onClick={() => setTheme(v)}>{l}</button>
            ))}
          </div>
          <Row label="Color de acento"><span /></Row>
          <div style={{ marginTop: 4 }}>
            <window.ColorPicker value={accent} presets={ACCENT_PRESETS} onChange={setAccent} />
          </div>
        </div>

        {/* fondo */}
        <div className="drawer-sec">
          <div className="sec-t">Fondo</div>
          <div className="wp-grid">
            {/* fondos subidos primero (el más reciente arriba), luego los fijos */}
            {userWallpapers.map((w) => (
              <div key={w.id} className={"wp user" + (wallpaper.id === w.id ? " on" : "")}
                style={w.type === "video" ? { background: "#0a0a0c" } : { background: `url("${w.thumb}") center/cover` }}
                onClick={() => setWallpaper(w)} title={w.type === "video" ? "Tu fondo animado" : "Tu fondo"}>
                {w.type === "video" && <video className="wp-vid" src={w.value} muted playsInline preload="metadata" />}
                {w.animated && <span className="wp-badge">{w.type === "video" ? "▶" : "GIF"}</span>}
                <button className="wp-del" onClick={(e) => { e.stopPropagation(); delUserWp(w.id); }}>×</button>
              </div>
            ))}
            {WALLPAPERS.map((w) => (
              <button key={w.id} className={"wp" + (wallpaper.id === w.id ? " on" : "")}
                style={{ background: w.type === "image" ? `url("${w.thumb}") center/cover` : w.thumb }}
                onClick={() => setWallpaper(w)} title={w.id} />
            ))}
          </div>

          <button className="upload-btn" onClick={() => fileRef.current && fileRef.current.click()}>
            <window.IcUpload /> Subir desde el dispositivo
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm,video/ogg" style={{ display: "none" }} onChange={onFile} />

          <Row label="Ajuste del fondo" sub="Completo no recorta la imagen"><span /></Row>
          <div className="seg" style={{ marginTop: -6, marginBottom: 4 }}>
            {[["cover", "Llenar"], ["contain", "Completo"]].map(([v, l]) => (
              <button key={v} className={bgFit === v ? "on" : ""} onClick={() => setBgFit(v)}>{l}</button>
            ))}
          </div>

          <div className="field" style={{ marginTop: 12, marginBottom: 0, display: "flex", gap: 8 }}>
            <input value={customWp} placeholder="URL de imagen o vídeo (.jpg .gif .mp4 .webm)"
              onChange={(e) => setCustomWp(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") applyCustomWp(); }} />
            <button className="btn primary" style={{ flex: "0 0 auto", padding: "0 16px" }} onClick={applyCustomWp}>Usar</button>
          </div>
          {err && <p style={{ color: "#ff7a7a", fontSize: 12, marginTop: 8 }}>{err}</p>}
          <p style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 10, lineHeight: 1.4 }}>
            Admite imágenes (alta calidad), <strong>GIF</strong> y <strong>vídeo</strong> (.mp4/.webm) como fondo animado. Lo subido se guarda en este navegador; para vídeos grandes pega una URL (p. ej. un raw de GitHub).
          </p>
        </div>

        {/* difuminado */}
        <div className="drawer-sec">
          <div className="sec-t">Difuminado del fondo</div>
          <Row label="Detrás de los widgets" sub="Desenfoque del fondo bajo paneles">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-dim)" }}>{blur}</span>
          </Row>
          <input type="range" className="cp-slider" min="0" max="100" step="1" value={blur}
            onChange={(e) => setBlur(Number(e.target.value))} style={{ marginTop: 4 }} />
          <Row label="Oscurecer fondo" sub="Capa oscura para legibilidad (0 = sin filtro)">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-dim)" }}>{dim}</span>
          </Row>
          <input type="range" className="cp-slider" min="0" max="100" step="1" value={dim}
            onChange={(e) => setDim(Number(e.target.value))} style={{ marginTop: 4 }} />
        </div>

        {/* accesos directos */}
        <div className="drawer-sec">
          <div className="sec-t">Accesos directos</div>
          <window.ShortcutsManager shortcuts={shortcuts} setShortcuts={setShortcuts} />
        </div>

        {/* elementos */}
        <div className="drawer-sec">
          <div className="sec-t">Elementos visibles</div>
          <Row label="Marca"><Toggle on={vis.brand} onClick={() => toggleVis("brand")} /></Row>
          <Row label="Saludo"><Toggle on={vis.greeting} onClick={() => toggleVis("greeting")} /></Row>
          <Row label="Hora"><Toggle on={vis.clock} onClick={() => toggleVis("clock")} /></Row>
          <Row label="Fecha"><Toggle on={vis.date} onClick={() => toggleVis("date")} /></Row>
          <Row label="Buscador"><Toggle on={vis.search} onClick={() => toggleVis("search")} /></Row>
          <Row label="Accesos directos"><Toggle on={vis.shortcuts} onClick={() => toggleVis("shortcuts")} /></Row>
          <Row label="Clima"><Toggle on={vis.weather} onClick={() => toggleVis("weather")} /></Row>
        </div>

        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", color: "var(--ink-faint)", textTransform: "uppercase", textAlign: "center", marginTop: 24 }}>
          By Giovie · v3 · ajustes guardados localmente
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { SettingsDrawer, WALLPAPERS, ACCENT_PRESETS });
