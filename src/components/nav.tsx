import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import type { SessionPlayer } from "@/types/session";

const links = [
  { href: "/", label: "Bu Hafta" },
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
    <header
      style={{
        borderBottom: "1px solid var(--line)",
        background: "color-mix(in srgb, var(--bg) 85%, black)",
        position: "sticky",
        top: 0,
        zIndex: 20,
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          padding: "0.85rem 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link href="/" style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
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
            gap: "0.35rem",
            alignItems: "center",
          }}
        >
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "0.4rem 0.7rem",
                  borderRadius: 999,
                  background: active ? "var(--bg-soft)" : "transparent",
                  border: active ? "1px solid var(--line)" : "1px solid transparent",
                  fontSize: "0.9rem",
                  fontWeight: active ? 700 : 500,
                }}
              >
                {link.label}
              </Link>
            );
          })}
          {player.isAdmin ? (
            <Link
              href="/admin"
              style={{
                padding: "0.4rem 0.7rem",
                borderRadius: 999,
                background:
                  pathname.startsWith("/admin") ? "var(--bg-soft)" : "transparent",
                border: pathname.startsWith("/admin")
                  ? "1px solid var(--line)"
                  : "1px solid transparent",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              Yönetim
            </Link>
          ) : null}
          <form action={logoutAction}>
            <button className="btn btn-secondary" type="submit" style={{ padding: "0.4rem 0.7rem" }}>
              Çıkış
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
