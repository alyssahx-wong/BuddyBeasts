/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pixel-purple': '#4A3B8C',
        'pixel-pink': '#FF6B9D',
        'pixel-blue': '#5B9BFF',
        'pixel-green': '#4ECDC4',
        'pixel-yellow': '#FFE66D',
        'pixel-dark': '#1A1A2E',
        'pixel-light': '#F7F7F7'
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive'],
        'game': ['"VT323"', 'monospace'],
        'cute': ['"Silkscreen"', 'cursive']
      }
    },
  },
  plugins: [],
}
