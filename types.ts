
export enum SpoilageStatus {
  SAFE = 'SAFE',
  CAUTION = 'CAUTION',
  REJECT = 'REJECT'
}

export interface FoodAnalysisResult {
  risk_score: number;
  status: string;
  reason: string;
  handling_instruction: string;
  remaining_safe_hours: number; // New field from AI
}

export interface FoodInputData {
  name: string;
  isCooked: boolean;
  hoursSincePrep: number;
  storageTemp: number;
  quantity?: string;
}

export type UserRole = 'DONOR' | 'NGO';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
}

export interface DonationItem {
  id: string;
  foodName: string;
  quantity: string;
  riskScore: number;
  status: SpoilageStatus;
  postedAt: number; // Timestamp
  expiresAt: number; // Timestamp (calculated from remaining_safe_hours)
  donorId: string; // Changed from just name to ID for targeting notifications
  donorName: string;
  
  // Location Data
  pickupAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  
  // Claim Data
  claimedBy?: string; // NGO User ID
  claimedAt?: number;
  pickupEta?: string; // e.g. "30 mins"
  
  handlingInstructions: string;
}

export interface Notification {
  id: string;
  targetUserId: string | 'ALL_NGOS'; // Who is this for?
  message: string;
  isRead: boolean;
  timestamp: number;
  type: 'INFO' | 'SUCCESS' | 'ALERT';
}

export type FoodType = 'COOKED' | 'RAW' | 'PACKAGED' | 'DAIRY';

export interface NGO {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  acceptedTypes: FoodType[];
  phone: string;
}
