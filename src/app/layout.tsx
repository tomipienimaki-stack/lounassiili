import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Lounassiili - Ruoholahden parhaat lounaat",
  description: "Löydä päivän herkullisimmat lounaat Ruoholahdesta, Kangasalta ja keskustasta.",
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
