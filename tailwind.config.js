/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Primary colors
    'bg-primary-tomato',
    'bg-primary-darkTomato',
    'bg-primary-lightTomato',
    'text-primary-tomato',
    'text-primary-darkTomato',
    'text-primary-lightTomato',
    'hover:bg-primary-tomato',
    'hover:bg-primary-darkTomato',
    'hover:bg-primary-lightTomato',
    'hover:text-primary-tomato',
    'hover:text-primary-darkTomato',
    'hover:text-primary-lightTomato',
    'dark:text-primary-tomato',
    'dark:text-primary-lightTomato',
    'dark:hover:text-primary-tomato',
    'dark:hover:text-primary-lightTomato',
    
    // Secondary colors
    'bg-secondary-green',
    'bg-secondary-darkGreen',
    'bg-secondary-lightGreen',
    'text-secondary-green',
    'text-secondary-darkGreen',
    'text-secondary-lightGreen',
    'hover:bg-secondary-green',
    'hover:bg-secondary-darkGreen',
    'hover:bg-secondary-lightGreen',
    'hover:text-secondary-green',
    'hover:text-secondary-darkGreen',
    'hover:text-secondary-lightGreen',
    'dark:text-secondary-green',
    'dark:text-secondary-lightGreen',
    'dark:hover:text-secondary-green',
    'dark:hover:text-secondary-lightGreen',
    
    // Background colors
    'bg-background-light',
    'bg-background-dark',
    'dark:bg-background-dark',
    
    // Text colors
    'text-text-light',
    'text-text-dark',
    'dark:text-text-dark',
    
    // Card colors
    'bg-card-light',
    'bg-card-dark',
    'text-card-light',
    'text-card-dark',
    'dark:bg-card-dark',
    'dark:text-card-light',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          tomato: "#FF6347",
          darkTomato: "#E5352B",
          lightTomato: "#FF8C7C",
        },
        secondary: {
          green: "#4CAF50",
          darkGreen: "#3D8C40",
          lightGreen: "#7BC67F",
        },
        background: {
          light: "#FFFAF0",
          dark: "#121212",
        },
        text: {
          light: "#333333",
          dark: "#F3F4F6",
        },
        card: {
          light: "#FFFFFF",
          dark: "#1F2937",
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      },
    },
  },
  plugins: [],
} 