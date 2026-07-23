import type { Metadata } from "next";
import { headers } from "next/headers";
import { AppNav } from "@/components/nav";
import { getCurrentPlayer } from "@/lib/auth/current-user";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tahmin Ligi",
  description: "Arkadaşlarla haftalık futbol tahmin oyunu",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const player = await getCurrentPlayer().catch(() => null);
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";

  return (
    <html lang="tr">
      <body>
        {player ? <AppNav player={player} pathname={pathname} /> : null}
        <main className="container" style={{ padding: "1.25rem 0 2.5rem" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
