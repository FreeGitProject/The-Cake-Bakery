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
  caketype: 'cake' | 'pastries';
  type: 'contains egg' | 'eggless';
  prices: Price[];
  image: string[];
  reviews: Reviews[];
  averageRating: number;
  isAvailable: boolean;
}
