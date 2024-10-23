import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yieldi",
  description: "Earn yield on native assets",

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
    title: "Yieldi",
    description: "Earn yield on native assets",
    url: "https://app.yiledi.xyz",
    siteName: "Yieldi",
  },
  appleWebApp: {
    title: "Yieldi",
  },
};
