/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          500: '#3b82f6',
          700: '#1d4ed8',
        },
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#f8fafc',
          muted: '#f1f5f9',
        },
        ink: {
          DEFAULT: '#0f172a',
          muted: '#475569',
          // 흰색 / #f8fafc 모두에서 4.5:1 이상 보장 (axe color-contrast 위반 방지).
          faint: '#64748b',
        },
        success: '#16a34a',
        danger: '#dc2626',
      },
      borderRadius: { card: '0.75rem' },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.06), 0 4px 12px rgba(15,23,42,.06)',
      },
    },
  },
  plugins: [],
};
