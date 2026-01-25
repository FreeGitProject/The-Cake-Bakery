// Complete types for your cake shop from your DataContext
export interface HomeData {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  buttonText: string;
  buttonLink: string;
}

export interface NewsItem {
  _id: string;
  title: string;
  date: string;
  description: string;
  imageUrl?: string;
}

export interface AboutData {
  title: string;
  description: string[];
  imageUrl: string;
  founderName: string;
  foundedYear: number;
}

export interface Price {
  weight: number;
  sellPrice: number;
}

export interface Reviews {
  userId: string;
  rating: number;
}

export interface Cake {
  _id: string;
  name: string;
  description: string;
  caketype: "cake" | "pastries";
  type: "contains egg" | "eggless";
  prices: Price[];
  image: string[];
  reviews: Reviews[];
  averageRating: number;
  isAvailable: boolean;
}

export interface FooterData {
  companyName: string;
  description: string;
  email: string;
  phone: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
  }
}

export interface CompanyInfo {
  companyName: string
  locations: Location[]
  socialMedia: SocialMedia
  delivery: Delivery
}

export interface Location {
  name: string
  address: Address
  coordinates: Coordinates
  hours: Hours
  contact: Contact
  features: string[]
  specialHours: SpecialHours
}

export interface Address {
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
}

export interface Coordinates {
  lat: number
  lng: number
  mapUrl: string
}

export interface Hours {
  weekdays: DayHours
  saturday: DayHours
  sunday: DayHours
}

export interface DayHours {
  days: string
  open: string
  close: string
}

export interface Contact {
  phone: string
  email: string
}

export interface SpecialHours {
  festivals?: string
  holidays?: string
}

export interface SocialMedia {
  instagram?: string
  facebook?: string
  twitter?: string
}

export interface Delivery {
  radius: string
  minimumOrder: number
  partners: string[]
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
