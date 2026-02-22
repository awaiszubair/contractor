/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite reverse',
        'loading-bar': 'loading-bar 2s ease-in-out infinite',
      },
      keyframes: {
        'loading-bar': {
          '0%': { width: '0%', marginLeft: '0%' },
          '50%': { width: '75%', marginLeft: '12.5%' },
          '100%': { width: '0%', marginLeft: '100%' },
        },
      },
    },
  },
  plugins: [],
}