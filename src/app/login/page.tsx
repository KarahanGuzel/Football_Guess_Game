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

      <section className="login-rules" aria-label="Nasıl oynanır">
        <h2 className="login-rules-title">Nasıl oynanır?</h2>
        <p className="login-rules-lead">
          Her hafta maçlara sonuç (1 / X / 2) ve Alt-Üst 2.5 tahmini girersin.
          Skorlar girilince puanlar otomatik hesaplanır; sezon boyunca sıralamada
          yarışırsınız.
        </p>
        <ul className="login-rules-list">
          <li>
            <span className="login-rules-label">Normal</span>
            Sonuç ve Alt/Üst — ikisi doğru 4, biri doğru 2 puan
          </li>
          <li>
            <span className="login-rules-label">Derbi</span>
            Normal puanların 2 katı (maks. 8)
          </li>
          <li>
            <span className="login-rules-label">Bonus</span>
            İkisi de doğruysa 6, aksi halde 0
          </li>
        </ul>
        <p className="login-rules-note">
          Tahminler ilk maç başlayınca kilitlenir. Derbi maç bonus olamaz.
        </p>
      </section>
    </div>
  );
}
