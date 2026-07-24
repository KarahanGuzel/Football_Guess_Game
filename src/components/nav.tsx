"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { FanFlag } from "@/components/fan-flag";
import type { SessionPlayer } from "@/types/session";

const links = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/standings", label: "Puan Durumu" },
  { href: "/history", label: "Geçmiş" },
  { href: "/fixtures", label: "Gelecek" },
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
            {player.displayName}
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
                {link.label}
              </Link>
            );
          })}
          {player.isAdmin ? (
            <Link
              href="/admin"
              className={`nav-link${isActive(pathname, "/admin") ? " nav-link-active" : ""}`}
            >
              Yönetim
            </Link>
          ) : null}
          <form action={logoutAction}>
            <button className="btn btn-secondary btn-sm" type="submit">
              Çıkış
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
