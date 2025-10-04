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
  categories: string[]
  description: string
  email: string
  phone?: string
  priceRange: {
    min: number
    max: number
  }
  servicesCount: number
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
    imageUrl: '/images/spa-dubai.jpg',
    categories: ['Spa & Wellness', 'Massage'],
    description: 'Premium spa services in the heart of Dubai with world-class therapists',
    email: 'info@luxuryspadubai.ae',
    phone: '+971-4-123-4567',
    priceRange: { min: 200, max: 800 },
    servicesCount: 15
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
    imageUrl: '/images/hair-dubai.jpg',
    categories: ['Hair Care', 'Beauty'],
    description: 'Cutting-edge hair styling and coloring by international stylists',
    email: 'book@elitehairstudio.ae',
    phone: '+971-4-234-5678',
    priceRange: { min: 150, max: 600 },
    servicesCount: 12
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
    categories: ['Healthcare', 'Dental'],
    description: 'State-of-the-art dental clinic with latest technology',
    email: 'appointments@dubaidental.ae',
    phone: '+971-4-345-6789',
    priceRange: { min: 300, max: 2000 },
    servicesCount: 18
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
    categories: ['Fitness', 'Personal Training'],
    description: 'Premium fitness center with personal trainers and group classes',
    email: 'hello@fitzonedubai.ae',
    priceRange: { min: 100, max: 500 },
    servicesCount: 20
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
    servicesCount: 14
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
    servicesCount: 10
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
    servicesCount: 16
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
    servicesCount: 15
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
    servicesCount: 18
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
    servicesCount: 13
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
    servicesCount: 14
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
    categories: ['Spa & Wellness', 'Massage'],
    description: 'Relaxation and wellness in the heart of Cairo',
    email: 'info@cairowellness.eg',
    priceRange: { min: 80, max: 400 },
    servicesCount: 12
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
    categories: ['Hair Care', 'Beauty', 'Nail Care'],
    description: 'Modern beauty salon in historic downtown',
    email: 'book@downtownbeauty.eg',
    priceRange: { min: 60, max: 350 },
    servicesCount: 14
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
    categories: ['Healthcare', 'Dental'],
    description: 'Comprehensive dental services with modern equipment',
    email: 'appointments@cairodental.eg',
    priceRange: { min: 100, max: 1200 },
    servicesCount: 16
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
    categories: ['Hair Care', 'Beauty'],
    description: 'Professional hair care and styling services in Nasr City',
    email: 'book@nasrhair.eg',
    priceRange: { min: 70, max: 400 },
    servicesCount: 13
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
    categories: ['Spa & Wellness', 'Massage'],
    description: 'Luxurious spa experience in Cairo\'s premier mall',
    email: 'info@citystarsspa.eg',
    priceRange: { min: 120, max: 550 },
    servicesCount: 18
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
    categories: ['Fitness', 'Personal Training'],
    description: 'Modern fitness center with certified trainers',
    email: 'join@nasrfitness.eg',
    priceRange: { min: 80, max: 450 },
    servicesCount: 20
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
    servicesCount: 15
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
    servicesCount: 18
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
    servicesCount: 16
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
    categories: ['Spa & Wellness'],
    description: 'Tranquil spa with Egyptian-inspired treatments in Dokki',
    email: 'info@dokkispa.eg',
    priceRange: { min: 75, max: 380 },
    servicesCount: 12
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
    categories: ['Hair Care', 'Beauty'],
    description: 'Professional hair salon in the heart of Dokki',
    email: 'book@dokkihair.eg',
    priceRange: { min: 55, max: 320 },
    servicesCount: 11
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
    categories: ['Healthcare', 'Dental'],
    description: 'Modern dental clinic with experienced dentists',
    email: 'appointments@dokkidental.eg',
    priceRange: { min: 90, max: 1100 },
    servicesCount: 14
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
    categories: ['Spa & Wellness', 'Massage'],
    description: 'Upscale spa with luxury treatments in Mohandeseen',
    email: 'info@mohandeseenspa.eg',
    priceRange: { min: 100, max: 500 },
    servicesCount: 16
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
    categories: ['Hair Care', 'Beauty', 'Nail Care'],
    description: 'Elite beauty salon in Mohandeseen',
    email: 'book@mohandeseenbeauty.eg',
    priceRange: { min: 70, max: 400 },
    servicesCount: 15
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
    servicesCount: 13
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
    servicesCount: 20
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
    servicesCount: 14
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
    servicesCount: 22
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
    servicesCount: 25
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
    servicesCount: 16
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
    servicesCount: 12
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
    servicesCount: 17
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
    servicesCount: 14
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
    servicesCount: 15
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
    servicesCount: 11
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
    servicesCount: 13
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
    servicesCount: 12
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
    servicesCount: 17
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
    servicesCount: 11
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
    servicesCount: 9
  }
]
