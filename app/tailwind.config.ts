import type { Config } from "tailwindcss";
import sharedPreset from "../shared/tailwind.preset.js";

const config: Config = {
  presets: [sharedPreset],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../shared/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // You can add any app-specific extensions here
    },
  },
  plugins: [],
};

export default config;
