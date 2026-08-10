/* ============================================================
   ØLSTYKKE BY & MOTORFESTIVAL — Billetter (2026 afholdt, salg lukket)
   ============================================================ */

function Billet() {
  return (
    <section className="section billet-bg" id="billet">
      <div className="container">
        <div className="section-head">
          <div className="lhs">
            <span className="label label-bracket">Billetsalg 2026 · lukket</span>
            <h2>Sådan var<br />prisen i <span className="accent">2026</span></h2>
          </div>
          <span className="num">[ 07 — 09 AUG · Stadionvej, Ølstykke ]</span>
        </div>

        <div className="billet-centered">
          <h3>Billetsalget<br />er lukket.</h3>
          <p className="lead">
            Festivalen er afholdt for i år — tak til alle der var med. Her er priserne, som en hilsen til dem der spørger — nye priser og billetter kommer, når vi åbner salget til 2027.
          </p>

          <div className="billet-pricing">
            <div className="row">
              <div>
                <div className="ltype">Festivalsbillet</div>
                <div className="ldesc">Adgang alle 3 dage</div>
              </div>
              <div className="lprice">30<span className="kr">kr</span></div>
            </div>
            <div className="row">
              <div>
                <div className="ltype">Fællesspisning · voksen</div>
                <div className="ldesc">Fredag aften · begrænset pladser</div>
              </div>
              <div className="lprice">189<span className="kr">kr</span></div>
            </div>
            <div className="row">
              <div>
                <div className="ltype">Fællesspisning · barn</div>
                <div className="ldesc">Fredag aften · begrænset pladser</div>
              </div>
              <div className="lprice">99<span className="kr">kr</span></div>
            </div>
            <div className="row">
              <div>
                <div className="ltype">Udstiller</div>
                <div className="ldesc">Bil/lastbil på pladsen</div>
              </div>
              <div className="lprice">400<span className="kr">kr</span></div>
            </div>
          </div>

          <a href="#klar-2027" className="btn-tikkio billet-cta-btn">
            Vi gør klar til 2027 <span className="arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

window.Billet = Billet;
