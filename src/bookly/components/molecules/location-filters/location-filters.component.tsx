'use client'

import { useEffect, useState } from 'react'
import { COUNTRIES } from '@/mocks/businesses'

export interface LocationFiltersProps {
  selectedCountry: string
  selectedCity: string
  selectedRegion: string
  onCountryChange: (country: string) => void
  onCityChange: (city: string) => void
  onRegionChange: (region: string) => void
  className?: string
}

export function LocationFilters({
  selectedCountry,
  selectedCity,
  selectedRegion,
  onCountryChange,
  onCityChange,
  onRegionChange,
  className = ''
}: LocationFiltersProps) {
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [availableRegions, setAvailableRegions] = useState<string[]>([])

  // Update available cities when country changes
  useEffect(() => {
    if (selectedCountry) {
      const country = COUNTRIES[selectedCountry]
      if (country) {
        setAvailableCities(Object.keys(country.cities))
        // Reset city and region if country changes
        if (selectedCity && !country.cities[selectedCity]) {
          onCityChange('')
          onRegionChange('')
        }
      } else {
        setAvailableCities([])
        onCityChange('')
        onRegionChange('')
      }
    } else {
      setAvailableCities([])
      setAvailableRegions([])
      onCityChange('')
      onRegionChange('')
    }
  }, [selectedCountry])

  // Update available regions when city changes
  useEffect(() => {
    if (selectedCountry && selectedCity) {
      const country = COUNTRIES[selectedCountry]
      const city = country?.cities[selectedCity]
      if (city) {
        setAvailableRegions(city.regions)
        // Reset region if it's not valid for the new city
        if (selectedRegion && !city.regions.includes(selectedRegion)) {
          onRegionChange('')
        }
      } else {
        setAvailableRegions([])
        onRegionChange('')
      }
    } else {
      setAvailableRegions([])
      onRegionChange('')
    }
  }, [selectedCity, selectedCountry])

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCountryChange(e.target.value)
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCityChange(e.target.value)
  }

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onRegionChange(e.target.value)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Country Select */}
      <div>
        <label
          htmlFor='country-select'
          className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
        >
          Country
        </label>
        <select
          id='country-select'
          value={selectedCountry}
          onChange={handleCountryChange}
          className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors'
        >
          <option value=''>All Countries</option>
          {Object.entries(COUNTRIES).map(([code, country]) => (
            <option key={code} value={code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* City Select */}
      <div>
        <label
          htmlFor='city-select'
          className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
        >
          City
        </label>
        <select
          id='city-select'
          value={selectedCity}
          onChange={handleCityChange}
          disabled={!selectedCountry || availableCities.length === 0}
          className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          <option value=''>All Cities</option>
          {availableCities.map(city => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Region Select */}
      <div>
        <label
          htmlFor='region-select'
          className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
        >
          Region
        </label>
        <select
          id='region-select'
          value={selectedRegion}
          onChange={handleRegionChange}
          disabled={!selectedCity || availableRegions.length === 0}
          className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          <option value=''>All Regions</option>
          {availableRegions.map(region => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
