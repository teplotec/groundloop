import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#ffffff',
        'paper-2': '#f4f4f2',
        'paper-3': '#ececea',
        ink: '#17191b',
        'ink-70': '#5a5f63',
        'ink-45': '#8b9095',
        graphite: '#17191b',
        signal: '#2fd6a3',
        'signal-2': '#12c7be',
        hair: 'rgba(23,25,27,0.13)',
        'hair-strong': 'rgba(23,25,27,0.26)',
      },
      fontFamily: {
        sans: ['Archivo', 'Helvetica Neue', 'Arial', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      transitionTimingFunction: {
        precise: 'cubic-bezier(0.22,0.61,0.36,1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
