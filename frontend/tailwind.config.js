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
        brand: {
          navy: '#101B2D',
          navyLight: '#16243C',
          navyDark: '#0A121F',
          blue: '#4169E1',
          cyan: '#42D9E8',
          emerald: '#24C78B',
          mint: '#B8F3D5',
          offwhite: '#F7F9FC',
          lavender: '#A78BFA',
          coral: '#FF806B',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s infinite ease-in-out',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'flow-glow': 'flowGlow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(0.98)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        flowGlow: {
          '0%': { filter: 'drop-shadow(0 0 4px rgba(66, 217, 232, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 16px rgba(36, 199, 139, 0.8))' },
        },
      },
    },
  },
  plugins: [],
}
