import path from "path";
import { fileURLToPath } from "url";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

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
  reactStrictMode: true,
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.plugins.push(new NodePolyfillPlugin());

      config.plugins.push(
        new webpack.ProvidePlugin({
          global: [require.resolve("global"), "default"],
          process: "process/browser",
        }),
      );

      config.plugins.push(
        new webpack.DefinePlugin({
          "global.crypto": "crypto",
          "global.msCrypto": "crypto",
          "global.process": "process",
          "global.Uint8Array": JSON.stringify(Uint8Array),
        }),
      );
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };

      config.resolve.alias = {
        ...config.resolve.alias,
        path: require.resolve("path-browserify"),
        process: require.resolve("process/browser"),
        stream: require.resolve("stream-browserify"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        os: require.resolve("os-browserify/browser"),
      };
    }

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
      topLevelAwait: true,
    };

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
