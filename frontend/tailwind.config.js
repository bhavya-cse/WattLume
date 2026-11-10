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
          navy: '#101B2D',         // Midnight Navy foundation
          offwhite: '#F7F9FC',     // Off-white foundation
          royal: '#4169E1',        // Royal Blue
          blue: '#4169E1',         // Alias
          cyan: '#42D9E8',         // Electric Cyan
          emerald: '#24C78B',      // Fresh Emerald
          mint: '#B8F3D5',         // Soft Mint
          lavender: '#A78BFA',     // Lavender
          coral: '#FF806B',        // Coral
          darkSurface: '#131D2E',  // Apple-like dark surface
          darkElevated: '#1A263C', // Elevated dark card
          darkBorder: 'rgba(255, 255, 255, 0.08)',
          lightBorder: '#E5E9F0',
        },
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glass-light': '0 12px 35px rgba(16, 27, 45, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.85)',
        'glass-dark': '0 16px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'glass-hover-light': '0 20px 45px rgba(16, 27, 45, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'glass-hover-dark': '0 22px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.14)',
        'card-subtle': '0 1px 3px rgba(16, 27, 45, 0.04), 0 4px 12px rgba(16, 27, 45, 0.03)',
      },
      backdropBlur: {
        'glass': '24px',
      },
    },
  },
  plugins: [],
}
