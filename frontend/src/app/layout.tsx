import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthTokenProvider } from "@/lib/api/auth-token-provider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Display / headings — bold, slightly condensed grotesque (Bella Vita direction).
// Weights pinned to what's actually used (font-semibold/bold/extrabold on
// headings only) instead of the full variable range — cut ~3 font files
// down to 2 smaller static ones, which was the dominant LCP cost on mobile.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
});

// Body / UI — clean neutral sans. Needs the lighter end too (plain body text).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const title = {
  default: "Birchscents — Inhale and Feel the Difference",
  template: "%s · Birchscents",
};
const description =
  "Ghana's premier luxury home fragrance brand. FDA-approved reed diffusers, room sprays, fragrance oils, and humidifiers — long-lasting, crafted in Accra.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: {
    title: title.default,
    description,
    siteName: "Birchscents",
    locale: "en_GH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: title.default,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AuthTokenProvider />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
