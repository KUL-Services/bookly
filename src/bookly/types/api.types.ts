export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  location: { latitude: number; longitude: number };
}

export interface Business {
  id: string;
  name: string;
  categories: string[];
  coverImage: string;
  galleryImages: string[];
  address: string;
  city: string;
  location: { latitude: number; longitude: number };
  branches: Branch[];
  about: string;
  services: string[];
  staff: string[];
  reviews: string[];
  averageRating: number;
  totalRatings: number;
  openingHours: {
    [key: string]: string;
  };
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  businessId: string;
}

export interface StaffMember {
  id: string;
  name: string;
  title: string;
  photo: string;
  businessId: string;
  branchId: string;
}

export interface Review {
  id: string;
  authorName: string;
  authorImage: string;
  rating: number;
  comment: string;
  date: Date;
  businessId: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string;
  memberSince: Date;
  totalBookings: number;
  favoriteBusinesses: string[];
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
  duration: number;
  price: number;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  notes?: string;
}
