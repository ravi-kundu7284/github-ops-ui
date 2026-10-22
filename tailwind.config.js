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
        github: {
          dark: '#0d1117',
          darker: '#010409',
          border: '#30363d',
          card: '#161b22',
          hover: '#21262d',
          text: '#c9d1d9',
          muted: '#8b949e',
          accent: '#2f81f7',
          success: '#238636',
          danger: '#da3633',
          warning: '#d29922',
          purple: '#8957e5',
        }
      }
    },
  },
  plugins: [],
}
