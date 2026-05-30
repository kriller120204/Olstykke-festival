/* ============================================================
   ØLSTYKKE BY & MOTORFESTIVAL — Billetter via Tikkio
   ============================================================ */

const TIKKIO_URL = "https://tikkio.com/events/64286";

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

        <div className="billet-centered">
          <h3>Én pris.<br />Hele weekenden.</h3>
          <p className="lead">
            Vi holder entréen lav — 30 kr giver dig adgang til alle tre dage, alle showene, hele showtruck-pladsen og hele kræmmermarkedet.
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
          </div>

          <a href={TIKKIO_URL} target="_blank" rel="noopener" className="btn-tikkio billet-cta-btn">
            Køb billet — 30 kr <span className="arrow">→</span>
          </a>

          <div className="tikkio-trust">
            <span>✓ MobilePay</span>
            <span>✓ Betalingskort</span>
            <span>✓ Billet på email</span>
          </div>
        </div>
      </div>
    </section>
  );
}

window.Billet = Billet;
