

export interface Mantra {
  id: string;
  text: string;
  meaning?: string;
  targetCount: number;
}

export interface MantraStats {
  mantraText: string;
  totalCount: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  lastLogin?: string;
}

export interface UserStats {
  totalChants: number;
  streakDays: number;
  lastChantedDate: string | null;
  mantraBreakdown: MantraStats[];
  isPremium: boolean;
}

export interface ReminderSettings {
  enabled: boolean;
  time: string;
}

export interface MemberHistoryEntry {
  date: string;
  count: number;
}

export interface Member {
  id: string;
  name: string;
  count: number;
  lastActive: string;
  history?: MemberHistoryEntry[];
}

export interface Announcement {
  id: string;
  text: string;
  date: string;
  authorName: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  mantra: Mantra;
  adminId: string;
  members: Member[];
  totalGroupCount: number;
  announcements: Announcement[];
  isPremium?: boolean;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  COUNTER = 'COUNTER',
  GROUPS = 'GROUPS',
  CREATE_GROUP = 'CREATE_GROUP',
}

export interface AIResponse {
  text: string;
}

export interface PracticePreferences {
  sound: 'TEMPLE_BELL' | 'WOODEN_MALA' | 'RAIN_FALL' | 'SILENCE';
  // Fix: Added 'RAIN_FALL' to ambianceSound to fix comparison and assignment errors in MantraCounter.tsx
  ambianceSound: 'DEEP_OM' | 'MORNING_BIRDS' | 'FOREST_WIND' | 'RAIN_FALL' | 'OFF';
  hapticStrength: 'SOFT' | 'MEDIUM' | 'STRONG' | 'OFF';
  lowLightMode: boolean;
}