'use client'

import LanguageNavigationGuard from './LanguageNavigationGuard'

// Client wrapper for the LanguageNavigationGuard
// This allows it to be used in server components
const ClientLanguageGuard = () => {
  return <LanguageNavigationGuard />
}

export default ClientLanguageGuard