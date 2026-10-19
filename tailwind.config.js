/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // "class" strategy: we toggle the `dark` class on <html> ourselves,
  // so the user's saved choice wins over the OS setting.
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};
