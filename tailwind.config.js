/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#2DD4BF', // Teal 400
          DEFAULT: '#0D9488', // Teal 600
          dark: '#0F766E', // Teal 700
        }
      }
    },
  },
  plugins: [],
}
