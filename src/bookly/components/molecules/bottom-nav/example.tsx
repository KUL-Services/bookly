// For the bottom navigation, ensure it uses translations with fallback
// Example pattern:
const navItems = [
  { id: 'home', label: t('nav.home') === 'nav.home' ? 'Home' : t('nav.home'), icon: Heart },
  { id: 'explore', label: t('nav.explore') === 'nav.explore' ? 'Explore' : t('nav.explore'), icon: Search },
  {
    id: 'appointments',
    label: t('nav.appointments') === 'nav.appointments' ? 'Appointments' : t('nav.appointments'),
    icon: Calendar
  },
  { id: 'profile', label: t('nav.profile') === 'nav.profile' ? 'Profile' : t('nav.profile'), icon: User }
]
