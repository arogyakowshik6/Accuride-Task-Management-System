/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1B2430",
          soft: "#2C3745",
        },
        fog: "#EDF0EF",
        paper: "#FBFAF7",
        amber: {
          DEFAULT: "#E2A63B",
          dark: "#C48A24",
          light: "#F6E4BE",
        },
        slate: {
          DEFAULT: "#6B7280",
        },
        moss: "#4C7A5E",
        rust: "#B4483A",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
