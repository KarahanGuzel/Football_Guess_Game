"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { FanFlag } from "@/components/fan-flag";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SessionPlayer } from "@/types/session";

const links = [
  { href: "/", label: "Ana Sayfa", shortLabel: "Ana" },
  { href: "/predictions", label: "Tahminler", shortLabel: "Tahmin" },
  { href: "/standings", label: "Sıralama", shortLabel: "Sıra" },
  { href: "/history", label: "Geçmiş", shortLabel: "Geçmiş" },
  { href: "/fixtures", label: "Gelecek", shortLabel: "Gelecek" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav({ player }: { player: SessionPlayer }) {
  const pathname = usePathname() || "/";

  return (
    <header className="site-header">
      <div className="container nav-inner">
        <div className="nav-brand-block">
          <Link href="/" className="brand">
            Tahmin <span className="brand-accent">Ligi</span>
          </Link>
          <span className="user-pill">
            <FanFlag slug={player.slug} displayName={player.displayName} size={12} />
            <span className="user-pill-name">{player.displayName}</span>
          </span>
        </div>

        <nav className="nav-links" aria-label="Ana menü">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link${active ? " nav-link-active" : ""}`}
              >
                <span className="nav-link-full">{link.label}</span>
                <span className="nav-link-short">{link.shortLabel}</span>
              </Link>
            );
          })}
          {player.isAdmin ? (
            <Link
              href="/admin"
              className={`nav-link${isActive(pathname, "/admin") ? " nav-link-active" : ""}`}
            >
              <span className="nav-link-full">Yönetim</span>
              <span className="nav-link-short">Admin</span>
            </Link>
          ) : null}
          <div className="nav-actions">
            <ThemeToggle />
            <form action={logoutAction}>
              <button className="btn btn-secondary btn-sm nav-logout" type="submit">
                Çıkış
              </button>
            </form>
          </div>
        </nav>
      </div>
    </header>
  );
}
