import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "The Mountain Chapters | Himalayan Stays, Road Trips & Stories",
    template: "%s | The Mountain Chapters",
  },
  description:
    "Curated stays, epic road trips and unforgettable stories from the Himalayas.",
  keywords: [
    "Himalayas",
    "Himachal Pradesh",
    "Spiti Valley",
    "homestay",
    "road trip",
    "Narkanda",
    "Sangla",
    "Kalpa",
    "travel India",
  ],
  openGraph: {
    title: "The Mountain Chapters | Himalayan Stays, Road Trips & Stories",
    description:
      "Curated stays, epic road trips and unforgettable stories from the Himalayas.",
    type: "website",
    locale: "en_IN",
    siteName: "The Mountain Chapters",
  },
  metadataBase: new URL("https://themountainchapters.com"),
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-navy font-sans">
        {children}
      </body>
    </html>
  );
}
