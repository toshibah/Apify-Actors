
import { BusinessListing, MonitoringStats, Review, TrendPoint } from './types';

const GLOBAL_HISTORY: TrendPoint[] = [
  { month: 'May', rating: 4.1, reviews: 85 },
  { month: 'Jun', rating: 4.2, reviews: 92 },
  { month: 'Jul', rating: 4.3, reviews: 110 },
  { month: 'Aug', rating: 4.3, reviews: 125 },
  { month: 'Sep', rating: 4.4, reviews: 140 },
  { month: 'Oct', rating: 4.4, reviews: 145 },
];

export const MOCK_BUSINESSES: BusinessListing[] = [
  {
    id: '1',
    name: 'Gourmet Garden Bistro',
    address: '123 Culinary Ave, San Francisco, CA',
    phone: '(415) 555-0123',
    rating: 4.8,
    reviewCount: 1240,
    status: 'synced',
    lastUpdated: '2023-10-25T10:00:00Z',
    changes: [],
    coordinates: { lat: 37.7749, lng: -122.4194 },
    history: [
      { month: 'May', rating: 4.6, reviews: 1020 },
      { month: 'Jun', rating: 4.7, reviews: 1050 },
      { month: 'Jul', rating: 4.7, reviews: 1100 },
      { month: 'Aug', rating: 4.8, reviews: 1150 },
      { month: 'Sep', rating: 4.8, reviews: 1200 },
      { month: 'Oct', rating: 4.8, reviews: 1240 },
    ],
    hours: {
      monday: '09:00 - 21:00',
      tuesday: '09:00 - 21:00',
      wednesday: '09:00 - 21:00',
      thursday: '09:00 - 21:00',
      friday: '09:00 - 22:00',
      saturday: '10:00 - 22:00',
      sunday: '10:00 - 20:00',
    }
  },
  {
    id: '2',
    name: 'FitPulse Gym & Wellness',
    address: '456 Kinetic Blvd, San Francisco, CA',
    phone: '(415) 555-9876',
    rating: 4.2,
    reviewCount: 856,
    status: 'changed',
    lastUpdated: '2023-10-24T15:30:00Z',
    changes: ['Hours updated for Saturday', 'Phone number changed'],
    coordinates: { lat: 37.7833, lng: -122.4167 },
    history: [
      { month: 'May', rating: 4.0, reviews: 750 },
      { month: 'Jun', rating: 4.1, reviews: 780 },
      { month: 'Jul', rating: 4.1, reviews: 800 },
      { month: 'Aug', rating: 4.2, reviews: 820 },
      { month: 'Sep', rating: 4.2, reviews: 840 },
      { month: 'Oct', rating: 4.2, reviews: 856 },
    ],
    hours: {
      monday: '05:00 - 23:00',
      tuesday: '05:00 - 23:00',
      wednesday: '05:00 - 23:00',
      thursday: '05:00 - 23:00',
      friday: '05:00 - 23:00',
      saturday: '07:00 - 20:00',
      sunday: '08:00 - 18:00',
    }
  },
  {
    id: '3',
    name: 'TechHub Coworking',
    address: '789 Silicon Rd, San Francisco, CA',
    phone: '(415) 555-4433',
    rating: 3.5,
    reviewCount: 420,
    status: 'alert',
    lastUpdated: '2023-10-25T08:15:00Z',
    changes: ['Rating dropped from 3.7 to 3.5'],
    coordinates: { lat: 37.7510, lng: -122.4476 },
    history: [
      { month: 'May', rating: 3.8, reviews: 380 },
      { month: 'Jun', rating: 3.8, reviews: 390 },
      { month: 'Jul', rating: 3.7, reviews: 400 },
      { month: 'Aug', rating: 3.7, reviews: 410 },
      { month: 'Sep', rating: 3.6, reviews: 415 },
      { month: 'Oct', rating: 3.5, reviews: 420 },
    ],
    hours: {
      monday: '24 hours',
      tuesday: '24 hours',
      wednesday: '24 hours',
      thursday: '24 hours',
      friday: '24 hours',
      saturday: 'Closed',
      sunday: 'Closed',
    }
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    author: 'Sarah Jenkins',
    rating: 5,
    text: 'Absolutely loved the atmosphere here! The food was fresh and the service was impeccable.',
    date: '2 hours ago',
    sentiment: 'positive'
  },
  {
    id: 'r2',
    author: 'Michael Chen',
    rating: 2,
    text: 'I called three times and no one picked up. When I arrived, they told me the hours changed but Google said something else.',
    date: '1 day ago',
    sentiment: 'negative'
  },
  {
    id: 'r3',
    author: 'Emma Wilson',
    rating: 4,
    text: 'Great spot for coworking, but the coffee machine was broken today.',
    date: '3 days ago',
    sentiment: 'neutral'
  }
];

export const INITIAL_STATS: MonitoringStats = {
  totalBusinesses: 12,
  activeAlerts: 2,
  avgRating: 4.4,
  reviewsThisMonth: 145,
  history: GLOBAL_HISTORY
};
