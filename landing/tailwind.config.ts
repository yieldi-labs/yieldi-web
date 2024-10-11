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
      // add any landing-specific extensions here
    },
  },
  plugins: [
    formsPlugin({
      strategy: "class", // only generate classes
    }),
  ],
};
