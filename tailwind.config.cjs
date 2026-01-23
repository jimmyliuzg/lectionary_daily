/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cabin', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
      },
      colors: {
        // RCL Lectionary Palette (Powered by CSS Variables in RCLLayout.astro)
        rcl: {
          background: 'var(--rcl-bg)',
          text: 'var(--rcl-text)',
          primary: 'var(--rcl-primary)',
          secondary: 'var(--rcl-secondary)',
          accent: 'var(--rcl-accent)',
        },
      },
    },
  },
  plugins: [],
};
