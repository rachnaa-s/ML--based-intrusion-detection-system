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
        cyber: {
          darkest: '#060a12',
          darker: '#0a101f',
          dark: '#0f172a',
          surface: '#131e36',
          card: '#16223f',
          border: '#1f3056',
          muted: '#627d98',
          accent: '#00ff88',
          emerald: '#10b981',
          teal: '#14b8a6',
          cyan: '#06b6d4',
          alert: '#ef4444',
          warning: '#f59e0b',
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
        'glow-red': '0 0 20px -5px rgba(239, 68, 68, 0.4)',
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.4)',
      }
    },
  },
  plugins: [],
}
