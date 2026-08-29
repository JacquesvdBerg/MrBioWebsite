import type { Metadata } from "next";
import { Outfit, Sora } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const display = Sora({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const sans = Outfit({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WetenskapWêreld",
    template: "%s | WetenskapWêreld",
  },
  description:
    "Jou alles-in-een plek vir Lewenswetenskappe. Afrikaanse leerplatform vir graad 8 tot 12.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="af"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
