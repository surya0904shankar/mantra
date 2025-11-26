
import { supabase } from '../lib/supabaseClient'; 
import { UserProfile } from '../types';

export const authService = {
  async loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  },

  async login(email: string, password: string): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (!data.user) throw new Error("Login failed");

    // Fetch profile details
    return await this.fetchUserProfile(data.user);
  },

  async register(name: string, email: string, password: string): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        }
      }
    });
    
    if (error) throw error;
    if (!data.user) throw new Error("Registration failed. Please check your email for verification.");

    return {
      id: data.user.id,
      name: name,
      email: email,
      lastLogin: new Date().toISOString()
    };
  },

  async logout() {
    await supabase.auth.signOut();
    localStorage.removeItem('om_session');
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    // v2 session retrieval
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    
    return await this.fetchUserProfile(session.user);
  },

  // Helper to fetch/construct profile from DB
  async fetchUserProfile(user: any): Promise<UserProfile> {
    // Try to get extended profile data from the 'profiles' table
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      // Use profile name if available, otherwise metadata from Google, otherwise email
      name: profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Meditator',
      email: user.email!,
      lastLogin: profile?.last_login || new Date().toISOString()
    };
  }
};
