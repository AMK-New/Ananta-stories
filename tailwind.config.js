/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'Segoe UI',
          'Roboto',
          'Nirmala UI',
          'Mangal',
          'Tunga',
          'Noto Sans Telugu',
          'Noto Sans Devanagari',
          'Noto Sans Kannada',
          'Noto Sans Tamil',
          'Noto Sans Malayalam',
          'Noto Sans Bengali',
          'Noto Sans Gujarati',
          'system-ui',
          'sans-serif'
        ],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      }
    },
  },
  plugins: [],
}
