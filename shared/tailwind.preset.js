const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  theme: {
    extend: {
      backgroundImage: {
        "transparent-radial":
          "radial-gradient(circle at 50% 30%, transparent 20%, #FFFFFF 100%)",
        "white-radial":
          "radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.7) 20%, rgba(255, 255, 255, 1) 100%)",
      },
      boxShadow: {
        dropdown: "0px 2px 9.4px 0px rgba(98, 126, 234, 0.19)",
      },
      backdropBlur: { m: "5px", l: "10px", xl: "20px" },
      borderColor: { DEFAULT: "var(--border)" },
      colors: {
        neutral: {
          DEFAULT: "#242628",
          100: "#F5F6F6",
          700: "#585E62",
          800: "#424648",
          900: "#3A3D3F",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        foreground2: "#6D655D",
        primary: { DEFAULT: "#A1FD59", dark: "#332B29", light: "#514a47" },
        secondary: "#F5F1EB",
        accent: { DEFAULT: "#72BACA", dark: "#71bac9" },
        dark: "#003944",
        highlight: "#A1FD59",
        secondaryBtn: "#627EEA",
        border: {
          DEFAULT: "#524B48",
          light: "#6D655D",
        },
        gray: {
          300: "#CED2D3",
          400: "#818A8F",
          700: "#424648",
          900: "#3A3D3F",
        },
      },
      borderRadius: {
        nav: "40px",
        sm: "6px",
        lg: "20px",
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        bold: "700",
      },
      borderRadius: { nav: "40px", large: "20px" },
      fontWeight: { light: "300", normal: "400", medium: "500", bold: "700" },
      fontFamily: {
        sans: ["GT-America", ...defaultTheme.fontFamily.sans],
        mono: ["GT-America-Mono", ...defaultTheme.fontFamily.mono],
        "gt-america": ["GT-America"],
        "gt-america-ext": ["GT-America-Extended"],
        "gt-america-exp": ["GT-America-Expanded"],
      },
      spacing: { 18: "4.5rem", 28: "7rem" },
      maxWidth: { hero: "990px", content: "520px" },
      screens: {
        "mobile-lg": "480px",
        tablet: "768px",
        "desktop-sm": "1024px",
        desktop: "1200px",
      },
      height: {
        m: "512px",
        l: "1024px",
      },
    },
  },
};
