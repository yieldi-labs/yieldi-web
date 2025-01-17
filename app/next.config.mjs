import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        port: "",
        pathname: "**",
      },
    ],
  },
  eslint: {
    dirs: ["app", "utils", "hooks", "types", "infura", "ctrl"], // Agrega las carpetas que deseas analizar
  },
  reactStrictMode: true,
  webpack: (config) => {
    // Ensure shared folder is transpiled
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      include: [path.resolve(__dirname, "../shared")],
      use: [
        {
          loader: "babel-loader",
          options: {
            presets: ["next/babel"],
          },
        },
      ],
    });

    return config;
  },
  redirects() {
    return [
      {
        source: "/",
        destination: "/explore",
        permanent: false,
      },
      {
        source: "/explore",
        destination: "/explore/pools",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
