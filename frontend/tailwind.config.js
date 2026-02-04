/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'pos-primary': '#FF6B6B',
        'pos-secondary': '#4ECDC4',
        'pos-dark': '#1A1A2E',
        'pos-light': '#F7F7F7',
      },
      fontSize: {
        'display-lg': '4rem',
        'display-md': '2rem',
        'display-sm': '1.25rem',
      },
    },
  },
  plugins: [],
};
