/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#332B29",
          light: "#514a47",
        },
        secondary: "#F5F1EB",
        accent: {
          DEFAULT: "#72BACA",
          dark: "#71bac9",
        },
        dark: "#003944",
        highlight: "#A1FD59",
        border: {
          DEFAULT: "#524B48",
          light: "#6D655D",
        },
      },
      fontSize: {
        nav: "16px",
        hero: ["96px", "96px"],
        "hero-mobile": "36px",
        title: ["64px", "60px"],
        "title-desktop": ["64px", "64px"],
        "title-mobile": ["42px", "42px"],
        subtitle: ["48px", "48px"],
        body: ["20px", "24px"],
        "body-large": ["24px", "32px"],
      },
      borderRadius: {
        nav: "40px",
        large: "20px",
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        bold: "700",
      },
      fontFamily: {
        "gt-america": ["GT-America"],
        "gt-america-ext": ["GT-America-Extended"],
      },
      spacing: {
        18: "4.5rem",
        28: "7rem",
      },
      maxWidth: {
        hero: "990px",
        content: "520px",
      },
      screens: {
        "mobile-lg": "400px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class", // only generate classes
    }),
  ],
};
