import type { Metadata } from "next";
import { Bodoni_Moda_SC, JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";

const display = Bodoni_Moda_SC({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Along the Way | Mama & Papa",
  description: "A human-centered place for encouragement, listening, prayer, and warm referrals to Mama and Papa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-cream">{children}</body>
    </html>
  );
}
