import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './app/dispatch/**/*.tsx',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#3a7a2a',
          'green-dark': '#2e6121',
          'green-light': '#4a9636',
          charcoal: '#2d2d2d',
          'charcoal-light': '#3d3d3d',
        },
      },
    },
  },
  plugins: [],
};

export default config;

