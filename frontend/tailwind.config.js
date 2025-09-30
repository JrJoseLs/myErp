/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',
        secondary: '#64748b',
        accent: '#f59e0b',
      },
    },
  },
  plugins: [],
};