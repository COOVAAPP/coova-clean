/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#E6FAFA",
          100: "#CCF5F5",
          200: "#99EBEB",
          300: "#66E1E1",
          400: "#33D7D7",
          500: "#13D4D4", // your main aqua
          600: "#0FAAAA",
          700: "#0B7F7F",
          800: "#075555",
          900: "#042A2A",
        },
      },
    },
  },
  plugins: [],
};