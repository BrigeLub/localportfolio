import type { Metadata } from "next";
import { Fugaz_One, K2D } from "next/font/google";
import "./globals.css";

// Same fonts as the old public/index.html <link>, but self-hosted by Next so
// there's no request to Google and no flash of the fallback font.
const fugaz = Fugaz_One({ weight: "400", subsets: ["latin"], variable: "--font-fugaz" });
const k2d = K2D({ weight: ["300", "400", "500", "700"], subsets: ["latin"], variable: "--font-k2d" });

export const metadata: Metadata = {
  title: "Brigitte Lubker",
  description: "Paintings, pixel art and UI/UX design by Brigitte Lubker.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fugaz.variable} ${k2d.variable}`}>
      <body>{children}</body>
    </html>
  );
}
