/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#0195f7',
        'custom-blue-hover': '#0284d1',
        'custom-blue-light': '#38bdf8',
        'custom-blue-dark': '#0369a1',
      },
    },
  },
  plugins: [],
};