import plugin from 'tailwindcss/plugin'

module.exports = plugin(function () {}, {
  theme: {
    borderColor: ({ theme }) => ({
      ...theme('colors'),
      DEFAULT: 'var(--border-color, currentColor)'
    }),
    borderRadius: {
      none: '0px',
      xs: 'var(--mui-shape-customBorderRadius-xs, 0.125rem)',
      sm: 'var(--mui-shape-customBorderRadius-sm, 0.25rem)',
      DEFAULT: '0.625rem',
      md: 'var(--mui-shape-customBorderRadius-md, 0.375rem)',
      lg: 'var(--mui-shape-customBorderRadius-lg, 0.5rem)',
      xl: 'var(--mui-shape-customBorderRadius-xl, 0.75rem)',
      '2xl': '0.75rem',
      '3xl': '1rem',
      '4xl': '1.5rem',
      full: '9999px'
    },
    screens: {
      sm: '600px',
      md: '900px',
      lg: '1200px',
      xl: '1536px',
      '2xl': '1920px'
    },
    extend: {
      boxShadow: {
        // Provide fallbacks when MUI CSS variables are absent
        xs: 'var(--mui-customShadows-xs, 0 1px 1px 0 rgb(0 0 0 / 0.04))',
        sm: 'var(--mui-customShadows-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05))',
        DEFAULT: 'var(--mui-customShadows-md, 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1))',
        md: 'var(--mui-customShadows-md, 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1))',
        lg: 'var(--mui-customShadows-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1))',
        xl: 'var(--mui-customShadows-xl, 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1))'
      },
      colors: {
        // Add reasonable fallbacks for MUI-driven tokens
        primary: 'var(--primary-color, #0a2c24)',
        primaryLight: 'var(--mui-palette-primary-lightOpacity, rgb(25 118 210 / 0.12))',
        primaryLighter: 'var(--mui-palette-primary-lighterOpacity, rgb(25 118 210 / 0.08))',
        primaryDark: 'var(--mui-palette-primary-dark, #115293)',
        secondary: 'var(--mui-palette-secondary-main, #9c27b0)',
        error: 'var(--mui-palette-error-main, #f44336)',
        errorLight: 'var(--mui-palette-error-lightOpacity, rgb(244 67 54 / 0.12))',
        errorLighter: 'var(--mui-palette-error-lighterOpacity, rgb(244 67 54 / 0.08))',
        warning: 'var(--mui-palette-warning-main, #ff9800)',
        info: 'var(--mui-palette-info-main, #0288d1)',
        infoLight: 'var(--mui-palette-info-lightOpacity, rgb(2 136 209 / 0.12))',
        infoLighter: 'var(--mui-palette-info-lighterOpacity, rgb(2 136 209 / 0.08))',
        success: 'var(--mui-palette-success-main, #4caf50)',
        successLight: 'var(--mui-palette-success-lightOpacity, rgb(76 175 80 / 0.12))',
        textPrimary: 'var(--mui-palette-text-primary, #111827)',
        textSecondary: 'var(--mui-palette-text-secondary, #6b7280)',
        textDisabled: 'var(--mui-palette-text-disabled, #9ca3af)',
        actionActive: 'var(--mui-palette-action-active, rgb(0 0 0 / 0.56))',
        actionHover: 'var(--mui-palette-action-hover, rgb(0 0 0 / 0.04))',
        actionSelected: 'var(--mui-palette-action-selected, rgb(0 0 0 / 0.08))',
        actionFocus: 'var(--mui-palette-action-focus, rgb(0 0 0 / 0.12))',
        backgroundPaper: 'var(--mui-palette-background-paper, #ffffff)',
        backgroundDefault: 'var(--mui-palette-background-default, #f9fafb)',
        track: 'var(--mui-palette-customColors-trackBg, #e5e7eb)',
        backdrop: 'var(--backdrop-color, rgb(0 0 0 / 0.5))',
        facebook: '#4267B2',
        twitter: '#1DA1F2',
        linkedin: '#007BB6',
        googlePlus: '#DB4437'
      },
      zIndex: {
        header: 'var(--header-z-index, 900)',
        footer: 'var(--footer-z-index, 800)',
        customizer: 'var(--customizer-z-index, 1100)',
        search: 'var(--search-z-index, 1100)',
        drawer: 'var(--drawer-z-index, 1200)'
      }
    }
  }
})
