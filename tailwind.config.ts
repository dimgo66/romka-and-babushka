import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Тёплая «семейная» палитра: оранжевый, зелёный, бежевый
        brand: {
          orange: '#E4763C',
          'orange-dark': '#C85C27',
          'orange-soft': '#F6A96B',
          green: '#5F8A5A',
          'green-dark': '#3F6640',
          'green-soft': '#A8C49B',
          beige: '#FBF4E7',
          'beige-dark': '#F1E3CB',
          sand: '#E7D3B3',
          ink: '#3B2E25',
          'ink-soft': '#6B5A4C',
        },
      },
      fontFamily: {
        display: ['Montserrat', 'Segoe UI', 'system-ui', 'sans-serif'],
        body: ['"Open Sans"', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(59, 46, 37, 0.25)',
        soft: '0 6px 18px -10px rgba(59, 46, 37, 0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'float-slow': 'float-slow 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
