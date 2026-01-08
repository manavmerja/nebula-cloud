// IMPORTANT:
// Do NOT prefix color keys with bg-, text-, or border-
// Utilities are generated automatically by Tailwind

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Backgrounds */
        app: 'rgb(var(--bg-app))',
        canvas: 'rgb(var(--bg-canvas))',

        /* Surfaces */
        surface: 'rgb(var(--bg-surface))',
        surfaceElevated: 'rgb(var(--bg-surface-elevated))',

        /* Borders */
        borderSubtle: 'rgb(var(--border-subtle))',

        /* Text */
        textMain: 'rgb(var(--text-main))',
        textMuted: 'rgb(var(--text-muted))',
        textLabel: 'rgb(var(--text-label))',

        /* Primary actions */
        primary: 'rgb(var(--primary))',
        primaryHover: 'rgb(var(--primary-hover))',

        /* AI / Accent */
        accentAI: 'rgb(var(--accent-ai))',
        accentAIAlt: 'rgb(var(--accent-ai-alt))',

        /* Status */
        error: 'rgb(var(--error))',
        warning: 'rgb(var(--warning))',
      },
    },
  },
  plugins: [],
}
