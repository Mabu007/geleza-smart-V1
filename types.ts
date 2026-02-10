export interface UserProfile {
  uid: string;
  displayName: string;
  gradeLevel: string;
  favoredCelebrity: string;
  dreamJob: string;
  hobby: string;
  bio: string;
  isProfileComplete: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  timestamp: number;
}

export interface OnboardingData {
  gradeLevel: string;
  favoredCelebrity: string;
  dreamJob: string;
  hobby: string;
  bio: string;
}
