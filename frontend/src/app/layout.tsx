import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Display / headings — bold, slightly condensed grotesque (Bella Vita direction).
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

// Body / UI — clean neutral sans.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Birchscents — Inhale and Feel the Difference",
    template: "%s · Birchscents",
  },
  description:
    "Ghana's premier luxury home fragrance brand. FDA-approved reed diffusers, room sprays, fragrance oils, and humidifiers — long-lasting, crafted in Accra.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
