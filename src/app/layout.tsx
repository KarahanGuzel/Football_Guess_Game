import type { Metadata } from "next";
import { DM_Sans, Sora } from "next/font/google";
import { headers } from "next/headers";
import { AppNav } from "@/components/nav";
import { getCurrentPlayer } from "@/lib/auth/current-user";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
});

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
    <html lang="tr" className={`${sora.variable} ${dmSans.variable}`}>
      <body>
        {player ? <AppNav player={player} pathname={pathname} /> : null}
        <main className="container" style={{ padding: "1.5rem 0 3rem" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
