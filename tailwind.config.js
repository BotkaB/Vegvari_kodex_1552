/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Eredeti színeid
        ink: "#0f172a",
        ember: "#f59e0b",
        steel: "#cbd5e1",
        mist: "#e2e8f0",
        
        // Várfal és kő textúra árnyalatok
        castle: {
          dark: "#16181d",    // Legmélyebb háttér (várudvar éjjel)
          base: "#1a1c23",    // Alap kőfal (pl. Header)
          light: "#1f222b",   // Kiemelt kártyák (pergamen tartók)
          border: "#3a3f4d",  // Kőillesztések, peremek
        }
      },
      boxShadow: {
        // Kicsit tüzesebb, fáklyafényes / mély kő árnyék
        glow: "0 0 0 1px rgba(245, 158, 11, 0.15), 0 25px 40px rgba(15, 23, 42, 0.6)",
        inner_stone: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [],
};