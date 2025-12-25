export type PrimaryColorConfig = {
  name?: string
  light?: string
  main: string
  dark?: string
}

// Brand color palette
// Primary: Dark Green #0a2c24 | Navy Blue #202c39 | Off-White #f7f8f9
// Secondary: Coral #e88682 | Sage Green #77b6a3 | Teal #51b4b7

// Primary color config object
const primaryColorConfig: PrimaryColorConfig[] = [
  // Bookly brand Dark Green (default)
  {
    name: 'bookly-green',
    light: '#1d7460', // lighter green for hover states
    main: '#0a2c24', // Dark Green - main brand color
    dark: '#051612' // darker for pressed states
  },
  // Navy Blue variant
  {
    name: 'bookly-navy',
    light: '#3d4a5a',
    main: '#202c39', // Navy Blue
    dark: '#141c27'
  },
  // Sage Green accent
  {
    name: 'bookly-sage',
    light: '#9dcbb9',
    main: '#77b6a3', // Sage Green
    dark: '#5a9a87'
  },
  // Teal accent
  {
    name: 'bookly-teal',
    light: '#7dc8ca',
    main: '#51b4b7', // Teal
    dark: '#3d9598'
  },
  // Coral accent
  {
    name: 'bookly-coral',
    light: '#f0a8a5',
    main: '#e88682', // Coral
    dark: '#d56560'
  }
]

export default primaryColorConfig
