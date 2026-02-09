// In your bottom navigation component, use this pattern for translations:

// If using the t function:
const getLabel = (key: string, fallback: string) => {
  const translated = t(key)
  return translated === key ? fallback : translated
}

// Then use:
// getLabel('nav.home', 'Home')
// getLabel('nav.explore', 'Explore')
// getLabel('nav.appointments', 'Appointments')
// getLabel('nav.profile', 'Profile')
