import localFont from 'next/font/local'

// HelveticaWorld font configuration
export const helveticaWorld = localFont({
  src: [
    {
      path: '../assets/fonts/alfont_com_AlFont_com_HelveticaWorld-Regular.ttf',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../assets/fonts/alfont_com_HelveticaWorld-Bold.ttf',
      weight: '700',
      style: 'normal'
    }
  ],
  variable: '--font-helvetica-world',
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif']
})

// FiraCode font configuration
export const firaCode = localFont({
  src: [
    {
      path: '../assets/fonts/FiraCode-VariableFont_wght.ttf',
      style: 'normal'
    }
  ],
  variable: '--font-fira-code',
  display: 'swap',
  fallback: ['Courier New', 'monospace']
})

// Export the font family string for use in MUI and other configurations
export const fontFamily = `var(--font-helvetica-world), Helvetica, Arial, sans-serif`
export const fontMono = `var(--font-fira-code), monospace`
