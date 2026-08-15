/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1120",
        surface: "#0F1729",
        panel: "#141F38",
        line: "#22314F",
        accent: {
          DEFAULT: "#22D3A8",
          soft: "#0E3B31",
        },
        warn: "#F2B84B",
        danger: "#F16565",
        muted: "#7C8AA8",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(34, 211, 168, 0.15)",
      },
    },
  },
  plugins: [],
};
