/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      colors: {
        // RCL Lectionary Palette
        rcl: {
          cream: '#FAF8F5',
          parchment: '#F5F1EB',
          ink: '#1A1A1A',
          night: '#0D0D0D',
          gold: '#B8860B',
          goldLight: '#DAA520',
        },
      },
    },
  },
  plugins: [],
};
