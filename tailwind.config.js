/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        ember: {
          400: "#fbbf24",
          DEFAULT: "#f59e0b",
        },
        orange: {
          600: "#ea580c",
        },
        stone: {
          100: "#f5f5f4",
          300: "#d6d3d1",
          950: "#0c0a09",
        },
        steel: "#cbd5e1",
        mist: "#e2e8f0",

        castle: {
          dark: "#16181d",
          base: "#1a1c23",
          light: "#1f222b",
          border: "#3a3f4d",
          input: "#14161b",
        },
        // Szemantikus aliasok a projekt egységesítéséhez
        status: {
          error: "#ef4444",
          success: "#22c55e",
          info: "#06b6d4",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(245, 158, 11, 0.15), 0 25px 40px rgba(15, 23, 42, 0.6)",
        inner_stone: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [],
};