/* ============================================================
   ØLSTYKKE BY & MOTORFESTIVAL — App
   ============================================================ */
const { useState, useEffect, useMemo } = React;
const D = window.OBM_DATA;
const Billet = window.Billet;

// Supabase REST — henter live data til program og lineup
const SUPABASE_URL  = "https://zxbmaadxsjeyksbqdwyx.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1hYWR4c2pleWtzYnFkd3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDk3NDcsImV4cCI6MjA5NTI4NTc0N30.r6JdDygRKtHi0J46O9uicQ-oN8mxxBFbQt4LyEAdkIg";

function timeSort(t) { const h = parseInt(t || "0"); return h < 6 ? h + 24 : h; }

async function sbPost(table, body) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(body),
    });
  } catch {}
}

async function sbFetch(table, params = "") {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#e63946", "#d4a942"],
  "displayFont": "Anton",
  "hazardOn": true,
  "heroStyle": "split",
  "showCountdown": true,
  "showSticker": true
}/*EDITMODE-END*/;

const FONT_STACKS = {
  "Anton": "'Anton', Impact, sans-serif",
  "Bebas Neue": "'Bebas Neue', Impact, sans-serif",
  "Archivo Black": "'Archivo Black', Impact, sans-serif",
  "Big Shoulders": "'Big Shoulders Display', Impact, sans-serif"
};

/* dynamically load any Google font the user picks */
function useFontLoader(name) {
  useEffect(() => {
    if (name === "Anton") return; // already loaded
    const id = "font-" + name.replace(/\s+/g, "-");
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=" + encodeURIComponent(name) + ":wght@400;700&display=swap";
    document.head.appendChild(link);
  }, [name]);
}

/* apply tweaks → CSS vars */
function applyTweaks(t) {
  const r = document.documentElement;
  r.style.setProperty("--accent", t.palette[0]);
  r.style.setProperty("--accent-2", t.palette[1]);
  r.style.setProperty("--red", t.palette[0]);
  r.style.setProperty("--gold", t.palette[1]);
  r.style.setProperty("--ff-display", FONT_STACKS[t.displayFont] || FONT_STACKS.Anton);
  document.querySelectorAll(".hazard").forEach(el => {
    el.style.display = t.hazardOn ? "" : "none";
  });
}

/* ---------- Topbar ---------- */
function Topbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#billet", label: "Billetter" },
    { href: "#program", label: "Program" },
    { href: "#lineup", label: "Lineup" },
    { href: "#afstemning", label: "Afstemning" },
    { href: "#info", label: "Praktisk" },
  ];
  const close = () => setOpen(false);
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a href="#top" className="brand" onClick={close}>
          <div className="brand-mark"><span>Ø</span></div>
          <div className="brand-text">
            <span className="a">Ølstykke By &amp; Motorfestival</span>
            <span className="b">ØBM · 07 — 09 AUG 2026</span>
          </div>
        </a>
        <nav className="nav">
          {links.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
          <a className="nav-cta" href="https://tikkio.com/events/64286" target="_blank" rel="noopener">Køb billet — 30 kr <span>→</span></a>
        </nav>
        <button
          className={"hamburger" + (open ? " open" : "")}
          onClick={() => setOpen(o => !o)}
          aria-label={open ? "Luk menu" : "Åbn menu"}
        >
          <span /><span /><span />
        </button>
      </div>
      {open && (
        <nav className="mobile-nav">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={close}>{l.label}</a>
          ))}
          <a className="mobile-cta" href="https://tikkio.com/events/64286" target="_blank" rel="noopener" onClick={close}>
            Køb billet — 30 kr →
          </a>
        </nav>
      )}
    </header>
  );
}

/* ---------- Image placeholder (striped + label) ---------- */
function ImgPH({ label, icon }) {
  return (
    <div className="image-placeholder" data-label={label}>
      {icon && <div className="ip-icon">{icon}</div>}
    </div>
  );
}

/* ---------- Countdown ---------- */
function useCountdown(target) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const t = Math.max(0, target - now);
  const d = Math.floor(t / 86400000);
  const h = Math.floor((t / 3600000) % 24);
  const m = Math.floor((t / 60000) % 60);
  const s = Math.floor((t / 1000) % 60);
  return { d, h, m, s };
}

/* ---------- Hero ---------- */
function Hero({ showCountdown = true }) {
  const c = useCountdown(new Date(2026, 7, 7, 16, 0, 0).getTime());
  const [heroImg, setHeroImg] = useState(null);

  useEffect(() => {
    sbFetch("site_images", "select=url&section=eq.hero&limit=1")
      .then(d => { if (d?.[0]?.url) setHeroImg(d[0].url); })
      .catch(() => {});
  }, []);

  const heroStyle = heroImg ? {
    backgroundImage: `linear-gradient(rgba(11,10,9,0.55), rgba(11,10,9,0.55)), url(${heroImg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  } : {};

  return (
    <section className="hero" id="top" style={heroStyle}>
      <div className="hero-grid">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <span className="dot"></span>
            <span className="label">[ ØBM · 4. udgave · Stadionvej, Ølstykke ]</span>
          </div>
          <h1 className="hero-title">
            <span className="row">Ølstykke</span>
            <span className="row outline">By &amp;</span>
            <span className="row"><span className="accent">Motor</span>festival</span>
          </h1>
          <p className="hero-tag">
            Det bliver <span className="strike">for stort</span> for vildt.
          </p>
          <div className="hero-meta">
            <div>
              <div>Datoer</div>
              <strong>07 — 09 AUG 2026</strong>
            </div>
            <div>
              <div>Sted</div>
              <strong>Stadionvej, 3650 Ølstykke</strong>
            </div>
            <div>
              <div>Varighed</div>
              <strong>Fre · Lør · Søn</strong>
            </div>
            <div>
              <div>Entré</div>
              <strong>30 kr · alle 3 dage</strong>
            </div>
          </div>
          <div className="hero-cta-row">
            <a href="https://tikkio.com/events/64286" target="_blank" rel="noopener" className="btn btn-primary btn-xl">
              Køb billet — 30 kr <span className="arrow">→</span>
            </a>
            <a href="#program" className="btn btn-ghost">
              Se programmet <span className="arrow">→</span>
            </a>
          </div>
          {showCountdown && (
            <div className="counter" style={{ marginTop: 20 }}>
              <span className="counter-label">[ Nedtælling til portene åbner ]</span>
              <div className="counter-vals">
                <div className="cell"><span className="num">{String(c.d).padStart(2, "0")}</span><span className="unit">dage</span></div>
                <div className="cell"><span className="num">{String(c.h).padStart(2, "0")}</span><span className="unit">timer</span></div>
                <div className="cell"><span className="num">{String(c.m).padStart(2, "0")}</span><span className="unit">min</span></div>
                <div className="cell"><span className="num">{String(c.s).padStart(2, "0")}</span><span className="unit">sek</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- Marquee ---------- */
function Marquee() {
  const items = [
    "Heavy Showtrucks", "Lowriders", "Custom Cars", "Lastbiler",
    "Motorcykler", "Veteran &amp; Special", "Kræmmer­marked", "Tivoli",
    "Live Musik", "Mad &amp; Øl", "Diesel i blodet", "Det bliver for vildt",
  ];
  const list = [...items, ...items];
  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {list.map((t, i) => (
          <span key={i} className="marquee-item">
            <span className="star"></span>
            <span dangerouslySetInnerHTML={{ __html: t }} className={i % 3 === 1 ? "gold" : (i % 3 === 2 ? "outline" : "")} />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Reach stats strip ---------- */
function ReachStrip() {
  const stats = [
    { num: "150+", label: "tilmeldte biler" },
    { num: "316K", label: "visninger på SoMe" },
    { num: "16.7K", label: "interaktioner" },
    { num: "616", label: "følgere & vokser" },
    { num: "3", label: "dage festival" },
  ];
  return (
    <div className="section section-tight" style={{ paddingTop: 56, paddingBottom: 56 }}>
      <div className="container">
        <div className="reach-grid">
          {stats.map((s, i) => (
            <div key={i} className="reach-cell">
              <div className="label label-bracket" style={{ marginBottom: 10 }}>{s.label}</div>
              <div className="big-num">{s.num}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- What's happening ---------- */
function WhatGrid() {
  const [items, setItems] = useState(D.whatGrid);

  useEffect(() => {
    sbFetch("what_items", "select=*&order=sort_order").then(data => {
      if (data && data.length > 0) setItems(data);
    });
  }, []);

  return (
    <section className="section" id="hvad">
      <div className="container">
        <div className="section-head">
          <div className="lhs">
            <span className="label label-bracket">01 / Hvad sker der</span>
            <h2>Tre dage<br />med <span className="accent">diesel</span> i blodet</h2>
          </div>
          <span className="num">[ {String(items.length).padStart(2,"0")} spor · ét sted ]</span>
        </div>
        <div className="what-grid">
          {items.map(c => (
            <div key={c.id || c.num} className="what-cell">
              <div className="accent-dot"></div>
              <div>
                <div className="what-num">{c.num} / spor</div>
                <h3 className="what-title">{c.title}</h3>
              </div>
              <p className="what-sub">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Lineup ---------- */
function Lineup() {
  const [items, setItems] = useState(D.lineup);

  useEffect(() => {
    sbFetch("lineup_items", "select=*&order=sort_order").then(data => {
      if (data && data.length > 0) {
        setItems(data.map(l => ({
          name:     l.name,
          meta:     l.meta,
          tag:      l.tag,
          blurb:    l.blurb,
          imgLabel: l.img_label,
          icon:     l.icon,
          imageUrl: l.image_url,
        })));
      }
    });
  }, []);

  return (
    <section className="section" id="lineup">
      <div className="container">
        <div className="section-head">
          <div className="lhs">
            <span className="label label-bracket">02 / Bekræftet lineup</span>
            <h2>Folk<br />der <span className="accent">møder op</span></h2>
          </div>
          <span className="num">[ {items.length} navne · flere på vej ]</span>
        </div>
        <div className="lineup">
          {items.map(l => (
            <div key={l.name} className="line-card">
              <div className="line-tag">{l.tag}</div>
              <div className="line-img">
                {l.imageUrl
                  ? <img src={l.imageUrl} alt={l.name} />
                  : <ImgPH label={l.imgLabel} icon={l.icon} />
                }
              </div>
              <div className="line-body">
                <div className="meta">{l.meta}</div>
                <div className="name">{l.name}</div>
                <p className="blurb">{l.blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Program (3-day) ---------- */
function Program() {
  const days = Object.keys(D.program);
  const [active, setActive] = useState("Lørdag");
  const [liveProgram, setLiveProgram] = useState(null);

  useEffect(() => {
    sbFetch("program_items", "select=*").then(data => {
      if (!data || data.length === 0) return;
      const grouped = {};
      data.forEach(r => {
        if (!grouped[r.day]) grouped[r.day] = { day: r.day.toUpperCase(), date: D.program[r.day]?.date || "", rows: [] };
        grouped[r.day].rows.push({ time: r.time_str, title: r.title, sub: r.sub, tag: r.tag });
      });
      Object.values(grouped).forEach(g => g.rows.sort((a, b) => timeSort(a.time) - timeSort(b.time)));
      setLiveProgram(grouped);
    });
  }, []);

  const program = liveProgram || D.program;
  const data = program[active] || program[Object.keys(program)[0]];
  return (
    <section className="section" id="program" style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
      <div className="container">
        <div className="section-head">
          <div className="lhs">
            <span className="label label-bracket">03 / Program</span>
            <h2>Tre dage,<br />ét <span className="accent">program</span></h2>
          </div>
          <span className="num">[ 07 — 09 AUG 2026 ]</span>
        </div>
        <div className="program">
          <div className="day-tabs">
            {days.map(d => (
              <button
                key={d}
                className={"day-tab" + (active === d ? " active" : "")}
                onClick={() => setActive(d)}
              >
                <span className="d-day">{d}</span>
                <span className="d-num">{D.program[d].date.split(" · ")[0]}</span>
                <span className="d-name">August 2026</span>
              </button>
            ))}
          </div>
          <div className="program-panel">
            <div className="program-head">
              <span className="head-day">{data.day}</span>
              <span className="head-date">{data.date}</span>
            </div>
            {data.rows.map((r, i) => (
              <div className="prog-row" key={i}>
                <div className="prog-time">{r.time}</div>
                <div>
                  <div className="prog-title">{r.title}</div>
                  <div className="prog-sub">{r.sub}</div>
                </div>
                {r.tag && <div className={"prog-tag" + (r.tag === "HOT" ? " hot" : "")}>{r.tag}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Voting ---------- */
function Voting() {
  const [options, setOptions] = useState(D.voteOptions);
  const [counts,  setCounts]  = useState({});
  const [voted,   setVoted]   = useState(() => {
    try { return localStorage.getItem("obm-voted") || null; } catch { return null; }
  });

  const total = useMemo(() => Math.max(Object.values(counts).reduce((a, b) => a + b, 0), 1), [counts]);

  useEffect(() => {
    sbFetch("vote_options", "select=*&order=sort_order").then(data => {
      if (data && data.length > 0) setOptions(data);
    });
    sbFetch("votes", "select=option_id").then(data => {
      if (!data) return;
      const c = {};
      data.forEach(v => { c[v.option_id] = (c[v.option_id] || 0) + 1; });
      setCounts(c);
    });
  }, []);

  const cast = async (id) => {
    if (voted) return;
    setCounts(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
    setVoted(id);
    try { localStorage.setItem("obm-voted", id); } catch {}
    await sbPost("votes", { option_id: id });
  };

  return (
    <section className="section vote-bg" id="afstemning">
      <div className="container">
        <div className="section-head">
          <div className="lhs">
            <span className="label label-bracket">04 / Truckspotters' afstemning</span>
            <h2>Hvilken er<br /><span className="accent">ØBM's fedeste</span> bil?</h2>
          </div>
          <span className="num">[ Vi finder ØBM's fedeste bil lørdag aften ]</span>
        </div>
        <div className="vote-grid">
          {options.map(o => {
            const pct = Math.round(((counts[o.id] || 0) / total) * 100);
            return (
              <button
                key={o.id}
                className={"vote-card" + (voted === o.id ? " voted" : "")}
                onClick={() => cast(o.id)}
              >
                <div className="vote-stamp">Stemt!</div>
                <div className="vote-img">
                  {o.image_url
                    ? <img src={o.image_url} alt={o.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    : <ImgPH label={o.img || o.name} />
                  }
                </div>
                <div className="vote-body">
                  <div className="vote-name">{o.name}</div>
                  <div className="vote-owner">{o.owner}</div>
                  <div className="vote-bar"><div style={{ width: pct + "%" }} /></div>
                  <div className="vote-pct">
                    <span>Stemmer</span>
                    <span className="pct-num">{pct}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 24, fontFamily: "var(--ff-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cream-dim)" }}>
          {voted ? "[ Tak — din stemme er talt. ]" : "[ Klik paa din favorit. ]"}
        </div>
      </div>
    </section>
  );
}

/* ---------- Lastbil CTA (sekundær) ---------- */
function TruckCTA() {
  return (
    <section className="section section-tight" id="tilmelding">
      <div className="container">
        <div className="truck-cta">
          <div className="tc-lhs">
            <div className="label label-bracket" style={{ marginBottom: 10 }}>Har du selv en maskine?</div>
            <h4>Tilmeld din lastbil, lowrider eller custom</h4>
            <p>Vi vil gerne have din bil med på pladsen. Tilmelding senest <strong style={{ color: "var(--cream)" }}>24. juli 2026</strong> — send os en besked på Messenger.</p>
          </div>
          <div className="tc-fees">
            <div>
              Lastbil­udstilling
              <strong>400 kr</strong>
            </div>
            <div>
              Fællesspisning
              <strong>400 kr</strong>
            </div>
          </div>
          <a className="btn btn-ghost" href="#info">
            Kontakt os <span className="arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Practical ---------- */
function Practical() {
  const [s, setS] = useState({});

  useEffect(() => {
    sbFetch("site_settings", "select=key,value").then(data => {
      if (data) {
        const map = {};
        data.forEach(r => { map[r.key] = r.value; });
        setS(map);
      }
    });
  }, []);

  const phone  = s.phone        || "33 60 52 74";
  const fbUrl  = s.facebook_url || "#";
  const addr1  = s.address1     || "Stadionvej";
  const addr2  = s.address2     || "3650 Ølstykke";
  const price  = s.ticket_price || "30";

  return (
    <section className="section" id="info">
      <div className="container">
        <div className="section-head">
          <div className="lhs">
            <span className="label label-bracket">06 / Praktisk</span>
            <h2>Find os.<br /><span className="accent">Kontakt os.</span></h2>
          </div>
          <span className="num">[ {addr1} · {addr2} ]</span>
        </div>
        <div className="practical">
          <div className="p-cell">
            <div className="label label-bracket">Adresse</div>
            <h4>{addr1}</h4>
            <p>{addr2}<br />Nordsjælland, Danmark<br /><br />Parkering på pladsen — følg skiltning ind fra Frederikssundsvej.</p>
          </div>
          <div className="p-cell">
            <div className="label label-bracket">Kontakt</div>
            <h4>Vi svarer hurtigt</h4>
            <a className="line" href={fbUrl} target="_blank" rel="noopener">Messenger · ØBM på Facebook</a>
            <p style={{ marginTop: 10 }}>Skriv til os på Messenger — så får alle frivillige beskeden.</p>
          </div>
          <div className="p-cell">
            <div className="label label-bracket">Billetter</div>
            <h4>{price} kr · alle 3 dage</h4>
            <p>Én billet giver adgang til alle tre dage.<br /><br />Køb online via Tikkio eller i indgangen — vi anbefaler online for hurtig adgang.</p>
          </div>
          <div className="p-cell">
            <div className="label label-bracket">For familien</div>
            <h4>Hele dagen, hele weekenden</h4>
            <p>Kræmmermarked, tivoli, madboder og masser af aktiviteter for hele familien.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="foot-col">
            <h5>[ Ølstykke By &amp; Motorfestival ]</h5>
            <p style={{ color: "var(--cream-dim)", fontSize: 13.5, lineHeight: 1.6, margin: "0 0 16px", maxWidth: 360 }}>
              En festival for hele familien — midt i hjertet af Ølstykke. Passion, fællesskab, diesel i blodet og kærlighed til alt med motor.
            </p>
            <div className="hazard" style={{ height: 8, maxWidth: 220 }}></div>
          </div>
          <div className="foot-col">
            <h5>Festival</h5>
            <a href="https://tikkio.com/events/64286" target="_blank" rel="noopener">Køb billet</a>
            <a href="#program">Program</a>
            <a href="#lineup">Lineup</a>
            <a href="#afstemning">Afstemning</a>
            <a href="#tilmelding">Tilmeld lastbil</a>
          </div>
          <div className="foot-col">
            <h5>Praktisk</h5>
            <a href="#info">Find vej</a>
            <a href="#info">Kontakt</a>
            <a href="#info">For pressen</a>
            <a href="#info">Frivillig</a>
          </div>
          <div className="foot-col">
            <h5>Følg med</h5>
            <a href="#">Facebook</a>
            <a href="#">Messenger</a>
          </div>
        </div>

        <div className="big-foot-mark">ØBM · 2026</div>

        <div className="hazard" style={{ marginTop: 32, marginBottom: 20 }}></div>

        <div className="foot-bottom">
          <span>© 2026 Ølstykke By &amp; Motorfestival</span>
          <span>[ Det bliver for vildt — vi ses 07 — 09 AUG ]</span>
          <a href="admin.html" style={{ color: "var(--cream-dim)", fontSize: 12, opacity: 0.4, textDecoration: "none", letterSpacing: "0.08em" }}>Admin</a>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Hero (tweak-aware wrapper) ---------- */
function HeroWrapped({ t }) {
  return (
    <Hero showCountdown={t.showCountdown} showSticker={t.showSticker} />
  );
}

/* ---------- App ---------- */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useFontLoader(t.displayFont);
  useEffect(() => { applyTweaks(t); }, [t]);

  return (
    <>
      <Topbar />
      <HeroWrapped t={t} />
      <Marquee />
      <div className="hazard hazard-red"></div>
      <Billet />
      <WhatGrid />
      <Lineup />
      <Program />
      <Voting />
      <TruckCTA />
      <div className="hazard"></div>
      <Practical />
      <Footer />

      <TweaksPanel>
        <TweakSection label="Farve­palet" />
        <TweakColor
          label="Accent"
          value={t.palette}
          options={[
            ["#e63946", "#d4a942"],
            ["#ff3b30", "#f5efe6"],
            ["#d4a942", "#e63946"],
            ["#7cc4ff", "#e63946"],
            ["#ff7a1a", "#d4a942"],
            ["#f5efe6", "#8a8073"]
          ]}
          onChange={(v) => setTweak('palette', v)}
        />

        <TweakSection label="Typografi" />
        <TweakSelect
          label="Display font"
          value={t.displayFont}
          options={["Anton", "Bebas Neue", "Archivo Black", "Big Shoulders"]}
          onChange={(v) => setTweak('displayFont', v)}
        />

        <TweakSection label="Hero" />
        <TweakToggle
          label="Vis sticker"
          value={t.showSticker}
          onChange={(v) => setTweak('showSticker', v)}
        />
        <TweakToggle
          label="Vis nedtælling"
          value={t.showCountdown}
          onChange={(v) => setTweak('showCountdown', v)}
        />

        <TweakSection label="Stil" />
        <TweakToggle
          label="Hazard-striber"
          value={t.hazardOn}
          onChange={(v) => setTweak('hazardOn', v)}
        />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
