"use client";
import { createContext, useContext, ReactNode } from "react";
import useSWR, { SWRConfiguration } from "swr";

interface HomeData {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  buttonText: string;
  buttonLink: string;
}

interface NewsItem {
  _id: string;
  title: string;
  date: string;
  description: string;
  imageUrl?: string;
}

interface AboutData {
  title: string;
  description: string[];
  imageUrl: string;
  founderName: string;
  foundedYear: number;
}

interface Price {
  weight: number;
  sellPrice: number;
}

interface Reviews {
  userId: string;
  rating: number;
}

interface Cake {
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
interface FooterData {
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
  interface CompanyInfo {
    companyName: string
    locations: Location[]
    socialMedia: SocialMedia
    delivery: Delivery
  }
  
  interface Location {
    name: string
    address: Address
    coordinates: Coordinates
    hours: Hours
    contact: Contact
    features: string[]
    specialHours: SpecialHours
  }
  
  interface Address {
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
  }
  
  interface Coordinates {
    lat: number
    lng: number
    mapUrl: string
  }
  
  interface Hours {
    weekdays: DayHours
    saturday: DayHours
    sunday: DayHours
  }
  
  interface DayHours {
    days: string
    open: string
    close: string
  }
  
  interface Contact {
    phone: string
    email: string
  }
  
  interface SpecialHours {
    festivals?: string
    holidays?: string
  }
  
  interface SocialMedia {
    instagram?: string
    facebook?: string
    twitter?: string
  }
  
  interface Delivery {
    radius: string
    minimumOrder: number
    partners: string[]
  }
interface DataContextProps {
  homeDataList: HomeData[] | [];
  news: NewsItem[] | [];
  aboutData: AboutData | null;
  footerData: FooterData | null;
  locationData: CompanyInfo | null;
  favorites: Cake[] | [];
  isLoading: boolean;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const swrOptions: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateIfStale: false,
  refreshInterval: 86400 * 1000, // 1 day
};

const useDataFetcher = () => {
  const { data: homeDataList, error: homeError } = useSWR<HomeData[]>("/api/home", fetcher, swrOptions);
  const { data: news, error: newsError } = useSWR<NewsItem[]>("/api/news", fetcher, swrOptions);
  const { data: aboutData, error: aboutError } = useSWR<AboutData>("/api/about", fetcher, swrOptions);
  const { data: footerData, error: footerError } = useSWR<FooterData>("/api/footer", fetcher, swrOptions);
  const { data: locationData, error: locationError } = useSWR<CompanyInfo>("/api/company-info", fetcher, swrOptions);
  const { data: favorites, error: favoritesError } = useSWR<Cake[]>("/api/favorites", fetcher, swrOptions);

  const isLoading = !homeDataList || !news || !aboutData || !footerData || !locationData || !favorites;

  if (homeError || newsError || aboutError || favoritesError || locationError || footerError ) {
    console.error("Error fetching data:", { homeError, newsError, aboutError,locationError,favoritesError });
  }

  return {
    homeDataList: homeDataList || [],
    news: news || [],
    aboutData: aboutData ?? null, // Ensure aboutData is null instead of undefined
    footerData: footerData ?? null, // Ensure footerData is null instead of undefined
    locationData: locationData ?? null, // Ensure footerData is null instead of undefined
    favorites: favorites || [],
    isLoading,
  };
};

export function DataProvider({ children }: { children: ReactNode }) {
  const data = useDataFetcher();

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
