import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './app/dispatch/**/*.tsx',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;

