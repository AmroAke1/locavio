/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#A0522D',
        accent: '#D4A373',
        surface: '#FAF7F2',
        card: '#F5EFE6',
        espresso: '#3D2B1F',
        muted: '#8B7355',
        success: '#4A7C59',
        danger: '#C0392B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
