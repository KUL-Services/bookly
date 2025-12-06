export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  location: {
    latitude: number;
    longitude: number;
  };
  openingHours?: {
    Mon: string;
    Tue: string;
    Wed: string;
    Thu: string;
    Fri: string;
    Sat: string;
    Sun: string;
  };
  serviceIds?: string[]; // Services available at this branch
}

export interface Business {
  id: string;
  name: string;
  categories: string[];
  coverImage: string;
  galleryImages: string[];
  address: string;
  city: string;
  location: {
    latitude: number;
    longitude: number;
  };
  branches: Branch[];
  about: string;
  services: string[]; // Service IDs
  staff: string[]; // StaffMember IDs
  reviews: string[]; // Review IDs
  averageRating: number;
  totalRatings: number;
  openingHours: {
    [day: string]: string;
  };
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  businessId: string;
  color?: string; // Service-specific color for visual identification
}

export interface StaffSchedule {
  dayOfWeek: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  startTime: string; // Format: "09:00"
  endTime: string;   // Format: "17:00"
  isAvailable: boolean;
}

export interface StaffAppointment {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  serviceName: string;
  customerName: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
}

export type StaffType = 'dynamic' | 'static'

export interface RoomAssignment {
  roomId: string
  roomName: string
  dayOfWeek: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'
  startTime: string  // Format: "09:00"
  endTime: string    // Format: "17:00"
  serviceIds: string[]  // Services provided in this room during this time
}

export interface StaffMember {
  id: string;
  name: string;
  title: string;
  photo: string;
  businessId: string;
  branchId: string;

  // Staff scheduling type
  staffType?: StaffType;  // 'dynamic' = traditional appointment-based, 'static' = room/slot-based (default: 'dynamic')

  serviceIds?: string[];  // Services this staff can provide
  schedule?: StaffSchedule[];
  workingHours?: string;  // Simplified display format (e.g., "9:00 AM-5:00 PM")
  appointments?: StaffAppointment[];
  maxConcurrentBookings?: number; // Maximum overlapping appointments (default 1, only applies to dynamic staff)
  color?: string;  // For calendar color coding

  // Room assignments (for static staff)
  roomAssignments?: RoomAssignment[];  // When static staff are assigned to work in specific rooms
  email?: string;
  phone?: string;
  isActive?: boolean;
}

export interface Review {
  id: string;
  authorName: string;
  authorImage: string;
  rating: number; // 1-5
  comment: string;
  date: Date;
  businessId: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

export interface SearchFilters {
  query?: string;
  location?: string;
  date?: Date;
  timeOfDay?: string[];
  sortBy?: "recommended" | "top-rated" | "closest";
  priceRange?: [number, number];
}

export interface Booking {
  id: string;
  businessId: string;
  branchId: string;
  branchName: string;
  businessName: string;
  businessImage: string;
  serviceName: string;
  staffMemberName: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  price: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  notes?: string;
  slotId?: string; // For static scheduling - links to a StaticServiceSlot
  roomId?: string; // For static scheduling - room assignment
  partySize?: number; // For group bookings (default 1)
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  memberSince: Date;
  totalBookings: number;
  favoriteBusinesses: string[];
}
