/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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