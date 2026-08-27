/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#05070D',
        surface: {
          DEFAULT: '#07111F',
          subtle: '#0B1020',
          elevated: '#10172A',
          overlay: '#17102D',
        },
        accent: {
          violet: '#8B5CF6',
          'violet-glow': '#A78BFA',
          blue: '#3B82F6',
          'blue-glow': '#60A5FA',
          cyan: '#06B6D4',
          'cyan-glow': '#22D3EE',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.06)',
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          glow: 'rgba(96, 165, 250, 0.25)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'Geist Mono',
          'JetBrains Mono',
          'Fira Code',
          'monospace',
        ],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.3)',
        'glow-violet': '0 0 20px -3px rgba(139, 92, 246, 0.3)',
        'glow-blue': '0 0 20px -3px rgba(59, 130, 246, 0.3)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.7)',
        'node-active': '0 0 16px 1px rgba(6, 182, 212, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-line': 'glowLine 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glowLine: {
          '0%': { opacity: '0.4', filter: 'drop-shadow(0 0 2px rgba(6, 182, 212, 0.4))' },
          '100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.8))' },
        },
      },
    },
  },
  plugins: [],
}
