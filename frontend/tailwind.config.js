/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Добавляем цвета нашей темы
        primary: '#f8c51c',
        secondary: '#3498db',
        background: '#1a1a2e',
        surface: '#2c3e50',
        accent: '#e74c3c',
        text: {
          primary: '#e0e0e0',
          secondary: '#a0a0a0',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        display: ['Cinzel', 'serif'],
      },
      boxShadow: {
        card: '0 4px 15px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}