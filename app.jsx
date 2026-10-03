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
    { href: "#om", label: "Om ØBM" },
    { href: "#galleri", label: "Billeder" },
    { href: "#hvad", label: "Hvad der skete" },
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
          <a className="nav-cta" href="#billet">Udstillerbillet 2027 <span>→</span></a>
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
          <a className="mobile-cta" href="#billet" onClick={close}>
            Udstillerbillet 2027 →
          </a>
        </nav>
      )}
    </header>
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
            <span className="label">[ ØBM · 1. udgave · Ølstykke, Sjælland ]</span>
          </div>

          <div className="hero-countdown">
            <div className="hero-countdown-label">🎟 Billetsalget for udstillere til ØBM 2027 er åbent</div>
            <a href={D.exhibitorTicketUrl} className="btn-tikkio" target="_blank" rel="noopener">
              Køb udstillerbillet <span className="arrow">→</span>
            </a>
            <div className="hero-countdown-date">[ Lastbiler &amp; biler · 13. — 15. august 2027 ]</div>
          </div>

          <h1 className="hero-title">
            <span className="row">Tusind tak</span>
            <span className="row outline">for</span>
            <span className="row">ØBM <span className="accent">2026</span></span>
          </h1>
          <p className="hero-tag">
            Det blev <span className="strike">for stort</span> for vildt — tak fordi 12.000 af jer viste op og gjorde 2026 til den vildeste start på ØBM.
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
            <a href="#hvad" className="btn btn-ghost">
              Hvad der skete <span className="arrow">→</span>
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
    { num: "1.", label: "udgave af ØBM" },
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

/* ---------- Hvad er ØBM? ---------- */
function About() {
  const forAll = [
    { title: "Kræmmermarked", sub: "Boder med tøj, ting og sager — gå på opdagelse og gør et fund." },
    { title: "Tivoli & børn", sub: "Karrusel, tivoli og aktiviteter, så de mindste har en kæmpe dag." },
    { title: "Mad & musik", sub: "Madvogne, fadøl, fællesspisning og live musik på scenen." },
    { title: "Biler & trucks", sub: "Showtrucks, lastbiler, custom, veteran og motorcykler." },
  ];
  return (
    <section className="section" id="om">
      <div className="container">
        <div className="section-head">
          <div className="lhs">
            <span className="label label-bracket">01 / Hvad er ØBM?</span>
            <h2>En weekend<br />for <span className="accent">alle</span></h2>
          </div>
          <span className="num">[ Ølstykke By &amp; Motorfestival ]</span>
        </div>

        <div className="about-grid">
          <div className="about-main">
            <p className="about-lead">
              Far skal se på biler, børnene skal i tivoli, og mor skal finde en ny kjole på kræmmermarkedet.
            </p>
            <p>
              ØBM er byfest, festival, kræmmermarked, foodfestival, tivoli og motorshow — samlet på én plads, i én weekend. Vi vil skabe en weekend for venner og familie, hvor man kan mødes, hygge sig og opleve en anden verden.
            </p>
            <p>
              Du behøver ikke vide noget om motorer for at få en fed dag. Kom for stemningen, maden, musikken, boderne og fællesskabet — det er en weekend for alle.
            </p>
            <div className="about-forall">
              {forAll.map(f => (
                <div key={f.title} className="about-forall-cell">
                  <h4>{f.title}</h4>
                  <p>{f.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="about-card">
            <div className="label label-bracket">Bag ØBM</div>
            <h3>Født i Ølstykke.<br /><span className="accent">Åben for alle.</span></h3>
            <p>
              ØBM er skabt af Ølstykke Auto, der brænder for Ølstykke og for at samle folk. Festivalen har rødder i byen, men gæster og udstillere kommer fra hele landet — og fra udlandet. Bag det hele står en flok frivillige, der bruger deres fritid på at bygge pladsen op, så vi kan samles.
            </p>
            <ul className="about-points">
              <li><span>01</span>Arrangeret af Ølstykke Auto</li>
              <li><span>02</span>Drevet af frivillige</li>
              <li><span>03</span>Gæster fra hele landet og udlandet</li>
            </ul>
            <p className="about-foot">
              2026 var første udgave med 12.000 gæster. I 2027 gør vi det igen — med et større kræmmermarked og flere madvogne.
            </p>
          </aside>
        </div>
      </div>
    </section>
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
            <span className="label label-bracket">02 / Galleri</span>
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
            <span className="label label-bracket">03 / Hvad der skete</span>
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

/* ---------- Næste år (teaser) ---------- */
function NextYear() {
  return (
    <section className="next-year" id="klar-2027">
      <div className="container next-year-inner">
        <div className="ny-eyebrow">[ Allerede i gang ]</div>
        <h2 className="ny-headline">
          Vi går i gang med<br />planlægningen af <span className="ny-pop">ØBM 2027</span><br />allerede nu 🚛
        </h2>
        <p className="ny-sub">
          ØBM 2027 løber af stablen 13.–15. august 2027, og billetsalget for udstillere er åbent nu. Har du en lastbil eller bil, du vil vise frem, så sikr dig en plads. Billetter til gæster kommer senere — følg med på Facebook, så du er den første, der hører om det.
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
  const addr1 = "Ølstykke";
  const addr2 = "Sjælland";

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
            <p>{addr2}, Danmark<br /><br />Den præcise adresse til 2027 kommer senere — følg med på Facebook.</p>
          </div>
          <div className="p-cell">
            <div className="label label-bracket">Kontakt</div>
            <h4>Vi svarer hurtigt</h4>
            <a className="line" href={fbUrl} target="_blank" rel="noopener">Messenger · ØBM på Facebook</a>
            <p style={{ marginTop: 10 }}>Skriv til os på Messenger — så får alle frivillige beskeden.</p>
          </div>
          <div className="p-cell">
            <div className="label label-bracket">Billetter</div>
            <h4>Udstillere: salget er åbent</h4>
            <a className="line" href={D.exhibitorTicketUrl} target="_blank" rel="noopener">Køb udstillerbillet til 2027 →</a>
            <p style={{ marginTop: 10 }}>Billetter til gæster kommer senere — følg med på Facebook.</p>
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
            <a href="#om">Om ØBM</a>
            <a href="#galleri">Billeder</a>
            <a href="#hvad">Hvad der skete</a>
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
      <About />
      <Gallery />
      <WhatGrid />
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
