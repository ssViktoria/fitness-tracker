/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#22C55E", dark: "#16A34A" },
        accent: "#F97316",
        background: { DEFAULT: "#F8FAFC", dark: "#0F172A" },
        surface: { DEFAULT: "#FFFFFF", dark: "#1E293B" },
        text: { DEFAULT: "#0F172A", dark: "#F1F5F9", muted: "#64748B" },
        danger: "#EF4444",
      },
      spacing: { 18: "4.5rem" },
      borderRadius: { card: "16px" },
    },
  },
  plugins: [],
};