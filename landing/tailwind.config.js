/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('../shared/tailwind.preset.js')],
  mode: "jit",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // add any landing-specific extensions here
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class", // only generate classes
    }),
  ],
};