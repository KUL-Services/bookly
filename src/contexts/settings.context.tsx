'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type CountryCode = 'EG' | 'UAE' | 'KSA' | 'UK'
export type CurrencyCode = 'EGP' | 'AED' | 'SAR' | 'GBP'

interface SettingsState {
  country: CountryCode
  currency: CurrencyCode
  locale: string
}

interface SettingsContextType extends SettingsState {
  setCountry: (country: CountryCode) => void
  setCurrency: (currency: CurrencyCode) => void
}

const DEFAULT_SETTINGS: SettingsState = {
  country: 'EG',
  currency: 'EGP',
  locale: 'en-EG'
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS)

  // Load from local storage on mount (if we want persistence)
  useEffect(() => {
    const saved = localStorage.getItem('bookly-settings')
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) })
      } catch (e) {
        console.error('Failed to parse settings', e)
      }
    }
  }, [])

  const updateSettings = (updates: Partial<SettingsState>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates }
      localStorage.setItem('bookly-settings', JSON.stringify(next))
      return next
    })
  }

  const setCountry = (country: CountryCode) => {
    // Map country to default currency
    let currency: CurrencyCode = 'EGP'
    let locale = 'en-EG'

    switch (country) {
      case 'UAE':
        currency = 'AED'
        locale = 'en-AE'
        break
      case 'KSA':
        currency = 'SAR'
        locale = 'en-SA'
        break
      case 'UK':
        currency = 'GBP'
        locale = 'en-GB'
        break
      case 'EG':
      default:
        currency = 'EGP'
        locale = 'en-EG'
        break
    }

    updateSettings({ country, currency, locale })
  }

  const setCurrency = (currency: CurrencyCode) => updateSettings({ currency })

  return (
    <SettingsContext.Provider value={{ ...settings, setCountry, setCurrency }}>{children}</SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
