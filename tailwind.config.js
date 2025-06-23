/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'Noto Sans', 'sans-serif'],
      },
      colors: {
        primary: '#0c7ff2',
        secondary: '#60758a',
        dark: '#111418',
        light: '#f0f2f5',
        border: '#dbe0e6',
      }
    },
  },
  plugins: [],
} 