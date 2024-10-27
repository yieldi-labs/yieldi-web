import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yieldi",
  description:
    "The only cross-chain DeFi venue to stake and earn native Bitcoin yield with 15+ supported L1 assets.",
  icons: {
    icon: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "48x48",
        url: "/favicon-48x48.png",
      },
      { rel: "icon", type: "image/svg+xml", url: "/favicon.svg" },
      { rel: "shortcut icon", url: "/favicon.ico" },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        url: "/apple-touch-icon.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Yieldi - The Yield Layer for Cross-Chain",
    description:
      "The only DeFi venue to stake and earn native Bitcoin yield with 15+ supported L1 assets.",
    url: "https://www.yieldi.xyz",
    siteName: "Yieldi",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Yieldi OpenGraph Image",
      },
    ],
  },
  appleWebApp: {
    title: "Yieldi",
  },
};
