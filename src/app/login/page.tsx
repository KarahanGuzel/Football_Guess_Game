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
        <p className="login-kicker">Haftalık tahmin</p>
        <h1 className="login-brand">
          Tahmin <span className="brand-accent">Ligi</span>
        </h1>
        <p className="login-sub">Arkadaşlarınla skor tut, sıralamada yüksel.</p>
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
    </div>
  );
}
