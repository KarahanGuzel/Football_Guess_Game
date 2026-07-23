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
    <div style={{ maxWidth: 440, margin: "3.5rem auto" }} className="reveal">
      <header className="page-header" style={{ marginBottom: "1.25rem" }}>
        <h1 className="page-title">Tahmin Ligi</h1>
        <p className="page-sub">Kullanıcı adını seçip giriş yap.</p>
      </header>

      {configError ? (
        <div className="panel" style={{ color: "#ffb4b4" }}>
          <strong>Kurulum gerekli</strong>
          <p style={{ marginBottom: 0 }}>{configError}</p>
        </div>
      ) : (
        <LoginForm players={players} />
      )}
    </div>
  );
}
