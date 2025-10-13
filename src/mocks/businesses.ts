import type { Service, Branch, Staff } from '@/lib/api'

export interface BusinessBranch {
  id: string
  branchName: string
  latitude: number
  longitude: number
  address: string
  phone?: string
}

export interface BusinessLocation {
  id: string
  name: string
  country: string
  city: string
  region: string
  coordinates: {
    lat: number
    lng: number
  }
  address: string
  rating: number
  imageUrl?: string
  logoUrl?: string
  coverImageUrl?: string
  categories: string[]
  description: string
  email: string
  phone?: string
  priceRange: {
    min: number
    max: number
  }
  servicesCount: number
  branches: BusinessBranch[]
  approved?: boolean
  socialLinks?: Array<{ platform: string; url: string }>
  services?: Service[]
  fullBranches?: Branch[]
  reviews?: Array<{
    id: string
    rating: number
    comment: string
    user: { firstName: string; lastName: string }
    createdAt: string
  }>
}

export interface City {
  name: string
  regions: string[]
}

export interface Country {
  code: string
  name: string
  cities: Record<string, City>
}

export const COUNTRIES: Record<string, Country> = {
  EG: {
    code: 'EG',
    name: 'Egypt',
    cities: {
      Cairo: {
        name: 'Cairo',
        regions: ['Downtown', 'Nasr City', 'Heliopolis', 'Maadi', 'Zamalek']
      },
      Giza: {
        name: 'Giza',
        regions: ['Mohandeseen', 'Dokki', 'October', 'Sheikh Zayed', 'Haram']
      },
      Alexandria: {
        name: 'Alexandria',
        regions: ['Smouha', 'Sidi Gaber', 'Sporting', 'Miami']
      },
      Luxor: {
        name: 'Luxor',
        regions: ['East Bank', 'West Bank']
      }
    }
  },
  AE: {
    code: 'AE',
    name: 'United Arab Emirates',
    cities: {
      Dubai: {
        name: 'Dubai',
        regions: ['Downtown', 'Marina', 'JBR', 'Business Bay']
      },
      'Abu Dhabi': {
        name: 'Abu Dhabi',
        regions: ['Corniche', 'Al Markaziyah', 'Yas Island']
      },
      Sharjah: {
        name: 'Sharjah',
        regions: ['Al Majaz', 'Al Nahda']
      }
    }
  },
  SA: {
    code: 'SA',
    name: 'Saudi Arabia',
    cities: {
      Riyadh: {
        name: 'Riyadh',
        regions: ['Olaya', 'Al Malaz', 'Al Hamra']
      },
      Jeddah: {
        name: 'Jeddah',
        regions: ['Al Hamra', 'Al Rawdah']
      }
    }
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    cities: {
      London: {
        name: 'London',
        regions: ['Mayfair', 'Chelsea', 'Canary Wharf']
      },
      Manchester: {
        name: 'Manchester',
        regions: ['Deansgate', 'Northern Quarter']
      }
    }
  }
}

// Helper function to generate branches for a business
function generateBranches(businessId: string, businessName: string, baseLat: number, baseLng: number, region: string, address: string, phone?: string): BusinessBranch[] {
  const branches: BusinessBranch[] = [
    {
      id: `${businessId}-branch-1`,
      branchName: `${businessName} - ${region} Main`,
      latitude: baseLat,
      longitude: baseLng,
      address: address,
      phone: phone
    }
  ]

  // Add 1-2 additional branches with slight coordinate variations
  const numAdditionalBranches = Math.random() > 0.5 ? 1 : 2

  for (let i = 2; i <= numAdditionalBranches + 1; i++) {
    branches.push({
      id: `${businessId}-branch-${i}`,
      branchName: `${businessName} - Branch ${i}`,
      latitude: baseLat + (Math.random() * 0.02 - 0.01), // Random offset within ~1km
      longitude: baseLng + (Math.random() * 0.02 - 0.01),
      address: `${address} - Branch ${i}`,
      phone: phone
    })
  }

  return branches
}

export const MOCK_BUSINESSES: BusinessLocation[] = [
  // UAE - Dubai
  {
    id: 'biz-1',
    name: 'Luxury Spa Dubai',
    country: 'AE',
    city: 'Dubai',
    region: 'Downtown',
    coordinates: { lat: 25.2048, lng: 55.2708 },
    address: 'Dubai Mall, Downtown Dubai',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
    logoUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200',
    coverImageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200',
    categories: ['Spa & Wellness', 'Massage'],
    description: 'Premium spa services in the heart of Dubai with world-class therapists',
    email: 'info@luxuryspadubai.ae',
    phone: '+971-4-123-4567',
    priceRange: { min: 200, max: 800 },
    servicesCount: 15,
    branches: generateBranches('biz-1', 'Luxury Spa Dubai', 25.2048, 55.2708, 'Downtown', 'Dubai Mall, Downtown Dubai', '+971-4-123-4567')
  },
  {
    id: 'biz-2',
    name: 'Elite Hair Studio Dubai',
    country: 'AE',
    city: 'Dubai',
    region: 'Downtown',
    coordinates: { lat: 25.1972, lng: 55.2744 },
    address: 'Jumeirah Beach Road',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    logoUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200',
    coverImageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200',
    categories: ['Hair Care', 'Beauty'],
    description: 'Cutting-edge hair styling and coloring by international stylists',
    email: 'book@elitehairstudio.ae',
    phone: '+971-4-234-5678',
    priceRange: { min: 150, max: 600 },
    servicesCount: 12,
    branches: generateBranches('biz-2', 'Elite Hair Studio Dubai', 25.1972, 55.2744, 'Downtown', 'Jumeirah Beach Road', '+971-4-234-5678')
  },
  {
    id: 'biz-3',
    name: 'Dubai Dental Excellence',
    country: 'AE',
    city: 'Dubai',
    region: 'Downtown',
    coordinates: { lat: 25.2182, lng: 55.2756 },
    address: 'Business Bay',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800',
    logoUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=200',
    coverImageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200',
    categories: ['Healthcare', 'Dental'],
    description: 'State-of-the-art dental clinic with latest technology',
    email: 'appointments@dubaidental.ae',
    phone: '+971-4-345-6789',
    priceRange: { min: 300, max: 2000 },
    servicesCount: 18,
    branches: generateBranches('biz-3', 'Dubai Dental Excellence', 25.2182, 55.2756, 'Downtown', 'Business Bay', '+971-4-345-6789')
  },
  {
    id: 'biz-4',
    name: 'FitZone Dubai Marina',
    country: 'AE',
    city: 'Dubai',
    region: 'Downtown',
    coordinates: { lat: 25.0772, lng: 55.1377 },
    address: 'Dubai Marina Walk',
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    logoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200',
    coverImageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200',
    categories: ['Fitness', 'Personal Training'],
    description: 'Premium fitness center with personal trainers and group classes',
    email: 'hello@fitzonedubai.ae',
    priceRange: { min: 100, max: 500 },
    servicesCount: 20,
    branches: generateBranches('biz-4', 'FitZone Dubai Marina', 25.0772, 55.1377, 'Downtown', 'Dubai Marina Walk', undefined)
  },

  // UAE - Abu Dhabi
  {
    id: 'biz-5',
    name: 'Royal Spa Abu Dhabi',
    country: 'AE',
    city: 'Abu Dhabi',
    region: 'Corniche',
    coordinates: { lat: 24.4539, lng: 54.3773 },
    address: 'Corniche Road',
    rating: 4.7,
    categories: ['Spa & Wellness'],
    description: 'Luxurious spa treatments with Arabian hospitality',
    email: 'info@royalspaad.ae',
    priceRange: { min: 180, max: 700 },
    servicesCount: 14,
    branches: generateBranches('biz-5', 'Royal Spa Abu Dhabi', 24.4539, 54.3773, 'Corniche', 'Corniche Road', undefined)
  },
  {
    id: 'biz-6',
    name: 'Abu Dhabi Hair Lounge',
    country: 'AE',
    city: 'Abu Dhabi',
    region: 'Corniche',
    coordinates: { lat: 24.4667, lng: 54.3667 },
    address: 'Al Markaziyah',
    rating: 4.4,
    categories: ['Hair Care', 'Beauty'],
    description: 'Modern hair salon with expert stylists',
    email: 'book@adhairlounge.ae',
    priceRange: { min: 120, max: 500 },
    servicesCount: 10,
    branches: generateBranches('biz-6', 'Abu Dhabi Hair Lounge', 24.4667, 54.3667, 'Corniche', 'Al Markaziyah', undefined)
  },

  // Saudi Arabia - Riyadh
  {
    id: 'biz-7',
    name: 'Riyadh Premium Wellness',
    country: 'SA',
    city: 'Riyadh',
    region: 'Olaya',
    coordinates: { lat: 24.7136, lng: 46.6753 },
    address: 'King Fahd Road',
    rating: 4.8,
    categories: ['Spa & Wellness', 'Massage'],
    description: 'Exclusive wellness center in Riyadh',
    email: 'contact@riyadhwellness.sa',
    priceRange: { min: 250, max: 900 },
    servicesCount: 16,
    branches: generateBranches('biz-7', 'Riyadh Premium Wellness', 24.7136, 46.6753, 'Olaya', 'King Fahd Road', undefined)
  },
  {
    id: 'biz-8',
    name: 'Riyadh Dental Care',
    country: 'SA',
    city: 'Riyadh',
    region: 'Olaya',
    coordinates: { lat: 24.7243, lng: 46.6544 },
    address: 'Olaya District',
    rating: 4.6,
    categories: ['Healthcare', 'Dental'],
    description: 'Modern dental clinic with experienced dentists',
    email: 'info@riyadhdental.sa',
    priceRange: { min: 200, max: 1800 },
    servicesCount: 15,
    branches: generateBranches('biz-8', 'Riyadh Dental Care', 24.7243, 46.6544, 'Olaya', 'Olaya District', undefined)
  },
  {
    id: 'biz-9',
    name: 'Elite Fitness Riyadh',
    country: 'SA',
    city: 'Riyadh',
    region: 'Olaya',
    coordinates: { lat: 24.7353, lng: 46.6722 },
    address: 'Kingdom Centre',
    rating: 4.5,
    categories: ['Fitness', 'Personal Training'],
    description: 'High-end fitness facility with latest equipment',
    email: 'membership@elitefitness.sa',
    priceRange: { min: 150, max: 600 },
    servicesCount: 18,
    branches: generateBranches('biz-9', 'Elite Fitness Riyadh', 24.7353, 46.6722, 'Olaya', 'Kingdom Centre', undefined)
  },

  // Saudi Arabia - Jeddah
  {
    id: 'biz-10',
    name: 'Jeddah Spa Retreat',
    country: 'SA',
    city: 'Jeddah',
    region: 'Al Hamra',
    coordinates: { lat: 21.4858, lng: 39.1925 },
    address: 'Corniche, Jeddah',
    rating: 4.7,
    categories: ['Spa & Wellness'],
    description: 'Seaside spa with relaxing treatments',
    email: 'book@jeddahspa.sa',
    priceRange: { min: 200, max: 750 },
    servicesCount: 13,
    branches: generateBranches('biz-10', 'Jeddah Spa Retreat', 21.4858, 39.1925, 'Al Hamra', 'Corniche, Jeddah', undefined)
  },
  {
    id: 'biz-11',
    name: 'Jeddah Beauty Studio',
    country: 'SA',
    city: 'Jeddah',
    region: 'Al Hamra',
    coordinates: { lat: 21.5169, lng: 39.2192 },
    address: 'Al Hamra District',
    rating: 4.5,
    categories: ['Hair Care', 'Beauty', 'Nail Care'],
    description: 'Full-service beauty salon for modern women',
    email: 'info@jeddahbeauty.sa',
    priceRange: { min: 100, max: 550 },
    servicesCount: 14,
    branches: generateBranches('biz-11', 'Jeddah Beauty Studio', 21.5169, 39.2192, 'Al Hamra', 'Al Hamra District', undefined)
  },

  // Egypt - Cairo Downtown
  {
    id: 'biz-12',
    name: 'Cairo Downtown Wellness',
    country: 'EG',
    city: 'Cairo',
    region: 'Downtown',
    coordinates: { lat: 30.0444, lng: 31.2357 },
    address: 'Tahrir Square, Downtown Cairo',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    logoUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200',
    coverImageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',
    categories: ['Spa & Wellness', 'Massage'],
    description: 'Relaxation and wellness in the heart of Cairo',
    email: 'info@cairowellness.eg',
    priceRange: { min: 80, max: 400 },
    servicesCount: 12,
    branches: generateBranches('biz-12', 'Cairo Downtown Wellness', 30.0444, 31.2357, 'Downtown', 'Tahrir Square, Downtown Cairo', undefined)
  },
  {
    id: 'biz-13',
    name: 'Downtown Beauty Studio',
    country: 'EG',
    city: 'Cairo',
    region: 'Downtown',
    coordinates: { lat: 30.0489, lng: 31.2421 },
    address: 'Talaat Harb Street',
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
    logoUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=200',
    coverImageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200',
    categories: ['Hair Care', 'Beauty', 'Nail Care'],
    description: 'Modern beauty salon in historic downtown',
    email: 'book@downtownbeauty.eg',
    priceRange: { min: 60, max: 350 },
    servicesCount: 14,
    branches: generateBranches('biz-13', 'Downtown Beauty Studio', 30.0489, 31.2421, 'Downtown', 'Talaat Harb Street', undefined)
  },
  {
    id: 'biz-14',
    name: 'Cairo Central Dental',
    country: 'EG',
    city: 'Cairo',
    region: 'Downtown',
    coordinates: { lat: 30.0515, lng: 31.2405 },
    address: 'Abdel Khalek Sarwat Street',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800',
    logoUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=200',
    coverImageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200',
    categories: ['Healthcare', 'Dental'],
    description: 'Comprehensive dental services with modern equipment',
    email: 'appointments@cairodental.eg',
    priceRange: { min: 100, max: 1200 },
    servicesCount: 16,
    branches: generateBranches('biz-14', 'Cairo Central Dental', 30.0515, 31.2405, 'Downtown', 'Abdel Khalek Sarwat Street', undefined)
  },

  // Egypt - Cairo Nasr City
  {
    id: 'biz-13a',
    name: 'Nasr City Hair Lounge',
    country: 'EG',
    city: 'Cairo',
    region: 'Nasr City',
    coordinates: { lat: 30.0626, lng: 31.3497 },
    address: 'Abbas El Akkad Street, Nasr City',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800',
    logoUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=200',
    coverImageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200',
    categories: ['Hair Care', 'Beauty'],
    description: 'Professional hair care and styling services in Nasr City',
    email: 'book@nasrhair.eg',
    priceRange: { min: 70, max: 400 },
    servicesCount: 13,
    branches: generateBranches('biz-13a', 'Nasr City Hair Lounge', 30.0626, 31.3497, 'Nasr City', 'Abbas El Akkad Street, Nasr City', undefined)
  },
  {
    id: 'biz-13b',
    name: 'City Stars Spa',
    country: 'EG',
    city: 'Cairo',
    region: 'Nasr City',
    coordinates: { lat: 30.0731, lng: 31.3439 },
    address: 'City Stars Mall, Nasr City',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800',
    logoUrl: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=200',
    coverImageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',
    categories: ['Spa & Wellness', 'Massage'],
    description: 'Luxurious spa experience in Cairo\'s premier mall',
    email: 'info@citystarsspa.eg',
    priceRange: { min: 120, max: 550 },
    servicesCount: 18,
    branches: generateBranches('biz-13b', 'City Stars Spa', 30.0731, 31.3439, 'Nasr City', 'City Stars Mall, Nasr City', undefined)
  },
  {
    id: 'biz-13c',
    name: 'Nasr City Fitness Hub',
    country: 'EG',
    city: 'Cairo',
    region: 'Nasr City',
    coordinates: { lat: 30.0583, lng: 31.3356 },
    address: 'Makram Ebeid, Nasr City',
    rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
    logoUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200',
    coverImageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200',
    categories: ['Fitness', 'Personal Training'],
    description: 'Modern fitness center with certified trainers',
    email: 'join@nasrfitness.eg',
    priceRange: { min: 80, max: 450 },
    servicesCount: 20,
    branches: generateBranches('biz-13c', 'Nasr City Fitness Hub', 30.0583, 31.3356, 'Nasr City', 'Makram Ebeid, Nasr City', undefined)
  },

  // Egypt - Giza October
  {
    id: 'biz-15',
    name: 'October Plaza Spa',
    country: 'EG',
    city: 'Giza',
    region: 'October',
    coordinates: { lat: 29.9870, lng: 30.9370 },
    address: 'Mall of Arabia, 6th October',
    rating: 4.7,
    categories: ['Spa & Wellness', 'Massage'],
    description: 'Modern spa with premium services in October City',
    email: 'info@octoberplazaspa.eg',
    priceRange: { min: 90, max: 450 },
    servicesCount: 15,
    branches: generateBranches('biz-15', 'October Plaza Spa', 29.9870, 30.9370, 'October', 'Mall of Arabia, 6th October', undefined)
  },
  {
    id: 'biz-16',
    name: 'October Fitness Club',
    country: 'EG',
    city: 'Giza',
    region: 'October',
    coordinates: { lat: 29.9796, lng: 30.9321 },
    address: 'Sheikh Zayed, 6th October',
    rating: 4.5,
    categories: ['Fitness', 'Personal Training'],
    description: 'State-of-the-art gym with certified trainers',
    email: 'join@octoberfitness.eg',
    priceRange: { min: 70, max: 350 },
    servicesCount: 18,
    branches: generateBranches('biz-16', 'October Fitness Club', 29.9796, 30.9321, 'October', 'Sheikh Zayed, 6th October', undefined)
  },
  {
    id: 'biz-16a',
    name: 'October Beauty Center',
    country: 'EG',
    city: 'Giza',
    region: 'October',
    coordinates: { lat: 29.9725, lng: 30.9448 },
    address: 'Americana Plaza, 6th October',
    rating: 4.6,
    categories: ['Hair Care', 'Beauty', 'Nail Care'],
    description: 'Full-service beauty salon in October City',
    email: 'book@octoberbeauty.eg',
    priceRange: { min: 65, max: 380 },
    servicesCount: 16,
    branches: generateBranches('biz-16a', 'October Beauty Center', 29.9725, 30.9448, 'October', 'Americana Plaza, 6th October', undefined)
  },

  // Egypt - Giza Dokki
  {
    id: 'biz-16b',
    name: 'Dokki Wellness Spa',
    country: 'EG',
    city: 'Giza',
    region: 'Dokki',
    coordinates: { lat: 30.0381, lng: 31.2109 },
    address: 'Dokki Square, Dokki',
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800',
    logoUrl: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=200',
    coverImageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200',
    categories: ['Spa & Wellness'],
    description: 'Tranquil spa with Egyptian-inspired treatments in Dokki',
    email: 'info@dokkispa.eg',
    priceRange: { min: 75, max: 380 },
    servicesCount: 12,
    branches: generateBranches('biz-16b', 'Dokki Wellness Spa', 30.0381, 31.2109, 'Dokki', 'Dokki Square, Dokki', undefined)
  },
  {
    id: 'biz-16c',
    name: 'Dokki Hair Studio',
    country: 'EG',
    city: 'Giza',
    region: 'Dokki',
    coordinates: { lat: 30.0425, lng: 31.2089 },
    address: 'Mesaha Square, Dokki',
    rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800',
    logoUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=200',
    coverImageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200',
    categories: ['Hair Care', 'Beauty'],
    description: 'Professional hair salon in the heart of Dokki',
    email: 'book@dokkihair.eg',
    priceRange: { min: 55, max: 320 },
    servicesCount: 11,
    branches: generateBranches('biz-16c', 'Dokki Hair Studio', 30.0425, 31.2089, 'Dokki', 'Mesaha Square, Dokki', undefined)
  },
  {
    id: 'biz-16d',
    name: 'Dokki Dental Care',
    country: 'EG',
    city: 'Giza',
    region: 'Dokki',
    coordinates: { lat: 30.0365, lng: 31.2135 },
    address: 'Tahrir Street, Dokki',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800',
    logoUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=200',
    coverImageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200',
    categories: ['Healthcare', 'Dental'],
    description: 'Modern dental clinic with experienced dentists',
    email: 'appointments@dokkidental.eg',
    priceRange: { min: 90, max: 1100 },
    servicesCount: 14,
    branches: generateBranches('biz-16d', 'Dokki Dental Care', 30.0365, 31.2135, 'Dokki', 'Tahrir Street, Dokki', undefined)
  },

  // Egypt - Giza Mohandeseen
  {
    id: 'biz-16e',
    name: 'Mohandeseen Premium Spa',
    country: 'EG',
    city: 'Giza',
    region: 'Mohandeseen',
    coordinates: { lat: 30.0626, lng: 31.2009 },
    address: 'Arab League Street, Mohandeseen',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    logoUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200',
    coverImageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',
    categories: ['Spa & Wellness', 'Massage'],
    description: 'Upscale spa with luxury treatments in Mohandeseen',
    email: 'info@mohandeseenspa.eg',
    priceRange: { min: 100, max: 500 },
    servicesCount: 16,
    branches: generateBranches('biz-16e', 'Mohandeseen Premium Spa', 30.0626, 31.2009, 'Mohandeseen', 'Arab League Street, Mohandeseen', undefined)
  },
  {
    id: 'biz-16f',
    name: 'Mohandeseen Hair & Beauty',
    country: 'EG',
    city: 'Giza',
    region: 'Mohandeseen',
    coordinates: { lat: 30.0586, lng: 31.1985 },
    address: 'Gameat El Dewal Street',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    logoUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200',
    coverImageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200',
    categories: ['Hair Care', 'Beauty', 'Nail Care'],
    description: 'Elite beauty salon in Mohandeseen',
    email: 'book@mohandeseenbeauty.eg',
    priceRange: { min: 70, max: 400 },
    servicesCount: 15,
    branches: generateBranches('biz-16f', 'Mohandeseen Hair & Beauty', 30.0586, 31.1985, 'Mohandeseen', 'Gameat El Dewal Street', undefined)
  },

  // Egypt - Alexandria
  {
    id: 'biz-17',
    name: 'Alexandria Beauty Lounge',
    country: 'EG',
    city: 'Alexandria',
    region: 'Smouha',
    coordinates: { lat: 31.2001, lng: 29.9187 },
    address: 'Corniche, Alexandria',
    rating: 4.6,
    categories: ['Hair Care', 'Beauty', 'Nail Care'],
    description: 'Seaside beauty salon with comprehensive services',
    email: 'book@alexbeauty.eg',
    priceRange: { min: 55, max: 320 },
    servicesCount: 13,
    branches: generateBranches('biz-17', 'Alexandria Beauty Lounge', 31.2001, 29.9187, 'Smouha', 'Corniche, Alexandria', undefined)
  },

  // UK - London
  {
    id: 'biz-18',
    name: 'London Luxury Spa',
    country: 'GB',
    city: 'London',
    region: 'Mayfair',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    address: 'Mayfair, London',
    rating: 4.9,
    categories: ['Spa & Wellness', 'Massage'],
    description: 'Five-star spa experience in central London',
    email: 'reservations@londonluxuryspa.co.uk',
    priceRange: { min: 250, max: 1000 },
    servicesCount: 20,
    branches: generateBranches('biz-18', 'London Luxury Spa', 51.5074, -0.1278, 'Mayfair', 'Mayfair, London', undefined)
  },
  {
    id: 'biz-19',
    name: 'Chelsea Hair Studio',
    country: 'GB',
    city: 'London',
    region: 'Mayfair',
    coordinates: { lat: 51.4875, lng: -0.1687 },
    address: 'Kings Road, Chelsea',
    rating: 4.7,
    categories: ['Hair Care', 'Beauty'],
    description: 'Trendy hair salon with celebrity stylists',
    email: 'book@chelseahair.co.uk',
    priceRange: { min: 180, max: 700 },
    servicesCount: 14,
    branches: generateBranches('biz-19', 'Chelsea Hair Studio', 51.4875, -0.1687, 'Mayfair', 'Kings Road, Chelsea', undefined)
  },
  {
    id: 'biz-20',
    name: 'London Dental Excellence',
    country: 'GB',
    city: 'London',
    region: 'Mayfair',
    coordinates: { lat: 51.5152, lng: -0.1426 },
    address: 'Harley Street',
    rating: 4.8,
    categories: ['Healthcare', 'Dental'],
    description: 'Premier dental practice on famous Harley Street',
    email: 'appointments@londondental.co.uk',
    priceRange: { min: 300, max: 2500 },
    servicesCount: 22,
    branches: generateBranches('biz-20', 'London Dental Excellence', 51.5152, -0.1426, 'Mayfair', 'Harley Street', undefined)
  },
  {
    id: 'biz-21',
    name: 'Canary Wharf Fitness',
    country: 'GB',
    city: 'London',
    region: 'Mayfair',
    coordinates: { lat: 51.5054, lng: -0.0235 },
    address: 'Canary Wharf',
    rating: 4.6,
    categories: ['Fitness', 'Personal Training'],
    description: 'Executive fitness club with premium facilities',
    email: 'membership@canaryfitness.co.uk',
    priceRange: { min: 200, max: 800 },
    servicesCount: 25,
    branches: generateBranches('biz-21', 'Canary Wharf Fitness', 51.5054, -0.0235, 'Mayfair', 'Canary Wharf', undefined)
  },

  // UK - Manchester
  {
    id: 'biz-22',
    name: 'Manchester Spa Retreat',
    country: 'GB',
    city: 'Manchester',
    region: 'Deansgate',
    coordinates: { lat: 53.4808, lng: -2.2426 },
    address: 'Deansgate, Manchester',
    rating: 4.7,
    categories: ['Spa & Wellness'],
    description: 'Urban spa sanctuary in Manchester city center',
    email: 'info@manchesterspa.co.uk',
    priceRange: { min: 150, max: 600 },
    servicesCount: 16,
    branches: generateBranches('biz-22', 'Manchester Spa Retreat', 53.4808, -2.2426, 'Deansgate', 'Deansgate, Manchester', undefined)
  },
  {
    id: 'biz-23',
    name: 'Northern Quarter Hair',
    country: 'GB',
    city: 'Manchester',
    region: 'Deansgate',
    coordinates: { lat: 53.4839, lng: -2.2364 },
    address: 'Northern Quarter',
    rating: 4.5,
    categories: ['Hair Care', 'Beauty'],
    description: 'Edgy hair salon in Manchester\'s creative district',
    email: 'book@nqhair.co.uk',
    priceRange: { min: 120, max: 450 },
    servicesCount: 12,
    branches: generateBranches('biz-23', 'Northern Quarter Hair', 53.4839, -2.2364, 'Deansgate', 'Northern Quarter', undefined)
  },

  // UK - Birmingham
  {
    id: 'biz-24',
    name: 'Birmingham Beauty Hub',
    country: 'GB',
    city: 'Birmingham',
    region: 'Bullring',
    coordinates: { lat: 52.4862, lng: -1.8904 },
    address: 'Bullring, Birmingham',
    rating: 4.4,
    categories: ['Hair Care', 'Beauty', 'Nail Care'],
    description: 'One-stop beauty destination in Birmingham',
    email: 'hello@bhambeauty.co.uk',
    priceRange: { min: 90, max: 400 },
    servicesCount: 17,
    branches: generateBranches('biz-24', 'Birmingham Beauty Hub', 52.4862, -1.8904, 'Bullring', 'Bullring, Birmingham', undefined)
  },
  {
    id: 'biz-25',
    name: 'Birmingham Wellness Center',
    country: 'GB',
    city: 'Birmingham',
    region: 'Bullring',
    coordinates: { lat: 52.4796, lng: -1.9026 },
    address: 'Edgbaston',
    rating: 4.6,
    categories: ['Spa & Wellness', 'Massage'],
    description: 'Holistic wellness treatments in peaceful setting',
    email: 'wellness@bhamwellness.co.uk',
    priceRange: { min: 100, max: 500 },
    servicesCount: 14,
    branches: generateBranches('biz-25', 'Birmingham Wellness Center', 52.4796, -1.9026, 'Bullring', 'Edgbaston', undefined)
  },

  // UK - Edinburgh
  {
    id: 'biz-26',
    name: 'Edinburgh Royal Spa',
    country: 'GB',
    city: 'Edinburgh',
    region: 'Princes Street',
    coordinates: { lat: 55.9533, lng: -3.1883 },
    address: 'Princes Street',
    rating: 4.8,
    categories: ['Spa & Wellness'],
    description: 'Historic spa with Scottish hospitality',
    email: 'bookings@edinburghspa.co.uk',
    priceRange: { min: 140, max: 650 },
    servicesCount: 15,
    branches: generateBranches('biz-26', 'Edinburgh Royal Spa', 55.9533, -3.1883, 'Princes Street', 'Princes Street', undefined)
  },
  {
    id: 'biz-27',
    name: 'Old Town Hair Studio',
    country: 'GB',
    city: 'Edinburgh',
    region: 'Princes Street',
    coordinates: { lat: 55.9486, lng: -3.1878 },
    address: 'Royal Mile',
    rating: 4.5,
    categories: ['Hair Care', 'Beauty'],
    description: 'Traditional and modern hair services',
    email: 'book@oldtownhair.co.uk',
    priceRange: { min: 110, max: 420 },
    servicesCount: 11,
    branches: generateBranches('biz-27', 'Old Town Hair Studio', 55.9486, -3.1878, 'Princes Street', 'Royal Mile', undefined)
  },

  // Additional businesses for diversity
  {
    id: 'biz-28',
    name: 'Sharjah Wellness Oasis',
    country: 'AE',
    city: 'Sharjah',
    region: 'Al Majaz',
    coordinates: { lat: 25.3463, lng: 55.4209 },
    address: 'Al Majaz, Sharjah',
    rating: 4.6,
    categories: ['Spa & Wellness'],
    description: 'Peaceful wellness retreat in Sharjah',
    email: 'info@sharjahwellness.ae',
    priceRange: { min: 130, max: 550 },
    servicesCount: 13,
    branches: generateBranches('biz-28', 'Sharjah Wellness Oasis', 25.3463, 55.4209, 'Al Majaz', 'Al Majaz, Sharjah', undefined)
  },
  {
    id: 'biz-29',
    name: 'Ajman Beach Spa',
    country: 'AE',
    city: 'Ajman',
    region: 'Corniche',
    coordinates: { lat: 25.4052, lng: 55.5136 },
    address: 'Ajman Corniche',
    rating: 4.4,
    categories: ['Spa & Wellness', 'Massage'],
    description: 'Beachfront spa with ocean views',
    email: 'relax@ajmanbeachspa.ae',
    priceRange: { min: 120, max: 500 },
    servicesCount: 12,
    branches: generateBranches('biz-29', 'Ajman Beach Spa', 25.4052, 55.5136, 'Corniche', 'Ajman Corniche', undefined)
  },
  {
    id: 'biz-30',
    name: 'Dammam Dental Center',
    country: 'SA',
    city: 'Dammam',
    region: 'Al Shati',
    coordinates: { lat: 26.4207, lng: 50.0888 },
    address: 'King Fahd Road, Dammam',
    rating: 4.7,
    categories: ['Healthcare', 'Dental'],
    description: 'Advanced dental care in Eastern Province',
    email: 'appointments@dammamdental.sa',
    priceRange: { min: 180, max: 1600 },
    servicesCount: 17,
    branches: generateBranches('biz-30', 'Dammam Dental Center', 26.4207, 50.0888, 'Al Shati', 'King Fahd Road, Dammam', undefined)
  },
  {
    id: 'biz-31',
    name: 'Mecca Wellness Spa',
    country: 'SA',
    city: 'Mecca',
    region: 'Aziziyah',
    coordinates: { lat: 21.3891, lng: 39.8579 },
    address: 'Aziziyah, Mecca',
    rating: 4.5,
    categories: ['Spa & Wellness'],
    description: 'Rejuvenating spa treatments in the holy city',
    email: 'info@meccawellness.sa',
    priceRange: { min: 150, max: 600 },
    servicesCount: 11,
    branches: generateBranches('biz-31', 'Mecca Wellness Spa', 21.3891, 39.8579, 'Aziziyah', 'Aziziyah, Mecca', undefined)
  },
  {
    id: 'biz-32',
    name: 'Luxor Beauty Palace',
    country: 'EG',
    city: 'Luxor',
    region: 'East Bank',
    coordinates: { lat: 25.6872, lng: 32.6396 },
    address: 'Corniche Road, Luxor',
    rating: 4.3,
    categories: ['Hair Care', 'Beauty'],
    description: 'Beauty services in the historic city of Luxor',
    email: 'book@luxorbeauty.eg',
    priceRange: { min: 45, max: 280 },
    servicesCount: 9,
    branches: generateBranches('biz-32', 'Luxor Beauty Palace', 25.6872, 32.6396, 'East Bank', 'Corniche Road, Luxor', undefined)
  }
]

// Helper function to enrich business with full details (services, branches, staff)
export function getBusinessWithDetails(businessId: string): BusinessLocation | null {
  const business = MOCK_BUSINESSES.find(b => b.id === businessId)
  if (!business) return null

  // Generate services based on categories
  const services: Service[] = []
  const serviceCategories = business.categories

  if (serviceCategories.includes('Spa & Wellness') || serviceCategories.includes('Massage')) {
    services.push(
      {
        id: `${businessId}-service-1`,
        name: 'Full Body Massage',
        description: 'Relaxing full body massage with aromatherapy',
        location: business.name,
        price: Math.round(business.priceRange.min * 1.2),
        duration: 60,
        businessId: businessId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `${businessId}-service-2`,
        name: 'Deep Tissue Massage',
        description: 'Therapeutic deep tissue massage',
        location: business.name,
        price: Math.round(business.priceRange.min * 1.5),
        duration: 90,
        businessId: businessId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `${businessId}-service-3`,
        name: 'Hot Stone Therapy',
        description: 'Relaxing hot stone massage therapy',
        location: business.name,
        price: Math.round(business.priceRange.max * 0.7),
        duration: 75,
        businessId: businessId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    )
  }

  if (serviceCategories.includes('Hair Care')) {
    services.push(
      {
        id: `${businessId}-service-4`,
        name: 'Haircut & Styling',
        description: 'Professional haircut with styling',
        location: business.name,
        price: Math.round(business.priceRange.min * 1.3),
        duration: 45,
        businessId: businessId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `${businessId}-service-5`,
        name: 'Hair Coloring',
        description: 'Professional hair coloring service',
        location: business.name,
        price: Math.round(business.priceRange.max * 0.6),
        duration: 120,
        businessId: businessId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `${businessId}-service-6`,
        name: 'Hair Treatment',
        description: 'Deep conditioning hair treatment',
        location: business.name,
        price: Math.round(business.priceRange.min * 1.4),
        duration: 60,
        businessId: businessId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    )
  }

  if (serviceCategories.includes('Beauty')) {
    services.push(
      {
        id: `${businessId}-service-7`,
        name: 'Facial Treatment',
        description: 'Rejuvenating facial treatment',
        location: business.name,
        price: Math.round(business.priceRange.min * 1.6),
        duration: 60,
        businessId: businessId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `${businessId}-service-8`,
        name: 'Makeup Service',
        description: 'Professional makeup application',
        location: business.name,
        price: Math.round(business.priceRange.max * 0.5),
        duration: 45,
        businessId: businessId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    )
  }

  if (serviceCategories.includes('Nail Care')) {
    services.push(
      {
        id: `${businessId}-service-9`,
        name: 'Manicure',
        description: 'Professional manicure service',
        location: business.name,
        price: Math.round(business.priceRange.min),
        duration: 30,
        businessId: businessId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `${businessId}-service-10`,
        name: 'Pedicure',
        description: 'Professional pedicure service',
        location: business.name,
        price: Math.round(business.priceRange.min * 1.1),
        duration: 45,
        businessId: businessId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    )
  }

  if (serviceCategories.includes('Dental') || serviceCategories.includes('Healthcare')) {
    services.push(
      {
        id: `${businessId}-service-11`,
        name: 'Dental Checkup',
        description: 'Comprehensive dental examination',
        location: business.name,
        price: Math.round(business.priceRange.min),
        duration: 30,
        businessId: businessId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `${businessId}-service-12`,
        name: 'Teeth Cleaning',
        description: 'Professional teeth cleaning',
        location: business.name,
        price: Math.round(business.priceRange.min * 1.5),
        duration: 45,
        businessId: businessId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `${businessId}-service-13`,
        name: 'Teeth Whitening',
        description: 'Professional teeth whitening treatment',
        location: business.name,
        price: Math.round(business.priceRange.max * 0.4),
        duration: 60,
        businessId: businessId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    )
  }

  if (serviceCategories.includes('Fitness') || serviceCategories.includes('Personal Training')) {
    services.push(
      {
        id: `${businessId}-service-14`,
        name: 'Personal Training Session',
        description: 'One-on-one personal training',
        location: business.name,
        price: Math.round(business.priceRange.min * 1.5),
        duration: 60,
        businessId: businessId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `${businessId}-service-15`,
        name: 'Group Fitness Class',
        description: 'High-energy group fitness class',
        location: business.name,
        price: Math.round(business.priceRange.min),
        duration: 45,
        businessId: businessId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    )
  }

  // Generate branches (1-3 per business)
  const branches: Branch[] = [
    {
      id: `${businessId}-branch-1`,
      name: `${business.region} - Main Branch`,
      address: business.address,
      mobile: business.phone || '+20-123-456-7890',
      businessId: businessId,
      latitude: business.coordinates.lat,
      longitude: business.coordinates.lng,
      staff: [
        {
          id: `${businessId}-staff-1`,
          name: 'Ahmed Hassan',
          mobile: '+20-111-111-1111',
          branchId: `${businessId}-branch-1`,
          businessId: businessId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: `${businessId}-staff-2`,
          name: 'Sara Mohamed',
          mobile: '+20-222-222-2222',
          branchId: `${businessId}-branch-1`,
          businessId: businessId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  // Add second branch for larger businesses
  if (business.servicesCount > 15) {
    branches.push({
      id: `${businessId}-branch-2`,
      name: `${business.region} - Branch 2`,
      address: `${business.address} - Branch 2`,
      mobile: business.phone?.replace(/\d$/, '1') || '+20-123-456-7891',
      businessId: businessId,
      latitude: business.coordinates.lat + 0.01,
      longitude: business.coordinates.lng + 0.01,
      staff: [
        {
          id: `${businessId}-staff-3`,
          name: 'Mona Ali',
          mobile: '+20-333-333-3333',
          branchId: `${businessId}-branch-2`,
          businessId: businessId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      galleryUrls: [
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
        'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  // Generate reviews
  const reviews = [
    {
      id: `${businessId}-review-1`,
      rating: 5,
      comment: 'Excellent service! Very professional and welcoming staff.',
      user: { firstName: 'John', lastName: 'Smith' },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: `${businessId}-review-2`,
      rating: 4,
      comment: 'Great experience overall. Will definitely come back.',
      user: { firstName: 'Emma', lastName: 'Johnson' },
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: `${businessId}-review-3`,
      rating: 5,
      comment: 'Outstanding quality and attention to detail. Highly recommend!',
      user: { firstName: 'Michael', lastName: 'Brown' },
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  return {
    ...business,
    approved: true,
    socialLinks: [
      { platform: 'facebook', url: `https://facebook.com/${business.name.toLowerCase().replace(/\s+/g, '')}` },
      { platform: 'instagram', url: `https://instagram.com/${business.name.toLowerCase().replace(/\s+/g, '')}` }
    ],
    services,
    fullBranches: branches,
    reviews
  }
}
