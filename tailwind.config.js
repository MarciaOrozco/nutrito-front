/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4ebe8',
          100: '#e8d3cd',
          200: '#d8b3a9',
          300: '#c79485',
          400: '#b77569',
          500: '#a75d52',
          600: '#8c4c43',
          700: '#703b34',
          800: '#552b26',
          900: '#3a1c18',
        },
        clay: '#a75d52',
        sand: '#f0ece9',
        bone: '#f8f6f3',
        bark: '#4b3c33',
      },
      boxShadow: {
        soft: '0 4px 16px rgba(0, 0, 0, 0.08)',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
};
