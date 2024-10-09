import type { Config } from "tailwindcss";

import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: "var(--border)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        foreground2: "#6D655D",
        primary: "#A1FD59",
      },
    },
    fontFamily: {
      'sans': ['GT-America', ...defaultTheme.fontFamily.sans],
      'mono': ['GT-America-Mono', ...defaultTheme.fontFamily.mono],
    },
  },
  plugins: [],
};
export default config;
