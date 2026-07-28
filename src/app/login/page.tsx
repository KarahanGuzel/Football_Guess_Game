import { LoginForm } from "@/components/login-form";
import { listActivePlayers } from "@/lib/data";

/** Classic black-and-white football, sized via em to match the brand font. */
function FootballIcon() {
  return (
    <svg
      className="login-brand-ball"
      viewBox="0 0 64 64"
      width="1em"
      height="1em"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="29" className="login-brand-ball-skin" />

      {/* Center black pentagon */}
      <path
        className="login-brand-ball-patch"
        d="M32 20.5 39.2 25.7 36.5 34.2H27.5L24.8 25.7Z"
      />

      {/* White hex ring seams around center */}
      <path
        className="login-brand-ball-seam"
        d="M32 20.5 39.2 25.7 36.5 34.2 32 38.2 27.5 34.2 24.8 25.7Z"
      />

      {/* Rays to outer patches */}
      <path
        className="login-brand-ball-seam"
        d="M32 20.5V8.5M39.2 25.7l9.3-5.8M36.5 34.2l7.4 10.6M27.5 34.2 20.1 44.8M24.8 25.7l-9.3-5.8"
      />

      {/* Outer black pentagon tips */}
      <path className="login-brand-ball-patch" d="M32 8.5 37.4 12.4 32 15.8 26.6 12.4Z" />
      <path
        className="login-brand-ball-patch"
        d="m48.5 19.9 2.9 7.8-5.2 3.4-2.1-6.8Z"
      />
      <path
        className="login-brand-ball-patch"
        d="m43.9 44.8 1.9 7.2-6.8 2.9-2.3-5.8Z"
      />
      <path
        className="login-brand-ball-patch"
        d="m20.1 44.8-1.9 7.2 6.8 2.9 2.3-5.8Z"
      />
      <path
        className="login-brand-ball-patch"
        d="M15.5 19.9 12.6 27.7l5.2 3.4 2.1-6.8Z"
      />

      {/* Soft equator seams for roundness */}
      <path
        className="login-brand-ball-seam"
        d="M12.6 27.7 20.1 44.8M51.4 27.7 43.9 44.8M15.5 19.9 26.6 12.4M48.5 19.9 37.4 12.4"
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
