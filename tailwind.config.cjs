/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['Courier Prime', 'monospace'
        ],
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'
        ],
        serif: ['Lora', 'Georgia', 'Times New Roman', 'serif'
        ],
      },
      colors: {
        // Light mode colors (white background, black text)
        light: {
          bg: '#FFFFFF',
          text: '#000000',
        },
        // Dark mode colors (black background, white text)
        dark: {
          bg: '#000000',
          text: '#FFFFFF',
        },
        // Link color (blue for light mode, white for dark mode)
        link: {
          DEFAULT: '#0066CC', // Blue for light mode
          dark: '#FFFFFF', // White for dark mode
        },
        // Racefinder Maximalist Palette (Updated)
        racefinder: {
          cyan: '#13F0FF',
          yellow: '#F0FF13',
          magenta: '#FF13F0',
          white: '#FFFFFF',
          black: '#000000',
        },
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
