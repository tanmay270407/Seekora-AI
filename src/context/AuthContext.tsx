import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authService,
  AuthUser,
  SignInCredentials,
  SignUpCredentials,
  AuthResponse,
} from '../services/authService';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: SignInCredentials) => Promise<AuthResponse>;
  signUp: (credentials: SignUpCredentials) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updateProfile: (fullName: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initial Session Loading (Section 8)
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const { session: initSession, user: initUser } = await authService.getInitialSession();
        if (isMounted) {
          setSession(initSession);
          setUser(initUser);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Auth initialization error:', err);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    }

    initializeAuth();

    // Single central auth state listener (Section 9)
    const subscription = authService.onAuthStateChange(async (event, newSession, authUser) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setSession(newSession);
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            fullName:
              authUser.user_metadata?.full_name ||
              authUser.email?.split('@')[0] ||
              'Pilot User',
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (credentials: SignInCredentials): Promise<AuthResponse> => {
    const res = await authService.signIn(credentials);
    if (res.success && res.user && res.session) {
      setUser(res.user);
      setSession(res.session);
    }
    return res;
  }, []);

  const signUp = useCallback(async (credentials: SignUpCredentials): Promise<AuthResponse> => {
    const res = await authService.signUp(credentials);
    // For new users, ensure session is clear so they authenticate through /signin
    if (res.success) {
      await authService.signOut();
      setUser(null);
      setSession(null);
    }
    return res;
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    await authService.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<AuthResponse> => {
    return authService.requestPasswordReset(email);
  }, []);

  const updateProfile = useCallback(async (fullName: string): Promise<boolean> => {
    if (!user) return false;
    const ok = await authService.updateProfile(user.id, fullName);
    if (ok) {
      setUser((prev) => (prev ? { ...prev, fullName } : null));
    }
    return ok;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: Boolean(user && session),
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
