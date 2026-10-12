import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Ephesis, Montserrat } from "next/font/google";
import "./globals.css";

// Theme 1 fonts, self-hosted by next/font and exposed as CSS variables that
// globals.css maps to font-script, font-sans and font-serif.
const ephesis = Ephesis({ variable: "--font-ephesis", weight: "400", subsets: ["latin"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Our Wedding", template: "%s" },
  description: "Wedding details, RSVP and our story.",
};

export const viewport: Viewport = {
  themeColor: "#F7F3EE",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${ephesis.variable} ${montserrat.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
