/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:           '#0F1117',
        surface:      '#1A1D2E',
        'surface-2':  '#212540',
        border:       '#2D3150',
        accent:       '#4F46E5',
        'accent-h':   '#4338CA',
        'accent-light':'#818CF8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
