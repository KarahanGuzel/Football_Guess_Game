export function LoginRules() {
  return (
    <section className="login-rules" aria-labelledby="login-rules-title">
      <div className="login-rules-head">
        <h2 id="login-rules-title" className="login-rules-title">
          Nasıl oynanır?
        </h2>
        <p className="login-rules-lead">
          Her maça iki tahmin girersin: sonuç (1 / X / 2) ve Alt-Üst 2.5.
          Haftadaki bütün maçlar dolmadan kaydedilmez. Skorlar girilince
          puanlar yazılır; sezon boyunca sıralama oluşur.
        </p>
      </div>

      <table className="login-score-table">
        <caption className="login-score-caption">Normal maç</caption>
        <thead>
          <tr>
            <th scope="col">İsabet</th>
            <th scope="col">Puan</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sonuç + Alt/Üst</td>
            <td>
              <span className="login-score-pts">4</span>
            </td>
          </tr>
          <tr>
            <td>Yalnız sonuç</td>
            <td>
              <span className="login-score-pts">2</span>
            </td>
          </tr>
          <tr>
            <td>Yalnız Alt/Üst</td>
            <td>
              <span className="login-score-pts">1</span>
            </td>
          </tr>
        </tbody>
      </table>

      <ul className="login-rules-mods">
        <li className="login-rules-mod login-rules-mod-derby">
          <div className="login-rules-mod-copy">
            <span className="login-rules-mod-label">Derbi</span>
            <p>Aynı isabetler ×2 — 8 / 4 / 2</p>
          </div>
        </li>
        <li className="login-rules-mod login-rules-mod-bonus">
          <div className="login-rules-mod-copy">
            <span className="login-rules-mod-label">Bonus</span>
            <p>İkisi doğruysa 6, tek isabet 0. Derbi bonus olamaz.</p>
          </div>
        </li>
      </ul>

      <p className="login-rules-note">
        Tahminler ilk maçın başlamasına 1 saat kala kilitlenir.
      </p>
    </section>
  );
}
