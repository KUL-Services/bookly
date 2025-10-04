import { MOCK_BUSINESSES, type BusinessLocation } from '@/mocks/businesses'

export interface FetchBusinessesParams {
  country?: string
  city?: string
  region?: string
  category?: string
  search?: string
}

/**
 * Mock service to fetch businesses with filtering
 * Simulates API latency and client-side filtering
 */
export async function fetchBusinessesMock(params: FetchBusinessesParams = {}): Promise<BusinessLocation[]> {
  // Simulate network latency (300-600ms)
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 300))

  let filtered = [...MOCK_BUSINESSES]

  // Filter by country
  if (params.country) {
    filtered = filtered.filter(b => b.country === params.country)
  }

  // Filter by city
  if (params.city) {
    filtered = filtered.filter(b => b.city === params.city)
  }

  // Filter by region
  if (params.region) {
    filtered = filtered.filter(b => b.region === params.region)
  }

  // Filter by category
  if (params.category) {
    filtered = filtered.filter(b => b.categories.some(cat => cat.toLowerCase().includes(params.category!.toLowerCase())))
  }

  // Filter by search query
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filtered = filtered.filter(
      b =>
        b.name.toLowerCase().includes(searchLower) ||
        b.description.toLowerCase().includes(searchLower) ||
        b.categories.some(cat => cat.toLowerCase().includes(searchLower)) ||
        b.address.toLowerCase().includes(searchLower)
    )
  }

  return filtered
}

/**
 * Get all available regions for a specific country
 */
export function getRegionsForCountry(countryCode: string): string[] {
  const businesses = MOCK_BUSINESSES.filter(b => b.country === countryCode)
  const regions = [...new Set(businesses.map(b => b.region))]
  return regions.sort()
}

/**
 * Get all available countries
 */
export function getAvailableCountries(): { code: string; name: string; count: number }[] {
  const countryCounts: Record<string, number> = {}

  MOCK_BUSINESSES.forEach(b => {
    countryCounts[b.country] = (countryCounts[b.country] || 0) + 1
  })

  return Object.entries(countryCounts).map(([code, count]) => ({
    code,
    name: getCountryName(code),
    count
  }))
}

/**
 * Get country name from code
 */
export function getCountryName(code: string): string {
  const names: Record<string, string> = {
    AE: 'United Arab Emirates',
    SA: 'Saudi Arabia',
    EG: 'Egypt',
    GB: 'United Kingdom'
  }
  return names[code] || code
}
