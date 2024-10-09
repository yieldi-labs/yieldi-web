import type { Config } from "tailwindcss";

const config: Config = {
  presets: [require('../shared/tailwind.preset.js')],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // You can add any app-specific extensions here
    },
  },
  plugins: [],
};

export default config;