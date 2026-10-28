import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { AppShell } from "@/components/layout/app-shell";
import { HideNetlifyBadge } from "@/components/layout/hide-netlify-badge";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "12 недель — трекер целей",
  description: "Персональный трекер целей по методике 12 недель в году",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "12 недель" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.variable} ${space.variable} font-sans`}>
        {process.env.NODE_ENV === "development" && (
          <Script src="/chunk-recovery.js" strategy="beforeInteractive" />
        )}
        <AppProviders>
          <HideNetlifyBadge />
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
