/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e5ebe5',
          200: '#cbd7cb',
          300: '#a7bda7',
          400: '#7f9e80',
          500: '#608261',
          600: '#4b674c',
          700: '#3c523d',
          800: '#334334',
          900: '#2b382c',
        },
        earth: {
          50: '#faf7f2',
          100: '#f2ede2',
          200: '#e5d9c3',
          300: '#d4c0a0',
          400: '#c0a27c',
          500: '#ac8a60',
          600: '#9b7553',
          700: '#7f5d44',
          800: '#674c3b',
          900: '#553f33',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
