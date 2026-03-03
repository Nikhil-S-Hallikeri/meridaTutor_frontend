/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#5A6ACF", // The deep blue from your sidebar
        background: "#F4F7FE", // The light gray/blue background
        card: "#FFFFFF",
        success: "#05CD99", // Green badges
        warning: "#FFCE20", // Yellow badges
        danger: "#E65F2B",  // Red badges
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: []
}