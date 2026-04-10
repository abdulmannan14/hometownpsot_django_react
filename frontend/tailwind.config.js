/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        magenta: '#ff00e0',
        'magenta-alt': '#f01572',
        purple: '#6600ff',
        dark: {
          DEFAULT: '#191919',
          header: '#0a0a0a',
          card: '#252525',
          secondary: '#1d191e',
        },
      },
    },
  },
  plugins: [],
};
