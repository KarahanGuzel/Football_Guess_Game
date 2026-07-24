import type { Metadata } from "next";
import { DM_Sans, Sora } from "next/font/google";
import { AppNav } from "@/components/nav";
import { themeInitScript } from "@/components/theme-toggle";
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

  return (
    <html lang="tr" className={`${sora.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {player ? <AppNav player={player} /> : null}
        <main className="container page-shell">{children}</main>
      </body>
    </html>
  );
}
