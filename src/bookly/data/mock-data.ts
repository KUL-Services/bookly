import { Business, Service, StaffMember, Review, Category, Booking, User } from './types'

export const categories: Category[] = [
  { id: '1', name: 'Hair', icon: '✂️', slug: 'hair' },
  { id: '2', name: 'Nails', icon: '💅', slug: 'nails' },
  { id: '3', name: 'Face', icon: '✨', slug: 'face' },
  { id: '4', name: 'Body', icon: '💆', slug: 'body' },
  { id: '5', name: 'Barber', icon: '🪒', slug: 'barber' },
  { id: '6', name: 'Massage', icon: '👐', slug: 'massage' }
]

export const mockBusinesses: Business[] = [
  {
    id: '1',
    name: 'Luxe Hair Studio',
    categories: ['1'],
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=400&fit=crop'
    ],
    address: '123 Oxford Street',
    city: 'London',
    location: { latitude: 51.5074, longitude: -0.1278 },
    about: 'Premium hair salon offering cutting-edge styles and treatments in the heart of London.',
    services: ['1', '2', '3'],
    staff: ['1', '2', '7'],
    reviews: ['1', '2'],
    averageRating: 4.8,
    totalRatings: 127,
    openingHours: {
      Mon: '9:00 AM - 7:00 PM',
      Tue: '9:00 AM - 7:00 PM',
      Wed: '9:00 AM - 7:00 PM',
      Thu: '9:00 AM - 8:00 PM',
      Fri: '9:00 AM - 8:00 PM',
      Sat: '8:00 AM - 6:00 PM',
      Sun: '10:00 AM - 5:00 PM'
    }
  },
  {
    id: '2',
    name: 'Bliss Nail Bar',
    categories: ['2'],
    coverImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop'
    ],
    address: "456 King's Road",
    city: 'London',
    location: { latitude: 51.4875, longitude: -0.1687 },
    about: 'Modern nail salon specializing in gel manicures, nail art, and luxury pedicures.',
    services: ['4', '5'],
    staff: ['3', '4'],
    reviews: ['3'],
    averageRating: 4.6,
    totalRatings: 89,
    openingHours: {
      Mon: '10:00 AM - 8:00 PM',
      Tue: '10:00 AM - 8:00 PM',
      Wed: '10:00 AM - 8:00 PM',
      Thu: '10:00 AM - 9:00 PM',
      Fri: '10:00 AM - 9:00 PM',
      Sat: '9:00 AM - 7:00 PM',
      Sun: '11:00 AM - 6:00 PM'
    }
  },
  {
    id: '3',
    name: 'Urban Barber Co.',
    categories: ['3'],
    coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop'
    ],
    address: '789 Shoreditch High Street',
    city: 'London',
    location: { latitude: 51.5223, longitude: -0.0813 },
    about: 'Traditional barbering with a modern twist. Specialists in classic cuts and hot towel shaves.',
    services: ['6', '7'],
    staff: ['5', '6'],
    reviews: ['4', '5'],
    averageRating: 4.9,
    totalRatings: 156,
    openingHours: {
      Mon: '8:00 AM - 7:00 PM',
      Tue: '8:00 AM - 7:00 PM',
      Wed: '8:00 AM - 7:00 PM',
      Thu: '8:00 AM - 8:00 PM',
      Fri: '8:00 AM - 8:00 PM',
      Sat: '8:00 AM - 6:00 PM',
      Sun: 'Closed'
    }
  }
]

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Haircut & Style',
    description: 'Professional cut and styling',
    price: 65,
    duration: 60,
    category: 'Haircut',
    businessId: '1'
  },
  {
    id: '2',
    name: 'Color Treatment',
    description: 'Full color service',
    price: 120,
    duration: 120,
    category: 'Coloring',
    businessId: '1'
  },
  {
    id: '3',
    name: 'Highlights',
    description: 'Partial highlights',
    price: 85,
    duration: 90,
    category: 'Coloring',
    businessId: '1'
  },
  {
    id: '4',
    name: 'Gel Manicure',
    description: 'Long-lasting gel polish',
    price: 35,
    duration: 45,
    category: 'Manicure',
    businessId: '2'
  },
  {
    id: '5',
    name: 'Luxury Pedicure',
    description: 'Full pedicure with massage',
    price: 45,
    duration: 60,
    category: 'Pedicure',
    businessId: '2'
  },
  {
    id: '6',
    name: 'Classic Cut',
    description: 'Traditional barber cut',
    price: 25,
    duration: 30,
    category: 'Haircut',
    businessId: '3'
  },
  {
    id: '7',
    name: 'Hot Towel Shave',
    description: 'Traditional wet shave',
    price: 30,
    duration: 45,
    category: 'Shave',
    businessId: '3'
  }
]

export const mockStaff: StaffMember[] = [
  {
    id: '1',
    name: 'Emma Johnson',
    title: 'Senior Stylist',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b077?w=150&h=150&fit=crop&crop=face',
    businessId: '1'
  },
  {
    id: '2',
    name: 'Sarah Williams',
    title: 'Color Specialist',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    businessId: '1'
  },
  {
    id: '3',
    name: 'Lisa Chen',
    title: 'Nail Artist',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    businessId: '2'
  },
  {
    id: '4',
    name: 'Maria Garcia',
    title: 'Senior Nail Technician',
    photo: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
    businessId: '2'
  },
  {
    id: '5',
    name: 'James Mitchell',
    title: 'Master Barber',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    businessId: '3'
  },
  {
    id: '6',
    name: 'David Brown',
    title: 'Barber',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    businessId: '3'
  },
  {
    id: '7',
    name: 'Alex Thompson',
    title: 'Junior Stylist',
    photo: '', // Empty photo to demonstrate initials
    businessId: '1'
  }
]

export const mockReviews: Review[] = [
  {
    id: '1',
    authorName: 'Sophie Turner',
    authorImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face',
    rating: 5,
    comment: 'Amazing service! Emma did an incredible job with my highlights.',
    date: new Date('2024-01-15'),
    businessId: '1'
  },
  {
    id: '2',
    authorName: 'Kate Wilson',
    authorImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50&h=50&fit=crop&crop=face',
    rating: 5,
    comment: "Best haircut I've ever had! Will definitely be back.",
    date: new Date('2024-01-12'),
    businessId: '1'
  },
  {
    id: '3',
    authorName: 'Rachel Green',
    authorImage: 'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=50&h=50&fit=crop&crop=face',
    rating: 4,
    comment: 'Great nail art! Lisa is very talented.',
    date: new Date('2024-01-10'),
    businessId: '2'
  },
  {
    id: '4',
    authorName: 'John Smith',
    authorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
    rating: 5,
    comment: 'Perfect cut and shave. James knows his craft.',
    date: new Date('2024-01-08'),
    businessId: '3'
  },
  {
    id: '5',
    authorName: 'Michael Davis',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
    rating: 5,
    comment: 'Old school barbering at its finest. Highly recommend!',
    date: new Date('2024-01-05'),
    businessId: '3'
  }
]

export const mockUser: User = {
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+44 7700 900123',
  profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  memberSince: new Date('2023-03-15'),
  totalBookings: 8,
  favoriteBusinesses: ['1', '2']
}

export const mockBookings: Booking[] = [
  // Upcoming bookings
  {
    id: 'booking-1',
    businessId: '1',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Haircut & Style',
    staffMemberName: 'Emma Johnson',
    date: new Date('2025-11-25'),
    time: '2:00 PM',
    duration: 60,
    price: 65,
    status: 'confirmed',
    notes: 'Please trim split ends and add light layers'
  },
  {
    id: 'booking-2',
    businessId: '2',
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Gel Manicure',
    staffMemberName: 'Lisa Chen',
    date: new Date('2025-10-28'),
    time: '11:00 AM',
    duration: 45,
    price: 35,
    status: 'confirmed'
  },
  {
    id: 'booking-3',
    businessId: '3',
    businessName: 'Urban Barber Co.',
    businessImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    serviceName: 'Classic Cut',
    staffMemberName: 'James Mitchell',
    date: new Date('2025-10-02'),
    time: '4:30 PM',
    duration: 30,
    price: 25,
    status: 'pending'
  },

  // Past bookings
  {
    id: 'booking-4',
    businessId: '1',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Color Treatment',
    staffMemberName: 'Sarah Williams',
    date: new Date('2024-12-15'),
    time: '10:00 AM',
    duration: 120,
    price: 120,
    status: 'completed',
    notes: 'Full highlights with root touch-up'
  },
  {
    id: 'booking-5',
    businessId: '2',
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Luxury Pedicure',
    staffMemberName: 'Maria Garcia',
    date: new Date('2024-12-08'),
    time: '3:00 PM',
    duration: 60,
    price: 45,
    status: 'completed'
  },
  {
    id: 'booking-6',
    businessId: '1',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Haircut & Style',
    staffMemberName: 'Emma Johnson',
    date: new Date('2024-11-22'),
    time: '1:30 PM',
    duration: 60,
    price: 65,
    status: 'completed'
  },
  {
    id: 'booking-7',
    businessId: '3',
    businessName: 'Urban Barber Co.',
    businessImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    serviceName: 'Hot Towel Shave',
    staffMemberName: 'David Brown',
    date: new Date('2024-11-10'),
    time: '5:00 PM',
    duration: 45,
    price: 30,
    status: 'completed'
  },
  {
    id: 'booking-8',
    businessId: '2',
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Gel Manicure',
    staffMemberName: 'Lisa Chen',
    date: new Date('2024-10-28'),
    time: '12:00 PM',
    duration: 45,
    price: 35,
    status: 'cancelled',
    notes: 'Cancelled due to scheduling conflict'
  },
  // Current month (September 2025)
  {
    id: 'booking-9',
    businessId: '1',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Highlights',
    staffMemberName: 'Sarah Williams',
    date: new Date('2025-09-10'),
    time: '3:00 PM',
    duration: 90,
    price: 85,
    status: 'completed',
    notes: 'Partial highlights for autumn look'
  },
  {
    id: 'booking-10',
    businessId: '2',
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Luxury Pedicure',
    staffMemberName: 'Maria Garcia',
    date: new Date('2025-09-18'),
    time: '2:00 PM',
    duration: 60,
    price: 45,
    status: 'confirmed'
  },
  {
    id: 'booking-15',
    businessId: '2',
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Gel Manicure',
    staffMemberName: 'Lisa Chen',
    date: new Date('2025-09-21'),
    time: '9:00 AM',
    duration: 45,
    price: 35,
    status: 'completed',
    notes: 'Special nail art for event'
  },
  {
    id: 'booking-19',
    businessId: '1',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Highlights',
    staffMemberName: 'Sarah Williams',
    date: new Date('2025-09-30'),
    time: '1:00 PM',
    duration: 90,
    price: 85,
    status: 'confirmed',
    notes: 'Blonde highlights refresh'
  },
  // Past month (August 2025)
  {
    id: 'booking-11',
    businessId: '3',
    businessName: 'Urban Barber Co.',
    businessImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    serviceName: 'Hot Towel Shave',
    staffMemberName: 'David Brown',
    date: new Date('2025-08-22'),
    time: '5:30 PM',
    duration: 45,
    price: 30,
    status: 'completed',
    notes: 'Classic shave before holiday'
  },
  {
    id: 'booking-12',
    businessId: '2',
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Gel Manicure',
    staffMemberName: 'Lisa Chen',
    date: new Date('2025-08-29'),
    time: '10:00 AM',
    duration: 45,
    price: 35,
    status: 'cancelled',
    notes: 'Client cancelled due to illness'
  },
  {
    id: 'booking-17',
    businessId: '3',
    businessName: 'Urban Barber Co.',
    businessImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    serviceName: 'Hot Towel Shave',
    staffMemberName: 'David Brown',
    date: new Date('2025-08-15'),
    time: '2:00 PM',
    duration: 45,
    price: 30,
    status: 'completed',
    notes: 'Pre-wedding grooming'
  },
  // Upcoming month (October 2025)
  {
    id: 'booking-13',
    businessId: '1',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Color Treatment',
    staffMemberName: 'Sarah Williams',
    date: new Date('2025-10-05'),
    time: '1:00 PM',
    duration: 120,
    price: 120,
    status: 'pending',
    notes: 'Full color refresh for fall'
  },
  {
    id: 'booking-14',
    businessId: '3',
    businessName: 'Urban Barber Co.',
    businessImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    serviceName: 'Classic Cut',
    staffMemberName: 'James Mitchell',
    date: new Date('2025-10-15'),
    time: '6:00 PM',
    duration: 30,
    price: 25,
    status: 'confirmed'
  },
  {
    id: 'booking-16',
    businessId: '1',
    businessName: 'Luxe Hair Studio',
    businessImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    serviceName: 'Haircut & Style',
    staffMemberName: 'Emma Johnson',
    date: new Date('2025-10-03'),
    time: '10:00 AM',
    duration: 60,
    price: 65,
    status: 'confirmed',
    notes: 'Layered cut for new look'
  },
  {
    id: 'booking-18',
    businessId: '2',
    businessName: 'Bliss Nail Bar',
    businessImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    serviceName: 'Luxury Pedicure',
    staffMemberName: 'Maria Garcia',
    date: new Date('2025-10-20'),
    time: '5:00 PM',
    duration: 60,
    price: 45,
    status: 'pending',
    notes: 'Spa pedicure for relaxation'
  },
  {
    id: 'booking-20',
    businessId: '3',
    businessName: 'Urban Barber Co.',
    businessImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
    serviceName: 'Classic Cut',
    staffMemberName: 'James Mitchell',
    date: new Date('2025-10-25'),
    time: '3:00 PM',
    duration: 30,
    price: 25,
    status: 'pending',
    notes: 'Trim before business trip'
  }
]
