import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Inter",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        ink: "#171a20",
        smoke: "#f4f4f4",
        muted: "#5c5e62",
      },
      letterSpacing: {
        tesla: "0.02em",
      },
      maxWidth: {
        rail: "1400px",
      },
      transitionTimingFunction: {
        tesla: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
