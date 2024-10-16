const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  theme: {
    extend: {
      backgroundImage: {
        "nav-radial":
          "radial-gradient(circle at 80% 30%, transparent 20%, #FFFFFF 90%)",
      },
      backdropBlur: { m: "5px", l: "10px", xl: "20px" },
      borderColor: { DEFAULT: "var(--border)" },
      colors: {
        neutral: { DEFAULT: "#3A3D3F", black: "#242628" },
        background: "var(--background)",
        foreground: "var(--foreground)",
        foreground2: "#6D655D",
        primary: { DEFAULT: "#A1FD59", dark: "#332B29", light: "#514a47" },
        secondary: "#F5F1EB",
        accent: { DEFAULT: "#72BACA", dark: "#71bac9" },
        dark: "#003944",
        highlight: "#A1FD59",
        border: { DEFAULT: "#524B48", light: "#6D655D" },
      },
      borderRadius: { nav: "40px", large: "20px" },
      fontWeight: { light: "300", normal: "400", medium: "500", bold: "700" },
      fontFamily: {
        sans: ["GT-America", ...defaultTheme.fontFamily.sans],
        mono: ["GT-America-Mono", ...defaultTheme.fontFamily.mono],
        "gt-america": ["GT-America"],
        "gt-america-ext": ["GT-America-Extended"],
      },
      spacing: { 18: "4.5rem", 28: "7rem" },
      maxWidth: { hero: "990px", content: "520px" },
      screens: { "mobile-lg": "480px", tablet: "768px", desktop: "1200px" },
      height: {
        m: "512px",
        l: "1024px",
      },
    },
  },
};
