import type { Config } from 'tailwindcss'

/*
 * Bookly Brand Color System
 * Primary: Dark Green #0a2c24 | Navy Blue #202c39 | Off-White #f7f8f9
 * Accents: Coral #e88682 | Sage Green #77b6a3 | Teal #51b4b7
 */

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
      fontFamily: {
        sans: ['var(--font-helvetica-world)', 'Helvetica', 'Arial', 'sans-serif'],
        helvetica: ['var(--font-helvetica-world)', 'Helvetica', 'Arial', 'sans-serif'],
        fira: ['var(--font-fira-code)', 'monospace'],
        mono: ['var(--font-fira-code)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
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

        // Primary - Dark Green based
        primary: {
          DEFAULT: 'var(--primary-800)', // Dark Green #0a2c24
          foreground: '#ffffff',
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
        // Secondary - Navy Blue based
        secondary: {
          DEFAULT: 'var(--secondary-600)', // Navy Blue #202c39
          foreground: '#ffffff',
          100: 'var(--secondary-100)',
          200: 'var(--secondary-200)',
          300: 'var(--secondary-300)',
          400: 'var(--secondary-400)',
          500: 'var(--secondary-500)',
          600: 'var(--secondary-600)',
          700: 'var(--secondary-700)',
          800: 'var(--secondary-800)',
          900: 'var(--secondary-900)'
        },
        // Accent colors - Coral, Sage, Teal
        coral: {
          DEFAULT: 'var(--coral-500)', // #e88682
          100: 'var(--coral-100)',
          200: 'var(--coral-200)',
          300: 'var(--coral-300)',
          400: 'var(--coral-400)',
          500: 'var(--coral-500)',
          600: 'var(--coral-600)',
          700: 'var(--coral-700)',
          800: 'var(--coral-800)',
          900: 'var(--coral-900)'
        },
        sage: {
          DEFAULT: 'var(--sage-500)', // #77b6a3
          100: 'var(--sage-100)',
          200: 'var(--sage-200)',
          300: 'var(--sage-300)',
          400: 'var(--sage-400)',
          500: 'var(--sage-500)',
          600: 'var(--sage-600)',
          700: 'var(--sage-700)',
          800: 'var(--sage-800)',
          900: 'var(--sage-900)'
        },
        teal: {
          DEFAULT: 'var(--teal-500)', // #51b4b7
          100: 'var(--teal-100)',
          200: 'var(--teal-200)',
          300: 'var(--teal-300)',
          400: 'var(--teal-400)',
          500: 'var(--teal-500)',
          600: 'var(--teal-600)',
          700: 'var(--teal-700)',
          800: 'var(--teal-800)',
          900: 'var(--teal-900)'
        },
        accent: {
          DEFAULT: 'var(--sage-500)', // Sage Green as default accent
          foreground: '#ffffff'
        },
        destructive: {
          DEFAULT: 'var(--error-500)',
          foreground: '#ffffff'
        },
        muted: {
          DEFAULT: 'var(--white-600)',
          foreground: 'var(--secondary-500)'
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
