import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        canvas: {
          light: "#f7f7f5",
          dark: "#0b0c0d",
        },
        surface: {
          light: "#ffffff",
          dark: "#141516",
        },
        ink: {
          light: "#111214",
          dark: "#f2f2f0",
        },
        accent: {
          DEFAULT: "#2f6d3e",
          light: "#3f8c52",
          dark: "#1f4c2b",
        },
        line: {
          light: "#e6e5e1",
          dark: "#262728",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
        softDark: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.5)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        fadeUp: "fadeUp 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
