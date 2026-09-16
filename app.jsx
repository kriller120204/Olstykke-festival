/* ============================================================
   ØLSTYKKE BY & MOTORFESTIVAL — App
   ============================================================ */
const { useState, useEffect } = React;
const D = window.OBM_DATA;
const Billet = window.Billet;

// Billeder er lokale filer i /images — funktionen findes stadig hvis en
// Supabase Storage-URL nogensinde bruges igen, men rører ikke lokale stier.
function imgUrl(url, width = 800, quality = 75) {
  if (!url || !url.includes("/storage/v1/object/public/")) return url;
  return url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/")
    + `?width=${width}&quality=${quality}`;
}

/* ---------- Nedtælling til billetsalg 2027 ---------- */
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

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#e63946", "#d4a942"],
  "displayFont": "Anton",
  "hazardOn": true,
  "heroStyle": "split"
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
    { href: "#galleri", label: "Billeder" },
    { href: "#lineup", label: "Lineup" },
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
          <a className="nav-cta" href="#klar-2027">Vi ses i 2027 <span>→</span></a>
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
          <a className="mobile-cta" href="#klar-2027" onClick={close}>
            Vi ses i 2027 →
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

/* ---------- Hero (recap) ---------- */
function Hero({ heroImage } = {}) {
  const img = heroImage || D.heroImage;
  const heroStyle = img ? {
    backgroundImage: `linear-gradient(180deg, rgba(11,10,9,0.55) 0%, rgba(11,10,9,0.72) 55%, rgba(11,10,9,0.92) 100%), url(${imgUrl(img, 1800, 78)})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  } : {};

  return (
    <section className="hero hero-photo" id="top" style={heroStyle}>
      <div className="hero-grid">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <span className="dot"></span>
            <span className="label">[ ØBM · 2. udgave · Stadionvej, Ølstykke ]</span>
          </div>
          <h1 className="hero-title">
            <span className="row">Tusind tak</span>
            <span className="row outline">for</span>
            <span className="row">ØBM <span className="accent">2026</span></span>
          </h1>
          <p className="hero-tag">
            Det blev <span className="strike">for stort</span> for vildt — tak fordi 12.000 af jer viste op og gjorde 2026 til den vildeste udgave af ØBM nogensinde.
          </p>
          <div className="hero-meta">
            <div>
              <div>Gæster</div>
              <strong>12.000</strong>
            </div>
            <div>
              <div>Lastbiler</div>
              <strong>320</strong>
            </div>
            <div>
              <div>Udstillere</div>
              <strong>20</strong>
            </div>
            <div>
              <div>Dage</div>
              <strong>07 — 09 AUG</strong>
            </div>
          </div>
          <div className="hero-cta-row">
            <a href="#galleri" className="btn btn-primary btn-xl">
              Se billederne <span className="arrow">→</span>
            </a>
            <a href="#lineup" className="btn btn-ghost">
              Se lineup <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Tak-for-i-år tal (stor) ---------- */
function ThanksStats() {
  const stats = [
    { num: "12.000", label: "gæster på pladsen" },
    { num: "320", label: "lastbiler" },
    { num: "20", label: "udstillere" },
    { num: "3", label: "dage i træk" },
    { num: "2.", label: "udgave af ØBM" },
  ];
  return (
    <div className="thanks-stats">
      <div className="container">
        <div className="thanks-head">
          <span className="label label-bracket">Tak for i år</span>
          <h2>I gjorde det<br />til noget <span className="accent">helt særligt</span></h2>
        </div>
        <div className="reach-grid">
          {stats.map((s, i) => (
            <div key={i} className="reach-cell">
              <div className="big-num">{s.num}</div>
              <div className="label label-bracket" style={{ marginTop: 10 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Marquee ---------- */
function Marquee() {
  const items = [
    "Heavy Showtrucks", "Lowriders", "Custom Cars", "Lastbiler",
    "Motorcykler", "Veteran &amp; Special", "Kræmmer­marked", "Tivoli",
    "Live Musik", "Mad &amp; Øl", "Diesel i blodet", "Det blev for vildt",
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

/* ---------- Foto-galleri ---------- */
function Gallery() {
  const photos = D.gallery || [];
  if (photos.length === 0) return null;

  return (
    <section className="section" id="galleri">
      <div className="container">
        <div className="section-head">
          <div className="lhs">
            <span className="label label-bracket">01 / Galleri</span>
            <h2>Sådan<br />så det <span className="accent">ud</span></h2>
          </div>
          <span className="num">[ {photos.length} billeder · ØBM 2026 ]</span>
        </div>
      </div>
      <div className="gallery-stack">
        {photos.map((p, i) => (
          <div className="gallery-item" key={i}>
            <img src={p.src} alt={p.alt || "ØBM 2026"} loading="lazy" />
            <span className="gallery-num">{String(i + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- What's happening ---------- */
function WhatGrid() {
  const items = D.whatGrid;

  return (
    <section className="section" id="hvad">
      <div className="container">
        <div className="section-head">
          <div className="lhs">
            <span className="label label-bracket">02 / Hvad der skete</span>
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
  const items = D.lineup;

  return (
    <section className="section" id="lineup">
      <div className="container">
        <div className="section-head">
          <div className="lhs">
            <span className="label label-bracket">03 / Dette var med</span>
            <h2>Folk<br />der <span className="accent">mødte op</span></h2>
          </div>
          <span className="num">[ {items.length} navne · tak for i år ]</span>
        </div>
        <div className="lineup">
          {items.map(l => (
            <div key={l.name} className="line-card">
              <div className="line-tag">{l.tag}</div>
              <div className="line-img">
                {l.imageUrl
                  ? <img src={imgUrl(l.imageUrl, 400)} alt={l.name} />
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

/* ---------- Næste år (teaser) ---------- */
function NextYear() {
  const c = useCountdown(new Date(2026, 9, 1, 12, 0, 0).getTime());
  return (
    <section className="next-year" id="klar-2027">
      <div className="container next-year-inner">
        <div className="ny-eyebrow">[ Allerede i gang ]</div>
        <h2 className="ny-headline">
          Vi går i gang med<br />planlægningen af <span className="ny-pop">ØBM 2027</span><br />allerede nu 🚛
        </h2>

        <div className="ny-countdown">
          <div className="ny-countdown-label">Billetsalget til 2027 åbner om</div>
          <div className="ny-countdown-vals">
            <div className="cell"><span className="num">{String(c.d).padStart(2, "0")}</span><span className="unit">dage</span></div>
            <div className="cell"><span className="num">{String(c.h).padStart(2, "0")}</span><span className="unit">timer</span></div>
            <div className="cell"><span className="num">{String(c.m).padStart(2, "0")}</span><span className="unit">min</span></div>
            <div className="cell"><span className="num">{String(c.s).padStart(2, "0")}</span><span className="unit">sek</span></div>
          </div>
          <div className="ny-countdown-date">[ 1. oktober 2026 · kl. 12:00 ]</div>
        </div>

        <p className="ny-sub">
          ØBM 2026 er lige overstået, og vi er i fuld gang med at planlægge næste udgave. Billetsalget til 2027 slår dørene op 1. oktober kl. 12:00 — følg med på Facebook, så du er den første der hører om det.
        </p>
        <a className="btn ny-cta" href="https://www.facebook.com/profile.php?id=61589298855212" target="_blank" rel="noopener">
          Følg os på Facebook <span className="arrow">→</span>
        </a>
      </div>
    </section>
  );
}

/* ---------- Practical ---------- */
function Practical() {
  const phone = "33 60 52 74";
  const fbUrl = "https://www.facebook.com/profile.php?id=61589298855212";
  const addr1 = "Stadionvej";
  const addr2 = "3650 Ølstykke";

  return (
    <section className="section" id="info">
      <div className="container">
        <div className="section-head">
          <div className="lhs">
            <span className="label label-bracket">04 / Praktisk</span>
            <h2>Find os.<br /><span className="accent">Kontakt os.</span></h2>
          </div>
          <span className="num">[ {addr1} · {addr2} ]</span>
        </div>
        <div className="practical">
          <div className="p-cell">
            <div className="label label-bracket">Adresse</div>
            <h4>{addr1}</h4>
            <p>{addr2}<br />Nordsjælland, Danmark<br /><br />Sådan så pladsen ud i 2026 — vi bygger den op igen til 2027.</p>
          </div>
          <div className="p-cell">
            <div className="label label-bracket">Kontakt</div>
            <h4>Vi svarer hurtigt</h4>
            <a className="line" href={fbUrl} target="_blank" rel="noopener">Messenger · ØBM på Facebook</a>
            <p style={{ marginTop: 10 }}>Skriv til os på Messenger — så får alle frivillige beskeden.</p>
          </div>
          <div className="p-cell">
            <div className="label label-bracket">Billetter</div>
            <h4>Billetsalget er lukket</h4>
            <p>Festivalen er afholdt for i år. Billetter til 2027 åbner i god tid — følg med på Facebook.</p>
          </div>
          <div className="p-cell">
            <div className="label label-bracket">For familien</div>
            <h4>Hele dagen, hele weekenden</h4>
            <p>Kræmmermarked, tivoli, madboder og masser af aktiviteter for hele familien — sådan bliver det igen i 2027.</p>
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
            <a href="#galleri">Billeder</a>
            <a href="#lineup">Lineup</a>
            <a href="#klar-2027">2027</a>
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
            <a href="https://www.facebook.com/profile.php?id=61589298855212" target="_blank" rel="noopener">Facebook</a>
            <a href="https://www.facebook.com/profile.php?id=61589298855212" target="_blank" rel="noopener">Messenger</a>
          </div>
        </div>

        <div className="big-foot-mark">ØBM · 2026</div>

        <div className="hazard" style={{ marginTop: 32, marginBottom: 20 }}></div>

        <div className="foot-bottom">
          <span>© 2026 Ølstykke By &amp; Motorfestival</span>
          <span>[ Tak for 2026 — vi gør klar til 2027 ]</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Hero (tweak-aware wrapper) ---------- */
function HeroWrapped() {
  return <Hero />;
}

/* ---------- App ---------- */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useFontLoader(t.displayFont);
  useEffect(() => { applyTweaks(t); }, [t]);

  return (
    <>
      <Topbar />
      <HeroWrapped />
      <ThanksStats />
      <Marquee />
      <div className="hazard hazard-red"></div>
      <Gallery />
      <WhatGrid />
      <Lineup />
      <NextYear />
      <div className="hazard"></div>
      <Billet />
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
