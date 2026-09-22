import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { headers } from "next/headers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, ROBOTS_METADATA } from "@/config/site";
import { defaultLocale, isValidLocale } from "@/i18n/config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "fr_FR",
    type: "website",
  },
  robots: ROBOTS_METADATA,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const headerLocale = headerList.get("x-locale");
  const lang =
    headerLocale && isValidLocale(headerLocale) ? headerLocale : defaultLocale;

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${inter.variable} ${cormorant.variable}`}
    >
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen flex flex-col font-sans bg-[var(--bg-primary)] text-[var(--text-primary)]"
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
