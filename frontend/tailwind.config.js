// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Основная цветовая схема игры
        primary: '#f8c51c', // Золотой для акцентов
        secondary: '#3498db', // Синий для кнопок и интерактивных элементов
        accent: '#e74c3c', // Красный для ошибок и предупреждений
        background: '#1a1a2e', // Темно-синий фон
        surface: '#2c3e50', // Темно-синий для карточек и контейнеров
        text: {
          'primary': '#e0e0e0', // Светлый текст для темного фона
          'secondary': '#a0a0a0', // Серый текст для второстепенной информации
        },
        faction: {
          'avrelia': '#4a69bd', // Синий для фракции Аврелия
          'inferno': '#c23616', // Красный для фракции Инферно
        },
        class: {
          'warrior': '#e1b12c', // Оранжевый для воинов
          'mage': '#0652DD', // Синий для магов
          'rogue': '#009432', // Зеленый для разбойников
          'priest': '#D980FA', // Фиолетовый для жрецов
        },
        // Состояния
        'success': '#2ecc71',
        'warning': '#f39c12',
        'danger': '#e74c3c',
        'info': '#3498db',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        display: ['Cinzel', 'serif'], // Декоративный шрифт для заголовков
        mono: ['Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 4px 15px rgba(0, 0, 0, 0.3)',
        'button': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'hover': '0 10px 15px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'hero-pattern': "url('/assets/img/hero-bg.jpg')",
        'card-pattern': "url('/assets/img/card-bg.png')",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}