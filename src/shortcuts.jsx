/* shortcuts.jsx — editable shortcuts dock + modal (exported to window) */

const DEFAULT_SHORTCUTS = [
  { id: "s_yt", label: "YouTube",   url: "https://www.youtube.com",  icon: "youtube" },
  { id: "s_gm", label: "Gmail",     url: "https://mail.google.com",  icon: "gmail" },
  { id: "s_wa", label: "WhatsApp",  url: "https://web.whatsapp.com", icon: "whatsapp" },
  { id: "s_ig", label: "Instagram", url: "https://www.instagram.com", icon: "instagram" },
  { id: "s_sp", label: "Spotify",   url: "https://open.spotify.com", icon: "spotify" },
  { id: "s_gh", label: "GitHub",    url: "https://github.com",       icon: "github" },
];

const ICON_OPTIONS = [
  { v: "auto", l: "Auto (detectar)" },
  { v: "mono", l: "Monograma" },
  { v: "youtube", l: "YouTube" },
  { v: "gmail", l: "Gmail" },
  { v: "whatsapp", l: "WhatsApp" },
  { v: "instagram", l: "Instagram" },
  { v: "spotify", l: "Spotify" },
  { v: "github", l: "GitHub" },
  { v: "link", l: "Enlace" },
];

function detectIcon(url) {
  const u = (url || "").toLowerCase();
  if (u.includes("youtube") || u.includes("youtu.be")) return "youtube";
  if (u.includes("mail.google") || u.includes("gmail")) return "gmail";
  if (u.includes("whatsapp")) return "whatsapp";
  if (u.includes("instagram")) return "instagram";
  if (u.includes("spotify")) return "spotify";
  if (u.includes("github")) return "github";
  return "mono";
}

function normalizeUrl(u) {
  u = (u || "").trim();
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : "https://" + u;
}

function ShortcutTile({ sc }) {
  const Brand = window.BRAND_ICONS[sc.icon];
  if (Brand) return <Brand />;
  return <span className="mono">{(sc.label || "?").trim().charAt(0).toUpperCase()}</span>;
}

/* Dock = display only. Management lives in Settings. */
function ShortcutsDock({ shortcuts }) {
  if (!shortcuts.length) {
    return (
      <div className="dock panel dock-empty">
        <span className="dock-hint">Añade accesos directos desde Ajustes ⚙</span>
      </div>
    );
  }
  return (
    <div className="dock panel">
      {shortcuts.map((sc) => (
        <a key={sc.id} className="shortcut" href={sc.url} rel="noopener">
          <span className="tile"><ShortcutTile sc={sc} /></span>
          <span className="lbl">{sc.label}</span>
        </a>
      ))}
    </div>
  );
}

/* Management UI used inside the Settings drawer */
function ShortcutsManager({ shortcuts, setShortcuts }) {
  const [modal, setModal] = React.useState(null);

  const openAdd = () => setModal({ mode: "add", sc: { label: "", url: "", icon: "auto" } });
  const openEdit = (sc) => setModal({ mode: "edit", sc: { ...sc } });
  const remove = (id) => setShortcuts((list) => list.filter((s) => s.id !== id));
  const moveBy = (id, dir) => setShortcuts((list) => {
    const i = list.findIndex((s) => s.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return list;
    const next = list.slice();
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });

  const save = (draft) => {
    const url = normalizeUrl(draft.url);
    if (!draft.label.trim() || !url) return;
    const icon = draft.icon === "auto" ? detectIcon(url) : draft.icon;
    if (modal.mode === "add") {
      setShortcuts((list) => [...list, { id: "s_" + Date.now().toString(36), label: draft.label.trim(), url, icon }]);
    } else {
      setShortcuts((list) => list.map((s) => s.id === draft.id ? { ...s, label: draft.label.trim(), url, icon } : s));
    }
    setModal(null);
  };

  return (
    <>
      <div className="sc-list">
        {shortcuts.map((sc, i) => (
          <div key={sc.id} className="sc-row">
            <span className="sc-ic"><ShortcutTile sc={sc} /></span>
            <span className="sc-name">{sc.label}</span>
            <button className="sc-mv" title="Subir" disabled={i === 0} onClick={() => moveBy(sc.id, -1)}>▲</button>
            <button className="sc-mv" title="Bajar" disabled={i === shortcuts.length - 1} onClick={() => moveBy(sc.id, 1)}>▼</button>
            <button className="sc-act" title="Editar" onClick={() => openEdit(sc)}><window.IcEdit /></button>
            <button className="sc-act del" title="Eliminar" onClick={() => remove(sc.id)}><window.IcTrash /></button>
          </div>
        ))}
      </div>
      <button className="upload-btn" style={{ marginTop: 10 }} onClick={openAdd}>
        <window.IcPlus /> Añadir acceso directo
      </button>

      {modal && <ShortcutModal modal={modal} onClose={() => setModal(null)} onSave={save} />}
    </>
  );
}

function ShortcutModal({ modal, onClose, onSave }) {
  const [draft, setDraft] = React.useState(modal.sc);
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return ReactDOM.createPortal(
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal panel modal-pos">
        <button className="close" onClick={onClose}>×</button>
        <h2>{modal.mode === "add" ? "Nuevo acceso directo" : "Editar acceso directo"}</h2>
        <p className="sub">{modal.mode === "add" ? "Añade tu propio enlace" : draft.label}</p>

        <div className="field">
          <label>Nombre</label>
          <input value={draft.label} placeholder="p. ej. Notion" autoFocus
            onChange={(e) => set("label", e.target.value)} />
        </div>
        <div className="field">
          <label>URL</label>
          <input value={draft.url} placeholder="notion.so"
            onChange={(e) => set("url", e.target.value)} />
        </div>
        <div className="field">
          <label>Icono</label>
          <select value={draft.icon} onChange={(e) => set("icon", e.target.value)}>
            {ICON_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>

        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={() => onSave(draft)}>
            {modal.mode === "add" ? "Añadir" : "Guardar"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

Object.assign(window, { ShortcutsDock, ShortcutsManager, DEFAULT_SHORTCUTS });
