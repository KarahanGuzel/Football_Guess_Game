import Image from "next/image";
import { LoginForm } from "@/components/login-form";
import { listActivePlayers } from "@/lib/data";

export default async function LoginPage() {
  let players: Awaited<ReturnType<typeof listActivePlayers>> = [];
  let configError: string | null = null;

  try {
    players = await listActivePlayers();
  } catch (error) {
    configError =
      error instanceof Error
        ? error.message
        : "Veritabanına bağlanılamadı. Ortam değişkenlerini kontrol et.";
  }

  return (
    <div className="login-page reveal">
      <header className="login-hero">
        <h1 className="login-brand">
          Tahmin <span className="brand-accent">Ligi</span>
          <Image
            className="login-brand-ball"
            src="/football-ball.png"
            alt=""
            width={64}
            height={64}
            priority
            unoptimized
            aria-hidden="true"
          />
        </h1>
        <p className="login-sub login-sub-mark">A Mezegang Product</p>
      </header>

      {configError ? (
        <div className="panel login-error-panel">
          <strong>Kurulum gerekli</strong>
          <p style={{ marginBottom: 0 }}>{configError}</p>
        </div>
      ) : players.length === 0 ? (
        <div className="panel muted">Henüz aktif oyuncu yok.</div>
      ) : (
        <LoginForm players={players} />
      )}

      <section className="panel login-rules" aria-label="Nasıl oynanır">
        <div className="login-rules-head">
          <h2 className="login-rules-title">Nasıl oynanır?</h2>
          <p className="login-rules-lead">
            Her hafta maçlara sonuç (1 / X / 2) ve Alt-Üst 2.5 tahmini gir.
            Skorlar girilince puanlar hesaplanır; sezon sıralamasında yarışırsınız.
          </p>
        </div>

        <ul className="login-rules-list">
          <li className="login-rules-row">
            <div className="login-rules-row-main">
              <span className="login-rules-label">Normal</span>
              <span className="login-rules-copy">
                Sonuç + Alt/Üst — ikisi doğruysa 4, biri doğruysa 2 puan
              </span>
            </div>
            <span className="login-rules-points" aria-hidden="true">
              4 / 2
            </span>
          </li>
          <li className="login-rules-row">
            <div className="login-rules-row-main">
              <span className="login-rules-label">Derbi</span>
              <span className="login-rules-copy">
                Normal puanların 2 katı
              </span>
            </div>
            <span className="login-rules-points" aria-hidden="true">
              ×2
            </span>
          </li>
          <li className="login-rules-row">
            <div className="login-rules-row-main">
              <span className="login-rules-label">Bonus</span>
              <span className="login-rules-copy">
                İkisi doğruysa 6, aksi halde 0
              </span>
            </div>
            <span className="login-rules-points" aria-hidden="true">
              6 / 0
            </span>
          </li>
        </ul>

        <p className="login-rules-note">
          Tahminler ilk maç başlayınca kilitlenir · Derbi maç bonus olamaz
        </p>
      </section>
    </div>
  );
}
