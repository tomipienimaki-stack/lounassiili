import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "🦔 Lounassiili — päivän lounaat",
  description: "Löydä päivän herkullisimmat lounaat Ruoholahdesta, Kangasalta, keskustasta ja Hämeenlinnasta.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi" className={`${outfit.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
