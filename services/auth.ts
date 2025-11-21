
import { UserProfile } from '../types';

const USERS_KEY = 'om_users';
const SESSION_KEY = 'om_session';

interface StoredUser extends UserProfile {
  passwordHash: string; // In a real app, never store plain text, here we simulate
}

export const authService = {
  // Simulate network delay
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  async register(name: string, email: string, password: string): Promise<UserProfile> {
    await this.delay(800);
    
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: StoredUser[] = usersStr ? JSON.parse(usersStr) : [];

    if (users.find(u => u.email === email)) {
      throw new Error("Email already registered");
    }

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: btoa(password) // Simple encoding for demo purposes
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login
    const profile: UserProfile = { id: newUser.id, name: newUser.name, email: newUser.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    return profile;
  },

  async login(email: string, password: string): Promise<UserProfile> {
    await this.delay(800);

    const usersStr = localStorage.getItem(USERS_KEY);
    const users: StoredUser[] = usersStr ? JSON.parse(usersStr) : [];
    
    const user = users.find(u => u.email === email && u.passwordHash === btoa(password));

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const profile: UserProfile = { id: user.id, name: user.name, email: user.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    return profile;
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser(): UserProfile | null {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  }
};
