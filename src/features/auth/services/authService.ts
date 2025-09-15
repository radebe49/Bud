/**
 * Authentication service using Supabase
 */

import { supabase } from '../../../shared/services/supabaseClient';
import { 
  AuthUser, 
  LoginCredentials, 
  SignupCredentials, 
  AuthState 
} from '../types/authTypes';

class AuthService {
  private currentUser: AuthUser | null = null;

  // Convert Supabase user to our AuthUser type
  private mapSupabaseUser(supabaseUser: any): AuthUser {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
      createdAt: new Date(supabaseUser.created_at),
      lastLoginAt: new Date(supabaseUser.last_sign_in_at || supabaseUser.created_at)
    };
  }

  // Sign up new user
  async signup(credentials: SignupCredentials): Promise<AuthUser> {
    const { email, password, name } = credentials;

    try {
      // Check if Supabase is properly configured
      if (!process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL.includes('placeholder')) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name?.trim(),
            full_name: name?.trim(),
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Failed to create user account');
      }

      const newUser = this.mapSupabaseUser(data.user);
      this.currentUser = newUser;

      return newUser;
    } catch (error) {
      console.error('Signup error:', error);
      throw error instanceof Error ? error : new Error('Failed to create account');
    }
  }

  // Login existing user
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const { email, password } = credentials;

    try {
      // Check if Supabase is properly configured
      if (!process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL.includes('placeholder')) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Login failed');
      }

      const user = this.mapSupabaseUser(data.user);
      this.currentUser = user;

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error instanceof Error ? error : new Error('Failed to login');
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      this.currentUser = null;
    } catch (error) {
      console.error('Error during logout:', error);
      throw error instanceof Error ? error : new Error('Failed to logout');
    }
  }

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        this.currentUser = null;
        return null;
      }

      const authUser = this.mapSupabaseUser(user);
      this.currentUser = authUser;
      return authUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      this.currentUser = null;
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error instanceof Error ? error : new Error('Failed to send reset email');
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<Pick<AuthUser, 'name'>>): Promise<AuthUser> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
          full_name: updates.name,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = this.mapSupabaseUser(data.user);
      this.currentUser = updatedUser;

      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error instanceof Error ? error : new Error('Failed to update profile');
    }
  }

  // Delete account
  async deleteAccount(): Promise<void> {
    try {
      // Note: Supabase doesn't have a direct delete user method in the client
      // This would typically be handled by a server-side function
      // For now, we'll just sign out the user
      await this.logout();
      
      // In a production app, you'd call a server function to delete the user
      console.warn('Account deletion requires server-side implementation');
    } catch (error) {
      console.error('Account deletion error:', error);
      throw error instanceof Error ? error : new Error('Failed to delete account');
    }
  }

  // Get auth state
  async getAuthState(): Promise<AuthState> {
    try {
      const user = await this.getCurrentUser();
      return {
        user,
        isAuthenticated: user !== null,
        isLoading: false,
        error: null
      };
    } catch (error) {
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication error'
      };
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const user = this.mapSupabaseUser(session.user);
        this.currentUser = user;
        callback(user);
      } else {
        this.currentUser = null;
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();