import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 25px 60px rgba(247, 181, 56, 0.14)',
        panel: '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      colors: {
        surface: '#3b0711',
        panel: '#5b0d1d',
        accent: '#f7b538',
        border: '#4c0f18',
        burgundy: {
          950: '#260308',
          900: '#410811',
          800: '#581011',
          700: '#780116',
        },
        gold: {
          DEFAULT: '#f7b538',
          300: '#f8c561',
          200: '#f9d185',
        },
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
