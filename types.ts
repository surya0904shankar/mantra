
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
}

export interface UserStats {
  totalChants: number;
  streakDays: number;
  lastChantedDate: string | null;
  mantraBreakdown: MantraStats[];
  isPremium: boolean; // Added subscription status
}

export interface ReminderSettings {
  enabled: boolean;
  time: string;
}

export interface Member {
  id: string;
  name: string;
  count: number;
  lastActive: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  mantra: Mantra;
  adminId: string; // The user who created it
  members: Member[];
  totalGroupCount: number;
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
