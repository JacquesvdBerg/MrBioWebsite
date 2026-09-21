import type { Metadata } from "next";
import { Bricolage_Grotesque, Outfit } from "next/font/google";
import type { ReactNode } from "react";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const display = Bricolage_Grotesque({
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
    default: "MrBio · Lewenswetenskappe vir graad 8–12",
    template: "%s | MrBio",
  },
  description:
    "MrBio is jou Afrikaanse Lewenswetenskappe-wêreld vir graad 8 tot 12: notas, videolesse, weeklikse speletjies en feite.",
  applicationName: "MrBio",
  keywords: [
    "Lewenswetenskappe",
    "Biologie",
    "Afrikaans",
    "CAPS",
    "graad 10",
    "graad 12",
    "vasvra",
    "MrBio",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="af"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
