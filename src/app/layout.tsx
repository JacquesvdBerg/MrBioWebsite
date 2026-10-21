import type { Metadata } from "next";
import { Bricolage_Grotesque, Outfit } from "next/font/google";
import type { ReactNode } from "react";
import { siteUrl } from "@/lib/site";
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

const description =
  "MnrBio is jou Afrikaanse Lewenswetenskappe-wêreld vir graad 8 tot 12: notas, videolesse, weeklikse speletjies en feite.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MnrBio · Lewenswetenskappe vir graad 8–12",
    template: "%s | MnrBio",
  },
  description,
  applicationName: "MnrBio",
  keywords: [
    "Lewenswetenskappe",
    "Biologie",
    "Afrikaans",
    "CAPS",
    "Natuurwetenskappe",
    "graad 8",
    "graad 9",
    "graad 10",
    "graad 11",
    "graad 12",
    "opsommings",
    "videolesse",
    "vasvra",
    "MnrBio",
  ],
  openGraph: {
    type: "website",
    siteName: "MnrBio",
    locale: "af_ZA",
    title: "MnrBio · Lewenswetenskappe vir graad 8–12",
    description,
    images: [{ url: "/images/brand/springbok.png", width: 640, height: 640, alt: "MnrBio" }],
  },
  twitter: {
    card: "summary",
    title: "MnrBio · Lewenswetenskappe vir graad 8–12",
    description,
    images: ["/images/brand/springbok.png"],
  },
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
