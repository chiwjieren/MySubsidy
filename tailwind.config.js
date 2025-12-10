/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
        colors: {
            primary: '#5b50e6', 
            secondary: '#Dbf26e', // Updated to Lime from dashboard
        }
    },
  },
  plugins: [],
}
