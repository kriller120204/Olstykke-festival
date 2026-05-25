/* ============================================================
   ØLSTYKKE BY & MOTORFESTIVAL — Billetsystem
   ============================================================ */
const { useState, useEffect, useMemo } = React;

const STORAGE_KEY = "obm-tickets-v1";

const DAY_OPTIONS = [
  { id: "all", short: "Alle 3", date: "07—09 AUG", label: "Alle 3 dage" },
  { id: "fri", short: "Fre",     date: "07 AUG",    label: "Fredag 7. august" },
  { id: "sat", short: "Lør",     date: "08 AUG",    label: "Lørdag 8. august" },
  { id: "sun", short: "Søn",     date: "09 AUG",    label: "Søndag 9. august" },
];

const TICKET_TYPES = [
  { id: "voksen",  name: "Voksen",   meta: "12 år og opefter",       price: 30 },
  { id: "barn",    name: "Barn",     meta: "0—11 år · gratis adgang", price: 0 },
];

/* ---------- helpers ---------- */
function makeCode() {
  const c = () => Math.random().toString(16).slice(2, 6).toUpperCase();
  return `ØBM-2026-${c()}-${c()}`;
}

function loadTickets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}
function saveTickets(t) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); } catch (e) {}
}

/* QR using global qrcode-generator lib. Falls back to plain box if lib not loaded. */
function genQrSvg(text) {
  if (typeof window.qrcode === "function") {
    try {
      const qr = window.qrcode(0, "M");
      qr.addData(text);
      qr.make();
      return qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    } catch (e) { /* fall through */ }
  }
  // fallback: just a tinted box with the code label
  return `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <rect width="50" height="50" fill="#0b0a09"/>
    <text x="25" y="28" text-anchor="middle" font-family="monospace" font-size="6" fill="#f5efe6">QR</text>
  </svg>`;
}

/* ---------- TicketCard ---------- */
function TicketCard({ t }) {
  const dayObj = DAY_OPTIONS.find(d => d.id === t.dayId) || DAY_OPTIONS[0];
  const qr = useMemo(() => genQrSvg(t.id), [t.id]);
  return (
    <div className="ticket">
      <div className="ticket-main">
        <span className="t-pre">[ Ølstykke By &amp; Motorfestival · 2026 ]</span>
        <div className="t-name">{t.type}<br />— ENTRÉ-BILLET</div>
        <div className="t-grid">
          <div>
            <div className="tl">Indehaver</div>
            <div className="tv">{t.holder}</div>
          </div>
          <div>
            <div className="tl">Dage</div>
            <div className="tv">{dayObj.date}</div>
          </div>
          <div>
            <div className="tl">Sted</div>
            <div className="tv">Stadionvej · Ølstykke</div>
          </div>
          <div>
            <div className="tl">Pris</div>
            <div className="tv">{t.price === 0 ? "GRATIS" : t.price + " KR"}</div>
          </div>
        </div>
        <div className="t-code">{t.id}</div>
      </div>
      <div className="ticket-stub">
        <span className="stub-pre">SCAN VED INDGANG</span>
        <div className="qr" dangerouslySetInnerHTML={{ __html: qr }} />
        <span className="stub-id">ØBM · 2026</span>
      </div>
    </div>
  );
}

/* ---------- Booking flow ---------- */
function BookingFlow({ existingTickets, onConfirm, onClose }) {
  const [step, setStep] = useState("select"); // select | info | pay | processing | done
  const [dayId, setDayId] = useState("all");
  const [qty, setQty] = useState({ voksen: 1, barn: 0 });
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [payMethod, setPayMethod] = useState("mobilepay");
  const [issued, setIssued] = useState([]);

  const total = qty.voksen * 30 + qty.barn * 0;
  const ticketCount = qty.voksen + qty.barn;
  const dayObj = DAY_OPTIONS.find(d => d.id === dayId);

  const bump = (id, delta) => {
    setQty(q => ({ ...q, [id]: Math.max(0, Math.min(20, q[id] + delta)) }));
  };

  const stepIdx = ["select", "info", "pay", "processing", "done"].indexOf(step);

  const goPay = () => {
    setStep("processing");
    setTimeout(() => {
      const tix = [];
      for (let i = 0; i < qty.voksen; i++) {
        tix.push({
          id: makeCode(),
          type: "Voksen",
          price: 30,
          holder: form.name,
          email: form.email,
          phone: form.phone,
          dayId,
          purchased: Date.now(),
        });
      }
      for (let i = 0; i < qty.barn; i++) {
        tix.push({
          id: makeCode(),
          type: "Barn",
          price: 0,
          holder: form.name + (qty.voksen > 0 ? " (barn)" : ""),
          email: form.email,
          phone: form.phone,
          dayId,
          purchased: Date.now(),
        });
      }
      setIssued(tix);
      onConfirm(tix);
      setStep("done");
    }, 1300);
  };

  const reset = () => {
    setStep("select");
    setQty({ voksen: 1, barn: 0 });
    setForm({ name: "", email: "", phone: "" });
    setIssued([]);
  };

  const STEPS = [
    { key: "select", num: "01", label: "Vælg" },
    { key: "info",   num: "02", label: "Info" },
    { key: "pay",    num: "03", label: "Betaling" },
    { key: "done",   num: "04", label: "Billet" },
  ];

  return (
    <div className="booking">
      <div className="booking-bar">
        {STEPS.map((s, i) => {
          const active = s.key === step || (step === "processing" && s.key === "pay");
          const done = i < stepIdx && step !== "done";
          return (
            <div key={s.key} className={"step" + (active ? " active" : "") + (done ? " done" : "")}>
              <span className="stepnum">{s.num}</span>
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>

      {step === "select" && (
        <div className="booking-body">
          <h4>Vælg dine billetter</h4>
          <div className="bsub">[ 30 kr · voksen · børn under 12 gratis ]</div>

          {existingTickets.length > 0 && (
            <div className="have-tix">
              <span className="htl">Du har <strong>{existingTickets.length}</strong> billet{existingTickets.length === 1 ? "" : "ter"} på denne enhed</span>
              <button onClick={onClose}>Se mine billetter →</button>
            </div>
          )}

          <div className="label label-bracket" style={{ marginBottom: 12 }}>Hvilke dage?</div>
          <div className="date-chips">
            {DAY_OPTIONS.map(d => (
              <button
                key={d.id}
                className={"date-chip" + (dayId === d.id ? " active" : "")}
                onClick={() => setDayId(d.id)}
              >
                <span className="dc-day">{d.short}</span>
                <span className="dc-date">{d.date}</span>
              </button>
            ))}
          </div>

          <div className="label label-bracket" style={{ marginTop: 8, marginBottom: 4 }}>Antal billetter</div>
          {TICKET_TYPES.map(tt => (
            <div key={tt.id} className="qty-row">
              <div className="qinfo">
                <div className="name">{tt.name}</div>
                <div className="meta">{tt.meta} · {tt.price === 0 ? "Gratis" : tt.price + " kr"}</div>
              </div>
              <div className="stepper">
                <button onClick={() => bump(tt.id, -1)} disabled={qty[tt.id] === 0}>−</button>
                <span className="qval">{qty[tt.id]}</span>
                <button onClick={() => bump(tt.id, 1)} disabled={qty[tt.id] >= 20}>+</button>
              </div>
            </div>
          ))}

          <div className={"btotal" + (total === 0 ? " free" : "")}>
            <div>
              <div className="blbl">I alt · {ticketCount} billet{ticketCount === 1 ? "" : "ter"}</div>
              <div style={{ fontFamily: "var(--ff-mono)", fontSize: 11, color: "var(--mute)", marginTop: 4, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {dayObj.label}
              </div>
            </div>
            <div className="bamt">{total}<small>kr</small></div>
          </div>

          <button
            className="bnext"
            disabled={ticketCount === 0}
            onClick={() => setStep("info")}
          >
            Fortsæt →
          </button>
        </div>
      )}

      {step === "info" && (
        <div className="booking-body">
          <h4>Hvem skal med?</h4>
          <div className="bsub">[ Billetter sendes til din email ]</div>

          <div className="field">
            <label>Fuldt navn</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Fornavn Efternavn"
              autoFocus
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="navn@email.dk"
            />
          </div>
          <div className="field">
            <label>Telefon</label>
            <input
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+45 ..."
            />
          </div>

          <button
            className="bnext"
            disabled={!form.name || !form.email || !form.phone}
            onClick={() => setStep("pay")}
          >
            Til betaling →
          </button>
          <a className="bback" href="#" onClick={e => { e.preventDefault(); setStep("select"); }}>← Tilbage</a>
        </div>
      )}

      {step === "pay" && (
        <div className="booking-body">
          <h4>Betaling</h4>
          <div className="bsub">[ Sikker betaling · krypteret ]</div>

          <div className="pay-summary">
            <div className="prow"><span>{qty.voksen} × Voksen</span><span>{qty.voksen * 30} kr</span></div>
            {qty.barn > 0 && <div className="prow"><span>{qty.barn} × Barn</span><span>0 kr</span></div>}
            <div className="prow"><span>Dage</span><span>{dayObj.short}</span></div>
            <div className="prow bold"><span>Total</span><span>{total} kr</span></div>
          </div>

          <div className="label label-bracket" style={{ marginBottom: 12 }}>Vælg betalingsmetode</div>
          <div className="pay-methods">
            <button
              className={"pay-method" + (payMethod === "mobilepay" ? " active" : "")}
              onClick={() => setPayMethod("mobilepay")}
            >
              <div className="pmname">MobilePay</div>
              <div className="pmdesc">Hurtigt &amp; nemt</div>
            </button>
            <button
              className={"pay-method" + (payMethod === "card" ? " active" : "")}
              onClick={() => setPayMethod("card")}
            >
              <div className="pmname">Betalingskort</div>
              <div className="pmdesc">Visa · Mastercard</div>
            </button>
          </div>

          <button className="bnext" onClick={goPay}>
            {total === 0 ? "Bekræft (gratis) →" : `Betal ${total} kr →`}
          </button>
          <a className="bback" href="#" onClick={e => { e.preventDefault(); setStep("info"); }}>← Tilbage</a>
        </div>
      )}

      {step === "processing" && (
        <div className="pay-processing">
          <div className="spinner"></div>
          <div style={{ fontFamily: "var(--ff-display)", fontSize: 24, textTransform: "uppercase", marginBottom: 8 }}>
            Behandler betaling
          </div>
          <div style={{ fontFamily: "var(--ff-mono)", fontSize: 11, letterSpacing: "0.14em", color: "var(--cream-dim)", textTransform: "uppercase" }}>
            [ Genererer dine billetter ... ]
          </div>
        </div>
      )}

      {step === "done" && (
        <>
          <div className="conf-head">
            <div className="check">✓</div>
            <h4>{issued.length} billet{issued.length === 1 ? "" : "ter"} til {form.name.split(" ")[0]}</h4>
            <div className="csub">[ Sendt til {form.email} · gem også her ]</div>
          </div>
          <div className="tickets-stack">
            {issued.map(t => <TicketCard key={t.id} t={t} />)}
          </div>
          <div className="conf-actions">
            <button className="btn btn-ghost" onClick={() => window.print()}>
              Udskriv <span className="arrow">→</span>
            </button>
            <button className="btn btn-primary" onClick={reset}>
              Køb flere <span className="arrow">→</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- My tickets view ---------- */
function MyTicketsView({ tickets, onBack, onClear }) {
  return (
    <div className="booking">
      <div className="conf-head" style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ width: 48, height: 48, margin: "0 auto 16px", background: "var(--gold)", color: "#0b0a09", display: "grid", placeItems: "center", fontFamily: "var(--ff-display)", fontSize: 20 }}>
          {tickets.length}
        </div>
        <h4>Mine billetter</h4>
        <div className="csub">[ Gemt lokalt på denne enhed ]</div>
      </div>
      <div className="tickets-stack">
        {tickets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--cream-dim)" }}>
            Ingen billetter endnu.
          </div>
        ) : tickets.map(t => <TicketCard key={t.id} t={t} />)}
      </div>
      <div className="conf-actions">
        <button className="btn btn-ghost" onClick={onClear}>
          Ryd <span className="arrow">→</span>
        </button>
        <button className="btn btn-primary" onClick={onBack}>
          Køb billetter <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );
}

/* ---------- Billet section ---------- */
function Billet() {
  const [tickets, setTicketsState] = useState(loadTickets);
  const [viewMode, setViewMode] = useState(tickets.length > 0 ? "mine" : "buy");

  const setTickets = (t) => {
    setTicketsState(t);
    saveTickets(t);
  };

  const onConfirm = (newTix) => {
    setTickets([...tickets, ...newTix]);
  };

  const onClear = () => {
    if (confirm("Slet alle billetter fra denne enhed?")) {
      setTickets([]);
      setViewMode("buy");
    }
  };

  return (
    <section className="section billet-bg" id="billet">
      <div className="container">
        <div className="section-head">
          <div className="lhs">
            <span className="label label-bracket">Køb billet · 30 kr</span>
            <h2>Vi ses<br />på <span className="accent">pladsen</span></h2>
          </div>
          <span className="num">[ 07 — 09 AUG · Stadionvej, Ølstykke ]</span>
        </div>

        <div className="billet-grid">
          <div className="billet-info">
            <h3>Én pris.<br />Hele weekenden.</h3>
            <p className="lead">
              Vi holder entréen lav — 30 kr giver dig adgang til alle tre dage, alle showene, hele showtruck-pladsen og hele kræmmer­markedet. Børn under 12 år er gratis i følge med en voksen.
            </p>

            <div className="billet-pricing">
              <div className="row">
                <div>
                  <div className="ltype">Voksen 12+</div>
                  <div className="ldesc">Adgang alle 3 dage</div>
                </div>
                <div className="lprice">30<span className="kr">kr</span></div>
              </div>
              <div className="row">
                <div>
                  <div className="ltype">Barn 0—11</div>
                  <div className="ldesc">I følge med voksen</div>
                </div>
                <div className="lprice free">GRATIS</div>
              </div>
            </div>

            <ul className="billet-bullets">
              <li>Adgang til hele festival­pladsen, alle 3 dage</li>
              <li>Showtruck-udstilling, lowriders &amp; veteran­biler</li>
              <li>Live musik, parade og hovedshow lørdag aften</li>
              <li>Kræmmer­marked, mad­boder og tivoli</li>
              <li>Stemmeret til "Danmarks fedeste bil 2026"</li>
            </ul>

            <div style={{ padding: "20px 22px", borderLeft: "3px solid var(--accent)", background: "var(--bg)" }}>
              <div className="label label-accent" style={{ marginBottom: 8 }}>EN BESKED FRA ARRANGØRERNE</div>
              <p style={{ margin: 0, fontFamily: "var(--ff-display)", fontSize: 22, lineHeight: 1.05, textTransform: "uppercase", letterSpacing: "0.005em" }}>
                Det her bliver ikke bare et træf — det bliver en oplevelse.
              </p>
            </div>
          </div>

          <div>
            {viewMode === "mine" ? (
              <MyTicketsView
                tickets={tickets}
                onBack={() => setViewMode("buy")}
                onClear={onClear}
              />
            ) : (
              <BookingFlow
                existingTickets={tickets}
                onConfirm={onConfirm}
                onClose={() => setViewMode("mine")}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

window.Billet = Billet;
