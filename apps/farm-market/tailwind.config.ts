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
        display: ["var(--font-fraunces)", "Georgia", "Cambria", "serif"],
      },
      colors: {
        // Warm parchment/market palette — deliberately not black-and-white
        // (Tesla) or neutral chat-gray (ChatGPT).
        canvas: {
          light: "#f7f1e4",
          dark: "#161310",
        },
        surface: {
          light: "#fffcf5",
          dark: "#211c17",
        },
        ink: {
          light: "#2a2118",
          dark: "#f3ead9",
        },
        accent: {
          DEFAULT: "#1e3a5f",
          light: "#2f6690",
          dark: "#7fb7e8",
        },
        moss: {
          DEFAULT: "#4b5320",
          light: "#65722f",
          dark: "#a3b06a",
        },
        line: {
          light: "#e3d8c1",
          dark: "#3a332a",
        },
      },
      borderRadius: {
        xl2: "1.1rem",
        xl3: "1.75rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(42,33,24,0.05), 0 8px 20px rgba(42,33,24,0.08)",
        softDark: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.5)",
        float: "0 12px 30px rgba(42,33,24,0.18), 0 2px 8px rgba(42,33,24,0.1)",
        floatDark: "0 12px 32px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.4)",
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
