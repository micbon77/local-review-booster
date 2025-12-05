import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Local Review Boost - Gestisci le recensioni della tua attività",
  description: "Raccogli feedback positivi e negativi, migliora la tua reputazione online e aumenta le recensioni su Google Maps e Trustpilot.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <SpeedInsights />
        <Script
          src="https://embeds.iubenda.com/widgets/6a4ed737-f1eb-4ae0-a1c0-a6f5cd7a7cd8.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
