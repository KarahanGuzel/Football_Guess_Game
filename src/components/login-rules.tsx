export function LoginRules() {
  return (
    <section className="login-rules" aria-labelledby="login-rules-title">
      <div className="login-rules-head">
        <h2 id="login-rules-title" className="login-rules-title">
          Nasıl Oynanır?
        </h2>
        <div className="login-rules-lead">
          <p>Her maça iki tahmin girersin: sonuç (1 / X / 2) ve Alt-Üst 2.5.</p>
          <p>Haftadaki bütün maçlar dolmadan kaydedilmez.</p>
          <p>Skorlar girilince puanlar yazılır.</p>
          <p>Sezon boyunca sıralama oluşur.</p>
        </div>
      </div>

      <table className="login-score-table">
        <caption className="login-score-caption">Normal maç</caption>
        <thead>
          <tr>
            <th scope="col">
              <span className="login-score-check" aria-hidden="true">
                ✓
              </span>
              <span className="login-score-hit-label">İsabet</span>
            </th>
            <th scope="col">Puan</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span className="login-score-hit">
                <span className="login-score-check" aria-hidden="true">
                  ✓
                </span>
                Hem Sonuç hem Alt/Üst tahmini
              </span>
            </td>
            <td>
              <span className="login-score-pts">4</span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="login-score-hit">
                <span className="login-score-check" aria-hidden="true">
                  ✓
                </span>
                Yalnız Sonuç tahmini
              </span>
            </td>
            <td>
              <span className="login-score-pts">2</span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="login-score-hit">
                <span className="login-score-check" aria-hidden="true">
                  ✓
                </span>
                Yalnız Alt/Üst tahmini
              </span>
            </td>
            <td>
              <span className="login-score-pts">1</span>
            </td>
          </tr>
        </tbody>
      </table>

      <ul className="login-rules-mods">
        <li className="login-rules-mod login-rules-mod-derby">
          <span className="login-rules-mod-label">Derbi</span>
          <p>
            Derbi maçlar, normal maçlardan kazanılan puanların 2 ile çarpılmış
            hali olarak hesaplanır.
          </p>
        </li>
        <li className="login-rules-mod login-rules-mod-bonus">
          <span className="login-rules-mod-label">Bonus</span>
          <ol className="login-rules-mod-list">
            <li>Haftanın bonus maçına tek türlü tahmin yapılamaz.</li>
            <li>Tahmin doğruysa 4 yerine 6 puan kazanılır.</li>
          </ol>
        </li>
      </ul>

      <p className="login-rules-note">
        Tahminler ilk maçın başlamasına 1 saat kala kilitlenir.
      </p>
    </section>
  );
}
