/* ============================================================
   ØLSTYKKE BY & MOTORFESTIVAL — Billetter (2027: udstillersalg åbent)
   ============================================================ */

function Billet() {
  const url = window.OBM_DATA.exhibitorTicketUrl;
  return (
    <section className="section billet-bg" id="billet">
      <div className="container">
        <div className="section-head">
          <div className="lhs">
            <span className="label label-bracket">Billetsalg 2027 · udstillere</span>
            <h2>Vis din<br />bil <span className="accent">frem</span></h2>
          </div>
          <span className="num">[ 13 — 15 AUG 2027 · Stadionvej, Ølstykke ]</span>
        </div>

        <div className="billet-centered">
          <h3>Salget for<br />udstillere er åbent.</h3>
          <p className="lead">
            Har du en lastbil eller bil, du vil vise frem på ØBM 2027? Køb din udstillerbillet nu, og del din passion med gæster og andre entusiaster. Billetten kan printes eller vises på mobilen.
          </p>

          <div className="billet-pricing">
            <div className="row">
              <div>
                <div className="ltype">Udstiller</div>
                <div className="ldesc">Lastbil eller bil · + 25 kr i gebyr</div>
              </div>
              <div className="lprice">550<span className="kr">kr</span></div>
            </div>
            <div className="row">
              <div>
                <div className="ltype">Gæster</div>
                <div className="ldesc">Billetsalget åbner senere</div>
              </div>
              <div className="lprice free">Snart</div>
            </div>
          </div>

          <a href={url} className="btn-tikkio billet-cta-btn" target="_blank" rel="noopener">
            Køb udstillerbillet <span className="arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

window.Billet = Billet;
