import { DefaultSeoProps } from "next-seo";

const config: DefaultSeoProps = {
  title: "Yieldi",
  description:
    "The only cross-chain DeFi venue to stake and earn native Bitcoin yield with 15+ supported L1 assets.",
  openGraph: {
    title: "Yieldi - The Yield Layer for Cross-Chain",
    description:
      "The only DeFi venue to stake and earn native Bitcoin yield with 15+ supported L1 assets.",
    url: "https://www.yieldi.xyz",
    site_name: "Yieldi",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Yieldi OpenGraph Image",
      },
    ],
  },
  twitter: {
    handle: "@yieldi_xyz",
    site: "https://www.yieldi.xyz",
    cardType: "summary_large_image",
  },
  additionalLinkTags: [
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon-48x48.png",
      sizes: "48x48",
    },
    {
      rel: "icon",
      type: "image/svg+xml",
      href: "/favicon.svg",
    },
    {
      rel: "shortcut icon",
      href: "/favicon.ico",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "manifest",
      href: "/site.webmanifest",
    },
  ],
  additionalMetaTags: [
    {
      name: "apple-mobile-web-app-title",
      content: "Yieldi",
    },
  ],
};

export default config;
