const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  theme: {
    extend: {
      borderColor: {
        DEFAULT: "var(--border)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        foreground2: "#6D655D",
        primary: {
          DEFAULT: "#A1FD59",
          dark: "#332B29",
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
        'sans': ['GT-America', ...defaultTheme.fontFamily.sans],
        'mono': ['GT-America-Mono', ...defaultTheme.fontFamily.mono],
        "gt-america": ["GT-America"],
        "gt-america-ext": ["GT-America-Extended"],
        "gt-america-exp": ["GT-America-Expanded"],
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
};