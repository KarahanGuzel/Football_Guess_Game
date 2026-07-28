import { LoginForm } from "@/components/login-form";
import { listActivePlayers } from "@/lib/data";

function FootballIcon() {
  return (
    <svg
      className="login-brand-ball"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      aria-hidden="true"
      fill="none"
    >
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 6.2 14.6 8.1 13.7 11.1h-3.4L9.4 8.1 12 6.2Z"
        fill="currentColor"
        opacity="0.92"
      />
      <path
        d="M8.15 9.05 6.4 11.4l1.35 3.05 2.85-.2.9-3.15-1.85-2.05ZM15.85 9.05l1.75 2.35-1.35 3.05-2.85-.2-.9-3.15 1.85-2.05ZM9.55 15.05l-.55 2.85L12 19.3l3-.1.55-2.85-2.95-.25-3.05.25Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M12 6.2 14.6 8.1 13.7 11.1h-3.4L9.4 8.1 12 6.2Zm-3.85 2.85L6.4 11.4l1.35 3.05 2.85-.2.9-3.15-1.85-2.05Zm7.7 0 1.75 2.35-1.35 3.05-2.85-.2-.9-3.15 1.85-2.05ZM9.55 15.05l-.55 2.85L12 19.3l3-.1.55-2.85-2.95-.25Z"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
          <FootballIcon />
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
    </div>
  );
}
