import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,css}', './src/bookly/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false
  },
  // Prefix all utilities so they don't collide with MUI styles
  // Tailwind v3: use class-based dark mode
  darkMode: ['class'],
  plugins: [require('tailwindcss-logical'), require('./src/@core/tailwind/plugin')],
  theme: {
    extend: {
      colors: {
        // Shadcn/ui-style tokens mapped to existing CSS variables
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        // Add missing tokens used by components
        card: {
          DEFAULT: 'var(--background)',
          foreground: 'var(--foreground)'
        },
        popover: {
          DEFAULT: 'var(--background)',
          foreground: 'var(--foreground)'
        },

        primary: {
          DEFAULT: 'var(--primary-500)',
          foreground: 'var(--primary-foreground)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)'
        },
        secondary: {
          DEFAULT: 'var(--secondary-500)',
          foreground: 'var(--secondary-foreground)'
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)'
        },
        destructive: {
          DEFAULT: 'var(--error-500)',
          foreground: 'var(--destructive-foreground)'
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)'
        }
      },
      fontSize: {
        // Enable utilities like text-h1 ... text-h6
        h1: 'var(--text-h1)',
        h2: 'var(--text-h2)',
        h3: 'var(--text-h3)',
        h4: 'var(--text-h4)',
        h5: 'var(--text-h5)',
        h6: 'var(--text-h6)',
        p: 'var(--text-p)',
        small: 'var(--text-small)'
      }
    }
  }
}

export default config
