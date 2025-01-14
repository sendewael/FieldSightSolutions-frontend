/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#28CB8B',
        secondary: '#263238',
        tertiary: '#2194f3',
        primary_light: '#A5D6A7',
        primary_dark: '#237D31'
      }
    },
  },
  plugins: [],
};
