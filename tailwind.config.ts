import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 25px 60px rgba(255, 203, 107, 0.14)',
        panel: '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      colors: {
        surface: '#111827',
        panel: '#1f2937',
        accent: '#fbbf24',
        border: '#374151',
      },
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
};

export default config;
