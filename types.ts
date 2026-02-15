
export interface BusinessHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  aiResponseSuggestion?: string;
}

export interface TrendPoint {
  month: string;
  rating: number;
  reviews: number;
}

export interface BusinessListing {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  reviewCount: number;
  hours: BusinessHours;
  lastUpdated: string;
  status: 'synced' | 'changed' | 'alert';
  changes: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  distance?: number;
  history: TrendPoint[];
}

export interface MonitoringStats {
  totalBusinesses: number;
  activeAlerts: number;
  avgRating: number;
  reviewsThisMonth: number;
  history: TrendPoint[];
}
