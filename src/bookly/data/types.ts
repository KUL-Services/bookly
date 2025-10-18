export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  location: {
    latitude: number;
    longitude: number;
  };
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

export interface StaffMember {
  id: string;
  name: string;
  title: string;
  photo: string;
  businessId: string;
  branchId: string;
  schedule?: StaffSchedule[];
  appointments?: StaffAppointment[];
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
