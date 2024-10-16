import sharedPreset from "../shared/tailwind.preset.js";
import formsPlugin from "@tailwindcss/forms";

module.exports = {
  presets: [sharedPreset],
  mode: "jit",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../shared/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "noise-pattern": "url('/images/noise.png')",
        "hero-pattern": "url('/images/hero-background.png')",
      },
    },
  },
  plugins: [
    formsPlugin({
      strategy: "class", // only generate classes
    }),
  ],
};
