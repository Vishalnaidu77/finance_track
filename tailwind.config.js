/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./test.html",
      "./dashboard.html",
      "./chart.js",
      "./dashboard.js",
      "./Css/style.css"
    ],
    theme: {
      extend: {
        colors: {
          // your optional custom colors
          primary: "#1E40AF",
          secondary: "#9333EA",
        },
        fontFamily: {
          sans: ["Inter", "sans-serif"],
        },
      },
    },
    plugins: [],
  }
  