import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4C1D95",
          foreground: "#F8FAFC"
        }
      }
    }
  },
  plugins: [],
  safelist: [
    {
      pattern: /rounded-(none|sm|md|lg|xl|2xl|3xl|full)/
    },
    {
      pattern: /space-y-(0|1|2|3|4|5|6)/
    }
  ]
};

export default config;
