/* ============================================================
   ØLSTYKKE BY & MOTORFESTIVAL — Billetter via Tikkio
   ============================================================ */

const TIKKIO_URL = "https://tikkio.com/events/64286";

/* ---------- TikkioCTA ---------- */
function TikkioCTA() {
  return (
    <div className="tikkio-box">
      <div className="label label-bracket" style={{ marginBottom: 20 }}>Billetter via Tikkio</div>
      <div style={{ fontFamily: "var(--ff-display)", fontSize: 42, lineHeight: 1.02, textTransform: "uppercase", marginBottom: 18 }}>
        Klar til<br />festivalen?
      </div>
      <p style={{ color: "var(--cream-dim)", fontSize: 15, lineHeight: 1.65, marginBottom: 32, maxWidth: 360 }}>
        Billetter købes sikkert via Tikkio. Du modtager din billet direkte på email — klar til scanning ved indgangen.
      </p>

      <a href={TIKKIO_URL} target="_blank" rel="noopener" className="btn-tikkio">
        Køb billet — 30 kr <span className="arrow">→</span>
      </a>

      <div className="tikkio-trust">
        <span>✓ MobilePay</span>
        <span>✓ Betalingskort</span>
        <span>✓ Billet på email</span>
      </div>
    </div>
  );
}

/* ---------- Billet section ---------- */
function Billet() {
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
              Vi holder entréen lav — 30 kr giver dig adgang til alle tre dage, alle showene, hele showtruck-pladsen og hele kræmmer­markedet.
            </p>

            <div className="billet-pricing">
              <div className="row">
                <div>
                  <div className="ltype">Festivalsbillet</div>
                  <div className="ldesc">Adgang alle 3 dage</div>
                </div>
                <div className="lprice">30<span className="kr">kr</span></div>
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

          <TikkioCTA />
        </div>
      </div>
    </section>
  );
}

window.Billet = Billet;
