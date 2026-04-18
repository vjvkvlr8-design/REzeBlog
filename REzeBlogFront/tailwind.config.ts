import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Discord Dark Theme
        discord: {
          100: '#f2f3f5',
          200: '#e3e5e8',
          300: '#d4d7dc',
          400: '#a3a6aa',
          500: '#8e9297',
          600: '#72767d',
          700: '#5c6067',
          800: '#40444b',
          900: '#36393f',
          950: '#2f3136',
          1000: '#202225',
          1100: '#18191c',
          1200: '#141517',
          brand: '#5865F2',
          green: '#3ba55d',
          yellow: '#faa81a',
          red: '#ed4245',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans KR', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
