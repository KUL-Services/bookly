'use client'

import * as React from 'react'
import { cn } from '@/bookly/lib/utils'
import { Button } from '@/bookly/components/ui/button'
import { Input } from '@/bookly/components/ui/input'
import { Checkbox } from '@/bookly/components/ui/checkbox'
import { Badge } from '@/bookly/components/ui/badge'
import { useParams } from 'next/navigation'
import initTranslations from '@/app/i18n/i18n'

export interface FilterState {
  q: string
  location: string
  category: string[]
  priceMin: number | undefined
  priceMax: number | undefined
  rating: number
  sort: string
  available: boolean
  duration?: number[]
  timeOfDay: string[]
}

export interface FilterOptions {
  categories: Array<{ id: string; name: string; count?: number }>
  locations: Array<{ value: string; label: string; count?: number }>
  priceRange: { min: number; max: number }
  sortOptions: Array<{ value: string; label: string }>
  timeSlots: Array<{ value: string; label: string }>
  durationOptions: Array<{ value: number; label: string }>
}

interface SearchFiltersProps {
  filters: FilterState
  options: FilterOptions
  onFiltersChange: (filters: FilterState) => void
  onApplyFilters: () => void
  onResetFilters: () => void
  loading?: boolean
  className?: string
  showAppliedFilters?: boolean
}

export function SearchFilters({
  filters,
  options,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
  loading = false,
  className,
  showAppliedFilters = true
}: SearchFiltersProps) {
  const params = useParams<{ lang: string }>()
  const [t, setT] = React.useState<any>(() => (key: string) => key)

  React.useEffect(() => {
    const initializeTranslations = async () => {
      const { t: tFn } = await initTranslations(params?.lang || 'en', ['common'])
      setT(() => tFn)
    }
    initializeTranslations()
  }, [params?.lang])
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    updateFilter(key, newArray)
  }

  const getAppliedFiltersCount = () => {
    let count = 0
    if (filters.q) count++
    if (filters.location) count++
    if (filters.category.length > 0) count++
    if ((filters.priceMin !== undefined && filters.priceMin > options.priceRange.min) ||
        (filters.priceMax !== undefined && filters.priceMax < options.priceRange.max)) count++
    if (filters.rating > 0) count++
    if (filters.timeOfDay.length > 0) count++
    if (filters.duration && filters.duration.length > 0) count++
    return count
  }

  const getAppliedFiltersList = () => {
    const applied = []

    if (filters.q) {
      applied.push({ key: 'q', label: `${t('search.filters.searchLabel')}: "${filters.q}"`, value: filters.q })
    }

    if (filters.location) {
      applied.push({ key: 'location', label: `${t('search.filters.locationLabel')}: ${filters.location}`, value: filters.location })
    }

    filters.category.forEach(categoryId => {
      const category = options.categories.find(c => c.id === categoryId)
      if (category) {
        applied.push({ key: 'category', label: `${t('search.filters.categoriesLabel')}: ${category.name}`, value: categoryId })
      }
    })

    if ((filters.priceMin !== undefined && filters.priceMin > options.priceRange.min) ||
        (filters.priceMax !== undefined && filters.priceMax < options.priceRange.max)) {
      applied.push({
        key: 'price',
        label: t('search.filters.priceRange', {
          min: filters.priceMin || 0,
          max: filters.priceMax === undefined ? 'Any' : filters.priceMax
        }),
        value: 'price'
      })
    }

    if (filters.rating > 0) {
      applied.push({ key: 'rating', label: `${t('search.filters.ratingLabel')}: ${filters.rating}+ stars`, value: filters.rating })
    }

    filters.timeOfDay.forEach(time => {
      const timeSlot = options.timeSlots.find(t => t.value === time)
      if (timeSlot) {
        applied.push({ key: 'timeOfDay', label: `Time: ${timeSlot.label}`, value: time })
      }
    })

    return applied
  }

  const removeFilter = (key: string, value?: any) => {
    switch (key) {
      case 'q':
        updateFilter('q', '')
        break
      case 'location':
        updateFilter('location', '')
        break
      case 'category':
        updateFilter('category', filters.category.filter(c => c !== value))
        break
      case 'price':
        updateFilter('priceMin', undefined)
        updateFilter('priceMax', undefined)
        break
      case 'rating':
        updateFilter('rating', 0)
        break
      case 'timeOfDay':
        updateFilter('timeOfDay', filters.timeOfDay.filter(t => t !== value))
        break
    }
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6', className)}>
      {/* Applied Filters */}
      {showAppliedFilters && getAppliedFiltersCount() > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {t('search.filters.appliedFilters')} ({getAppliedFiltersCount()})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {t('search.filters.clearAll')}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {getAppliedFiltersList().map((filter, index) => (
              <Badge
                key={`${filter.key}-${index}`}
                variant="secondary"
                className="bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800/40 cursor-pointer"
                onClick={() => removeFilter(filter.key, filter.value)}
              >
                {filter.label}
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search Query */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('search.filters.searchLabel')}
        </label>
        <Input
          type="text"
          placeholder={t('search.filters.searchPlaceholder')}
          value={filters.q}
          onChange={(e) => updateFilter('q', e.target.value)}
          className="w-full"
        />
      </div>

      {/* Location */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('search.filters.locationLabel')}
        </label>
        <Input
          type="text"
          placeholder={t('search.filters.locationPlaceholder')}
          value={filters.location}
          onChange={(e) => updateFilter('location', e.target.value)}
          className="w-full"
        />
        {options.locations.length > 0 && (
          <div className="mt-2 max-h-32 overflow-y-auto">
            {options.locations.map((location) => (
              <button
                key={location.value}
                onClick={() => updateFilter('location', location.value)}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
              >
                {location.label}
                {location.count && (
                  <span className="text-gray-400 dark:text-gray-500 ml-auto">({location.count})</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('search.filters.categoriesLabel')}
        </label>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {options.categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-3">
              <Checkbox
                id={`category-${category.id}`}
                checked={filters.category.includes(category.id)}
                onCheckedChange={() => toggleArrayFilter('category', category.id)}
              />
              <label
                htmlFor={`category-${category.id}`}
                className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {category.name}
                {category.count && (
                  <span className="text-gray-400 dark:text-gray-500 ml-1">({category.count})</span>
                )}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('search.filters.priceRangeLabel')}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('search.filters.minLabel')}</label>
            <Input
              type="number"
              min={options.priceRange.min}
              max={options.priceRange.max}
              value={filters.priceMin || ''}
              onChange={(e) => {
                const value = e.target.value
                updateFilter('priceMin', value === '' ? undefined : Number(value))
              }}
              placeholder={t('search.filters.minPricePlaceholder')}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('search.filters.maxLabel')}</label>
            <Input
              type="number"
              min={options.priceRange.min}
              max={options.priceRange.max}
              value={filters.priceMax || ''}
              onChange={(e) => {
                const value = e.target.value
                updateFilter('priceMax', value === '' ? undefined : Number(value))
              }}
              placeholder={t('search.filters.maxPricePlaceholder')}
            />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded px-3 py-2">
          {t('search.filters.priceRange', {
            min: filters.priceMin || 0,
            max: filters.priceMax === undefined ? 'Any' : filters.priceMax
          })}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('search.filters.ratingLabel')}
        </label>
        <div className="flex space-x-2">
          {[0, 1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => updateFilter('rating', rating)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                filters.rating === rating
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              {rating === 0 ? t('search.filters.anyRating') : `${rating}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Time of Day */}
      {options.timeSlots.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('search.filters.preferredTimeLabel')}
          </label>
          <div className="space-y-2">
            {options.timeSlots.map((timeSlot) => (
              <div key={timeSlot.value} className="flex items-center space-x-3">
                <Checkbox
                  id={`time-${timeSlot.value}`}
                  checked={filters.timeOfDay.includes(timeSlot.value)}
                  onCheckedChange={() => toggleArrayFilter('timeOfDay', timeSlot.value)}
                />
                <label
                  htmlFor={`time-${timeSlot.value}`}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {timeSlot.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sort */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('search.filters.sortByLabel')}
        </label>
        <select
          value={filters.sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          {options.sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onApplyFilters}
          disabled={loading}
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
        >
          {loading ? t('search.filters.applying') : t('search.filters.applyFilters')}
        </Button>
        <Button
          variant="outline"
          onClick={onResetFilters}
          disabled={loading}
          className="flex-1"
        >
          {t('search.filters.reset')}
        </Button>
      </div>
    </div>
  )
}

export default SearchFilters