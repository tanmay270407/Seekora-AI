/**
 * Authentication Service for Seekora AI
 *
 * Exclusively powered by Supabase Auth:
 * - signUp, signInWithPassword, signOut, resetPasswordForEmail
 * - getSession, onAuthStateChange
 * - Safe user-friendly error translation (Section 14)
 * - Zero mock/fake authentication (Section 16)
 * - Zero password storage in custom tables (Section 17)
 */

import { supabase, isSupabaseConfigured, supabaseConfigError } from '../lib/supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
  user?: AuthUser;
  session?: Session | null;
  requiresEmailConfirmation?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatAuthError(error: AuthError | Error | null): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const msg = (error.message || '').toLowerCase();

  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Invalid email or password.';
  }
  if (msg.includes('email not confirmed') || msg.includes('not verified')) {
    return 'Please confirm your email before signing in.';
  }
  if (msg.includes('already registered') || msg.includes('already in use') || msg.includes('unique constraint')) {
    return 'An account with this email already exists.';
  }
  if (msg.includes('password') && (msg.includes('weak') || msg.includes('short') || msg.includes('characters'))) {
    return 'Please choose a stronger password (at least 8 characters).';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('connection')) {
    return 'Unable to connect right now. Please check your network and try again.';
  }

  return 'Unable to complete authentication. Please try again.';
}

export const authService = {
  /**
   * Validate Sign In fields
   */
  validateSignIn(data: SignInCredentials): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!data.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(data.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!data.password) {
      errors.password = 'Password is required.';
    }

    return errors;
  },

  /**
   * Validate Sign Up fields
   */
  validateSignUp(data: SignUpCredentials): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!data.fullName.trim()) {
      errors.fullName = 'Full name is required.';
    }

    if (!data.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(data.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!data.password) {
      errors.password = 'Password is required.';
    } else if (data.password.length < 8) {
      errors.password = 'Password must contain at least 8 characters.';
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = 'Confirm your password.';
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    return errors;
  },

  /**
   * Real Supabase Sign Up
   */
  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    const errors = this.validateSignUp(credentials);
    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    if (!isSupabaseConfigured) {
      return {
        success: false,
        errors: { form: supabaseConfigError || 'Supabase configuration is missing.' },
      };
    }

    try {
      const email = credentials.email.trim().toLowerCase();
      const fullName = credentials.fullName.trim();

      const { data, error } = await supabase.auth.signUp({
        email,
        password: credentials.password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        return {
          success: false,
          errors: {
            form: formatAuthError(error),
          },
        };
      }

      if (data?.user) {
        // If email confirmation is enabled, session will be null
        const requiresEmailConfirmation = !data.session;

        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: data.user.user_metadata?.full_name || fullName,
        };

        return {
          success: true,
          requiresEmailConfirmation,
          user: authUser,
          session: data.session,
          message: requiresEmailConfirmation
            ? 'Account created. Please check your email to confirm your account.'
            : 'Account created successfully.',
        };
      }

      return {
        success: false,
        errors: { form: 'Unable to create account. Please try again.' },
      };
    } catch (err: any) {
      console.error('Supabase signUp exception:', err);
      return {
        success: false,
        errors: { form: formatAuthError(err) },
      };
    }
  },

  /**
   * Real Supabase Sign In
   */
  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    const errors = this.validateSignIn(credentials);
    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    if (!isSupabaseConfigured) {
      return {
        success: false,
        errors: { form: supabaseConfigError || 'Supabase configuration is missing.' },
      };
    }

    try {
      const email = credentials.email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: credentials.password,
      });

      if (error) {
        return {
          success: false,
          errors: {
            form: formatAuthError(error),
          },
        };
      }

      if (data?.user && data?.session) {
        const fullName =
          data.user.user_metadata?.full_name ||
          data.user.email?.split('@')[0] ||
          'Pilot User';

        return {
          success: true,
          session: data.session,
          user: {
            id: data.user.id,
            email: data.user.email || email,
            fullName,
          },
        };
      }

      return {
        success: false,
        errors: { form: 'Invalid email or password.' },
      };
    } catch (err: any) {
      console.error('Supabase signIn exception:', err);
      return {
        success: false,
        errors: { form: formatAuthError(err) },
      };
    }
  },

  /**
   * Real Supabase Sign Out
   */
  async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
  },

  /**
   * Real Supabase Password Reset
   */
  async requestPasswordReset(email: string): Promise<AuthResponse> {
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      return {
        success: false,
        errors: { email: 'Please enter a valid email address.' },
      };
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
          redirectTo: `${window.location.origin}/settings`,
        });
      } catch (err) {
        console.warn('Password reset request error:', err);
      }
    }

    // Generic response per Section 13 (Never reveal whether an email exists)
    return {
      success: true,
      message: "If an account exists for this email, you'll receive a password reset link.",
    };
  },

  /**
   * Get Current Session from Supabase
   */
  async getInitialSession(): Promise<{ session: Session | null; user: AuthUser | null }> {
    if (!isSupabaseConfigured) {
      return { session: null, user: null };
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session?.user) {
        return { session: null, user: null };
      }

      const rawUser = data.session.user;
      let fullName = rawUser.user_metadata?.full_name || rawUser.email?.split('@')[0] || 'Pilot User';

      // Asynchronously fetch profile if present, but never block or fail on error
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', rawUser.id)
          .maybeSingle();

        if (profile?.full_name) {
          fullName = profile.full_name;
        }
      } catch {
        // Fallback to user_metadata
      }

      return {
        session: data.session,
        user: {
          id: rawUser.id,
          email: rawUser.email || '',
          fullName,
        },
      };
    } catch (err) {
      console.warn('getInitialSession exception:', err);
      return { session: null, user: null };
    }
  },

  /**
   * Update Profile in profiles table
   */
  async updateProfile(userId: string, fullName: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      });

      // Also update user metadata
      await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(
    callback: (event: string, session: Session | null, user: User | null) => void
  ) {
    if (!isSupabaseConfigured) {
      return { unsubscribe: () => {} };
    }
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session, session?.user || null);
    });
    return { unsubscribe: () => data.subscription.unsubscribe() };
  },
};
