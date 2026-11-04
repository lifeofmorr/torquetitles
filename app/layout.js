import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { SITE } from "../lib/data";

export const metadata = {
  metadataBase: new URL(SITE.baseUrl),
  title: {
    default: "TorqueTitles — Vehicle Titles & Registration Filings",
    template: "%s",
  },
  description:
    "TorqueTitles prepares and files vehicle title and registration paperwork — conversions, lost titles, estates, rebuilt vehicles. Published prices, a six-question eligibility screen before payment, and a full refund until your filing is submitted.",
  icons: {
    icon: "/assets/logo.svg",
    apple: "/assets/logo.svg",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport = { themeColor: SITE.themeColor };

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* §9: hidden reveal states are opt-in via js-ent, added before
            paint — no-JS still renders everything. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js-ent')",
          }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
