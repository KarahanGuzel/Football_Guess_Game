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
    <div style={{ maxWidth: 480, margin: "2rem auto" }}>
      <h1 className="page-title">Tahmin Ligi</h1>
      <p className="page-sub">Kullanıcı adını seçip giriş yap.</p>

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
