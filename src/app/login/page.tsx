import Image from "next/image";
import { LoginForm } from "@/components/login-form";
import { LoginRules } from "@/components/login-rules";
import { ThemeToggle } from "@/components/theme-toggle";
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
        <div className="login-hero-main">
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
        </div>
        <div className="login-toolbar">
          <ThemeToggle />
        </div>
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

      <LoginRules />
    </div>
  );
}
