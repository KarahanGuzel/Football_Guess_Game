import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import type { SessionPlayer } from "@/types/session";

const links = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/standings", label: "Puan Durumu" },
  { href: "/history", label: "Geçmiş" },
  { href: "/fixtures", label: "Gelecek" },
];

export function AppNav({
  player,
  pathname,
}: {
  player: SessionPlayer;
  pathname: string;
}) {
  return (
    <header className="site-header">
      <div
        className="container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          padding: "0.9rem 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link href="/" className="brand">
            Tahmin Ligi
          </Link>
          <span className="muted" style={{ fontSize: "0.85rem" }}>
            {player.displayName}
          </span>
        </div>

        <nav
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.3rem",
            alignItems: "center",
          }}
        >
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link${active ? " nav-link-active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
          {player.isAdmin ? (
            <Link
              href="/admin"
              className={`nav-link${pathname.startsWith("/admin") ? " nav-link-active" : ""}`}
              style={{ color: "var(--accent)", fontWeight: 700 }}
            >
              Yönetim
            </Link>
          ) : null}
          <form action={logoutAction}>
            <button
              className="btn btn-secondary btn-sm"
              type="submit"
            >
              Çıkış
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
