/* ============================================================
   ØBM Admin — indholdsredigering
   ============================================================ */
const { useState, useEffect, useRef } = React;
function timeSort(t) { const h = parseInt(t || "0"); return h < 6 ? h + 24 : h; }

const SUPABASE_URL  = "https://zxbmaadxsjeyksbqdwyx.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1hYWR4c2pleWtzYnFkd3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDk3NDcsImV4cCI6MjA5NTI4NTc0N30.r6JdDygRKtHi0J46O9uicQ-oN8mxxBFbQt4LyEAdkIg";

const ADMIN_PASSWORD = "Ølstykke1202";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
const DAYS = ["Fredag", "Lørdag", "Søndag"];

/* ============================================================
   App root — simpelt kodeord
   ============================================================ */
function AdminApp() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("obm-admin") === "1");

  const login  = () => { sessionStorage.setItem("obm-admin", "1");  setAuthed(true);  };
  const logout = () => { sessionStorage.removeItem("obm-admin");     setAuthed(false); };

  if (!authed) return <LoginForm onLogin={login} />;
  return <Dashboard onLogout={logout} />;
}

/* ============================================================
   Login
   ============================================================ */
function LoginForm({ onLogin }) {
  const [pass, setPass] = useState("");
  const [err,  setErr]  = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (pass === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setErr("Forkert kodeord — prøv igen.");
      setPass("");
    }
  };

  return (
    <div className="a-login">
      <div className="a-login-box">
        <div className="a-logo" style={{ display:"grid", placeItems:"center", fontWeight:900, margin:"0 auto 20px" }}>ØBM</div>
        <h1>Admin</h1>
        <form onSubmit={submit}>
          <div className="a-field">
            <label>Kodeord</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} required autoFocus placeholder="••••••••••" />
          </div>
          {err && <div className="a-err">{err}</div>}
          <button type="submit" className="a-btn-primary">Log ind</button>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   Dashboard med tabs
   ============================================================ */
function Dashboard({ onLogout }) {
  const [tab, setTab] = useState("program");

  return (
    <div className="a-app">
      <header className="a-header">
        <div className="a-header-inner">
          <div className="a-brand">
            <div className="a-logo-sm">ØBM</div>
            <span>Admin · Ølstykke By &amp; Motorfestival</span>
          </div>
          <button className="a-btn-ghost" onClick={onLogout}>Log ud</button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <div className="a-tabs">
          {[["program","Program"],["lineup","Biler/Lastbiler"],["afstemning","Afstemning"],["hvad","Hvad sker der"],["billeder","Billeder"],["indstillinger","Indstillinger"]].map(([k, l]) => (
            <button key={k} className={"a-tab" + (tab === k ? " active" : "")} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="a-content">
        {tab === "program"       && <ProgramEditor />}
        {tab === "lineup"        && <LineupEditor />}
        {tab === "afstemning"    && <VotingEditor />}
        {tab === "hvad"          && <WhatEditor />}
        {tab === "billeder"      && <ImagesEditor />}
        {tab === "indstillinger" && <SettingsEditor />}
      </div>
    </div>
  );
}

/* ============================================================
   Program-editor
   ============================================================ */
function ProgramEditor() {
  const [day,     setDay]     = useState("Lørdag");
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await sb.from("program_items").select("*").eq("day", day);
    setRows((data || []).sort((a, b) => timeSort(a.time_str) - timeSort(b.time_str)));
    setLoading(false);
  };

  useEffect(() => { load(); }, [day]);

  const del = async (id) => {
    if (!confirm("Slet denne række?")) return;
    await sb.from("program_items").delete().eq("id", id);
    setRows(r => r.filter(x => x.id !== id));
  };

  const save = async (form) => {
    if (form.id) {
      const { data } = await sb.from("program_items").update(form).eq("id", form.id).select().single();
      setRows(r => r.map(x => x.id === form.id ? data : x));
    } else {
      const { data } = await sb.from("program_items").insert({ ...form, day, sort_order: 0 }).select().single();
      setRows(r => [...r, data].sort((a, b) => timeSort(a.time_str) - timeSort(b.time_str)));
    }
    setEditing(null);
  };

  return (
    <div>
      <div className="a-section-head">
        <h2>Program</h2>
        <div className="a-day-tabs">
          {DAYS.map(d => (
            <button key={d} className={"a-day-tab" + (day === d ? " active" : "")} onClick={() => setDay(d)}>{d}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="a-loading">Indlæser...</div> : (
        <table className="a-table">
          <thead>
            <tr><th>Tid</th><th>Titel</th><th>Undertekst</th><th>Tag</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td className="a-mono">{r.time_str}</td>
                <td><strong>{r.title}</strong></td>
                <td className="a-muted">{r.sub}</td>
                <td>{r.tag && <span className="a-tag">{r.tag}</span>}</td>
                <td>
                  <div className="a-actions">
                    <button onClick={() => setEditing(r)}>Rediger</button>
                    <button className="a-del" onClick={() => del(r.id)}>Slet</button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign:"center", color:"#aaa", padding: 32 }}>Ingen punkter endnu.</td></tr>
            )}
          </tbody>
        </table>
      )}

      <button className="a-btn-add" onClick={() => setEditing({ time_str:"", title:"", sub:"", tag:"" })}>
        + Tilføj punkt
      </button>

      {editing !== null && <RowModal row={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

function RowModal({ row, onSave, onClose }) {
  const [form, setForm] = useState({ time_str: row.time_str || "", title: row.title || "", sub: row.sub || "", tag: row.tag || "", id: row.id });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="a-overlay" onClick={onClose}>
      <div className="a-modal" onClick={e => e.stopPropagation()}>
        <h3>{form.id ? "Rediger punkt" : "Nyt punkt"}</h3>
        <div className="a-field"><label>Tidspunkt</label><input value={form.time_str} onChange={set("time_str")} placeholder="18:30" /></div>
        <div className="a-field"><label>Titel</label><input value={form.title} onChange={set("title")} placeholder="Live på scenen" /></div>
        <div className="a-field"><label>Undertekst</label><input value={form.sub} onChange={set("sub")} placeholder="Kort beskrivelse..." /></div>
        <div className="a-field"><label>Tag (valgfri)</label><input value={form.tag} onChange={set("tag")} placeholder="HOT · LIVE · ÅBEN" /></div>
        <div className="a-modal-actions">
          <button className="a-btn-ghost" onClick={onClose}>Annuller</button>
          <button className="a-btn-primary" onClick={() => onSave(form)}>Gem</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Lineup-editor
   ============================================================ */
function LineupEditor() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    sb.from("lineup_items").select("*").order("sort_order").then(({ data }) => {
      setItems(data || []);
      setLoading(false);
    });
  }, []);

  const del = async (id) => {
    if (!confirm("Slet dette lineup-element?")) return;
    await sb.from("lineup_items").delete().eq("id", id);
    setItems(i => i.filter(x => x.id !== id));
  };

  const save = async (form, imageFile) => {
    let imageUrl = form.image_url || null;

    if (imageFile) {
      const path = `lineup/${form.id || Date.now()}-${imageFile.name}`;
      const { data: upData, error: upErr } = await sb.storage.from("festival-images").upload(path, imageFile, { upsert: true });
      if (!upErr) {
        const { data: { publicUrl } } = sb.storage.from("festival-images").getPublicUrl(upData.path);
        imageUrl = publicUrl;
      } else {
        alert("Billede-upload fejlede: " + upErr.message);
      }
    }

    const payload = { ...form, image_url: imageUrl };
    delete payload.id;

    if (form.id) {
      const { data } = await sb.from("lineup_items").update(payload).eq("id", form.id).select().single();
      setItems(i => i.map(x => x.id === form.id ? data : x));
    } else {
      const { data } = await sb.from("lineup_items").insert({ ...payload, sort_order: items.length + 1 }).select().single();
      setItems(i => [...i, data]);
    }
    setEditing(null);
  };

  return (
    <div>
      <div className="a-section-head">
        <h2>Lineup</h2>
        <button className="a-btn-primary"
          onClick={() => setEditing({ name:"", meta:"", tag:"", blurb:"", img_label:"", icon:"", image_url:null })}>
          + Tilføj
        </button>
      </div>

      {loading ? <div className="a-loading">Indlæser...</div> : (
        <div className="a-card-grid">
          {items.map(item => (
            <div key={item.id} className="a-card">
              {item.image_url
                ? <img src={item.image_url} className="a-card-img" alt={item.name} />
                : <div className="a-card-img-ph">{item.icon || "?"}</div>
              }
              <div className="a-card-body">
                <div className="a-card-tag">{item.tag}</div>
                <div className="a-card-name">{item.name}</div>
                <div className="a-card-meta">{item.meta}</div>
              </div>
              <div className="a-card-actions">
                <button onClick={() => setEditing({ ...item })}>Rediger</button>
                <button className="a-del" onClick={() => del(item.id)}>Slet</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <LineupModal item={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

function LineupModal({ item, onSave, onClose }) {
  const [form,      setForm]      = useState({ ...item });
  const [imageFile, setImageFile] = useState(null);
  const [preview,   setPreview]   = useState(item.image_url || null);
  const [saving,    setSaving]    = useState(false);
  const fileRef = useRef();
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const onFileChange = e => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(form, imageFile);
    setSaving(false);
  };

  return (
    <div className="a-overlay" onClick={onClose}>
      <div className="a-modal a-modal-wide" onClick={e => e.stopPropagation()}>
        <h3>{form.id ? "Rediger lineup" : "Nyt lineup-element"}</h3>
        <div className="a-modal-cols">
          <div>
            <div className="a-field"><label>Navn</label><input value={form.name} onChange={set("name")} /></div>
            <div className="a-field"><label>Meta (by · type)</label><input value={form.meta} onChange={set("meta")} placeholder="Sjælland · Heavy Showtruck" /></div>
            <div className="a-field"><label>Tag</label><input value={form.tag} onChange={set("tag")} placeholder="Headliner · Showtruck · Flåde" /></div>
            <div className="a-field"><label>Ikon (2-4 bogstaver)</label><input value={form.icon} onChange={set("icon")} placeholder="HCG" maxLength={4} /></div>
          </div>
          <div>
            <div className="a-field">
              <label>Billede til lineup-kortet (forsiden, sektion 02)</label>
              <div className="a-img-upload" onClick={() => fileRef.current.click()}>
                {preview
                  ? <img src={preview} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="preview" />
                  : <span>Klik for at uploade billede</span>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={onFileChange} />
              {preview && (
                <button style={{ marginTop:8, fontSize:12, color:"#e63946", background:"none", border:"none", cursor:"pointer", padding:0 }}
                  onClick={() => { setPreview(null); setImageFile(null); setForm(f => ({ ...f, image_url: null })); }}>
                  Fjern billede
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="a-field">
          <label>Beskrivelse</label>
          <textarea value={form.blurb} onChange={set("blurb")} rows={3} placeholder="Kort beskrivelse der vises på hjemmesiden..." />
        </div>
        <div className="a-modal-actions">
          <button className="a-btn-ghost" onClick={onClose}>Annuller</button>
          <button className="a-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Gemmer..." : "Gem"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Billede-editor (hero + sektioner)
   ============================================================ */
function ImagesEditor() {
  const [images,  setImages]  = useState({});
  const [uploading, setUploading] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const fileRef = useRef();

  const sections = [
    {
      key:   "hero",
      label: "Forsidebillede — bag titlen oppe",
      desc:  "Vises som baggrundsbillede bag 'Ølstykke By & Motorfestival' helt oppe pa forsiden. Brug et bredformat foto af trucks, show eller pladsen. Anbefalet storrelse: mindst 1600x900px.",
    },
    {
      key:   "banner",
      label: "Delingsbillede — Facebook og Instagram",
      desc:  "Vises nar festivalen deles pa sociale medier (Facebook, Instagram, Messenger). Brug et horisontalt foto med det bedste motiv fra festivalen. Anbefalet storrelse: 1200x630px.",
    },
  ];

  useEffect(() => {
    sb.from("site_images").select("*").then(({ data }) => {
      const map = {};
      (data || []).forEach(r => { map[r.section] = r.url; });
      setImages(map);
    });
  }, []);

  const remove = async (section) => {
    if (!confirm("Fjern billede?")) return;
    await sb.from("site_images").delete().eq("section", section);
    setImages(i => { const n = { ...i }; delete n[section]; return n; });
  };

  const upload = async (section, file) => {
    setUploading(section);
    const path = `site/${section}-${Date.now()}-${file.name}`;
    const { data: upData, error } = await sb.storage.from("festival-images").upload(path, file, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = sb.storage.from("festival-images").getPublicUrl(upData.path);
      const { error: dbErr } = await sb.from("site_images").upsert(
        { section, url: publicUrl, updated_at: new Date().toISOString() },
        { onConflict: "section" }
      );
      if (dbErr) { alert("Gem fejlede: " + dbErr.message); setUploading(null); return; }
      setImages(i => ({ ...i, [section]: publicUrl }));
    } else {
      alert("Upload fejlede: " + error.message);
    }
    setUploading(null);
  };

  return (
    <div>
      <div className="a-section-head">
        <h2>Billeder</h2>
      </div>
      <p style={{ color:"#888", fontSize:14, marginBottom:24, marginTop:-8 }}>
        Upload billeder der vises på hjemmesiden. Supabase Storage skal have en bucket der hedder <strong>festival-images</strong> (se OPSÆTNING.md).
      </p>
      {sections.map(s => (
        <div key={s.key} className="a-image-row">
          <div className="a-image-info">
            <strong>{s.label}</strong>
            <p>{s.desc}</p>
            {images[s.key] && (
              <a href={images[s.key]} target="_blank" style={{ fontSize:12, color:"#e63946", marginTop:8, display:"block" }}>Se nuværende billede →</a>
            )}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" }}>
            <div className="a-img-upload-lg" onClick={() => { setActiveSection(s.key); fileRef.current.click(); }}>
              {images[s.key]
                ? <img src={images[s.key]} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt={s.label} />
                : <span>{uploading === s.key ? "Uploader..." : "Klik for at uploade"}</span>
              }
            </div>
            {images[s.key] && (
              <button className="a-btn a-btn-del" style={{ padding:"4px 12px", fontSize:12 }} onClick={() => remove(s.key)}>
                Fjern billede
              </button>
            )}
          </div>
        </div>
      ))}
      <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }}
        onChange={e => { if (e.target.files[0] && activeSection) upload(activeSection, e.target.files[0]); e.target.value = ""; }} />
    </div>
  );
}

/* ============================================================
   Afstemnings-editor (Danmarks fedeste bil)
   ============================================================ */
function VotingEditor() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    sb.from("vote_options").select("*").order("sort_order").then(({ data }) => {
      setItems(data || []);
      setLoading(false);
    });
  }, []);

  const del = async (id) => {
    if (!confirm("Slet denne kandidat?")) return;
    await sb.from("vote_options").delete().eq("id", id);
    setItems(i => i.filter(x => x.id !== id));
  };

  const save = async (form, imageFile) => {
    let imageUrl = form.image_url || null;

    if (imageFile) {
      const path = "afstemning/" + (form.id || Date.now()) + "-" + imageFile.name;
      const { data: upData, error: upErr } = await sb.storage.from("festival-images").upload(path, imageFile, { upsert: true });
      if (!upErr) {
        const { data: { publicUrl } } = sb.storage.from("festival-images").getPublicUrl(upData.path);
        imageUrl = publicUrl;
      } else {
        alert("Billede-upload fejlede: " + upErr.message);
      }
    }

    const payload = { name: form.name, owner: form.owner, image_url: imageUrl };

    if (form.id) {
      const { data } = await sb.from("vote_options").update(payload).eq("id", form.id).select().single();
      setItems(i => i.map(x => x.id === form.id ? data : x));
    } else {
      const { data } = await sb.from("vote_options").insert({ ...payload, sort_order: items.length + 1 }).select().single();
      setItems(i => [...i, data]);
    }
    setEditing(null);
  };

  return (
    <div>
      <div className="a-section-head">
        <h2>Afstemning — Danmarks fedeste bil</h2>
        <button className="a-btn-primary" onClick={() => setEditing({ name: "", owner: "", image_url: null })}>+ Tilføj kandidat</button>
      </div>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 24, marginTop: -8 }}>
        Kandidaterne vises i afstemningssektionen pa forsiden (sektion 04). Upload et foto af koretoejet til hvert kort — gerne set forfra eller fra siden.
      </p>

      {loading ? <div className="a-loading">Indlaesser...</div> : (
        <div className="a-card-grid">
          {items.map(item => (
            <div key={item.id} className="a-card">
              {item.image_url
                ? <img src={item.image_url} className="a-card-img" alt={item.name} />
                : <div className="a-card-img-ph" style={{ fontSize: 13, color: "#bbb", fontWeight: 400, letterSpacing: "0.04em" }}>Intet foto endnu</div>
              }
              <div className="a-card-body">
                <div className="a-card-tag">Kandidat</div>
                <div className="a-card-name">{item.name}</div>
                <div className="a-card-meta">{item.owner}</div>
              </div>
              <div className="a-card-actions">
                <button onClick={() => setEditing({ ...item })}>Rediger</button>
                <button className="a-del" onClick={() => del(item.id)}>Slet</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <VoteModal item={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

function VoteModal({ item, onSave, onClose }) {
  const [form,      setForm]      = useState({ ...item });
  const [imageFile, setImageFile] = useState(null);
  const [preview,   setPreview]   = useState(item.image_url || null);
  const [saving,    setSaving]    = useState(false);
  const fileRef = useRef();
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const onFileChange = e => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  };

  return (
    <div className="a-overlay" onClick={onClose}>
      <div className="a-modal a-modal-wide" onClick={e => e.stopPropagation()}>
        <h3>{form.id ? "Rediger kandidat" : "Ny kandidat"}</h3>
        <div className="a-modal-cols">
          <div>
            <div className="a-field">
              <label>Koretojets navn</label>
              <input value={form.name} onChange={set("name")} placeholder="Cadillac De Ville Lowrider 70" />
            </div>
            <div className="a-field">
              <label>Ejer / deltager</label>
              <input value={form.owner} onChange={set("owner")} placeholder="Hildes Custom Garage" />
            </div>
          </div>
          <div>
            <div className="a-field">
              <label>Foto af koretoejet (afstemningskort, forsiden sektion 04)</label>
              <div className="a-img-upload" onClick={() => fileRef.current.click()}>
                {preview
                  ? <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="preview" />
                  : <span>Klik for at uploade foto</span>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFileChange} />
              {preview && (
                <button style={{ marginTop: 8, fontSize: 12, color: "#e63946", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  onClick={() => { setPreview(null); setImageFile(null); setForm(f => ({ ...f, image_url: null })); }}>
                  Fjern billede
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="a-modal-actions">
          <button className="a-btn-ghost" onClick={onClose}>Annuller</button>
          <button className="a-btn-primary" disabled={saving} onClick={async () => { setSaving(true); await onSave(form, imageFile); setSaving(false); }}>
            {saving ? "Gemmer..." : "Gem"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Hvad-sker-der-editor
   ============================================================ */
function WhatEditor() {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await sb.from("what_items").select("*").order("sort_order");
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!confirm("Slet dette element?")) return;
    await sb.from("what_items").delete().eq("id", id);
    setRows(r => r.filter(x => x.id !== id));
  };

  const save = async (form) => {
    const payload = { num: form.num, title: form.title, sub: form.sub };
    if (form.id) {
      const { data } = await sb.from("what_items").update(payload).eq("id", form.id).select().single();
      setRows(r => r.map(x => x.id === form.id ? data : x));
    } else {
      const { data } = await sb.from("what_items").insert({ ...payload, sort_order: rows.length + 1 }).select().single();
      setRows(r => [...r, data]);
    }
    setEditing(null);
  };

  return (
    <div>
      <div className="a-section-head">
        <h2>Hvad sker der</h2>
        <button className="a-btn-primary" onClick={() => setEditing({ num: "", title: "", sub: "" })}>+ Tilføj</button>
      </div>
      {loading ? <div className="a-loading">Indlæser...</div> : (
        <table className="a-table">
          <thead><tr><th>#</th><th>Titel</th><th>Beskrivelse</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td className="a-mono">{r.num}</td>
                <td><strong>{r.title}</strong></td>
                <td className="a-muted">{r.sub}</td>
                <td>
                  <div className="a-actions">
                    <button onClick={() => setEditing({ ...r })}>Rediger</button>
                    <button className="a-del" onClick={() => del(r.id)}>Slet</button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign:"center", color:"#aaa", padding:32 }}>Ingen elementer endnu.</td></tr>
            )}
          </tbody>
        </table>
      )}
      {editing !== null && (
        <div className="a-overlay" onClick={() => setEditing(null)}>
          <div className="a-modal" onClick={e => e.stopPropagation()}>
            <h3>{editing.id ? "Rediger element" : "Nyt element"}</h3>
            <div className="a-field"><label>Nummer (fx 01)</label><input value={editing.num} onChange={e => setEditing(v => ({ ...v, num: e.target.value }))} placeholder="01" maxLength={3} /></div>
            <div className="a-field"><label>Titel</label><input value={editing.title} onChange={e => setEditing(v => ({ ...v, title: e.target.value }))} placeholder="Heavy Showtrucks" /></div>
            <div className="a-field"><label>Beskrivelse</label><textarea value={editing.sub} onChange={e => setEditing(v => ({ ...v, sub: e.target.value }))} rows={3} placeholder="Kort beskrivelse..." /></div>
            <div className="a-modal-actions">
              <button className="a-btn-ghost" onClick={() => setEditing(null)}>Annuller</button>
              <button className="a-btn-primary" onClick={() => save(editing)}>Gem</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Indstillinger-editor
   ============================================================ */
function SettingsEditor() {
  const [settings, setSettings] = useState({});
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  const FIELDS = [
    { key: "facebook_url", label: "Facebook-link",   placeholder: "https://facebook.com/olstykke-festival" },
    { key: "address1",     label: "Adresse linje 1", placeholder: "Stadionvej" },
    { key: "address2",     label: "Adresse linje 2", placeholder: "3650 Ølstykke" },
    { key: "ticket_price", label: "Billetpris (kr)", placeholder: "30" },
  ];

  useEffect(() => {
    sb.from("site_settings").select("*").then(({ data }) => {
      const map = {};
      (data || []).forEach(r => { map[r.key] = r.value; });
      setSettings(map);
    });
  }, []);

  const saveAll = async () => {
    setSaving(true);
    const upserts = FIELDS.map(f => ({ key: f.key, value: settings[f.key] || "", label: f.label, updated_at: new Date().toISOString() }));
    await sb.from("site_settings").upsert(upserts);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="a-section-head">
        <h2>Indstillinger</h2>
      </div>
      <p style={{ color:"#888", fontSize:14, marginBottom:24, marginTop:-8 }}>
        Kontaktoplysninger og basisinfo der vises på hjemmesiden.
      </p>
      {FIELDS.map(f => (
        <div key={f.key} className="a-field">
          <label>{f.label}</label>
          <input
            value={settings[f.key] || ""}
            onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
            placeholder={f.placeholder}
          />
        </div>
      ))}
      <button className="a-btn-primary" onClick={saveAll} disabled={saving} style={{ marginTop: 8 }}>
        {saving ? "Gemmer..." : saved ? "Gemt!" : "Gem indstillinger"}
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("admin-root")).render(<AdminApp />);
