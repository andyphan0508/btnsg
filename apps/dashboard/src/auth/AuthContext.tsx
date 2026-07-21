import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Profile } from '@btnsg/shared';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const DEMO_PROFILE: Profile = {
  id: 'demo-admin',
  email: 'demo@btnsg.local',
  fullName: 'Quản trị (demo)',
  role: 'admin',
  approved: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

type AuthContextValue = {
  /** Đang khôi phục phiên đăng nhập. */
  loading: boolean;
  /** Không có cấu hình Supabase — chạy demo/local, bỏ qua đăng nhập. */
  isDemo: boolean;
  isAuthenticated: boolean;
  profile: Profile | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (fullName: string, email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const fetchProfile = async (userId: string, email: string): Promise<Profile> => {
  const { data } = await supabase!.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (data) {
    return {
      id: data.id,
      email: data.email ?? email,
      fullName: data.full_name ?? email,
      role: data.role === 'admin' ? 'admin' : 'bdh',
      approved: Boolean(data.approved),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
  // Trigger tạo profile có thể chưa chạy xong — trả về hồ sơ chờ duyệt.
  return {
    id: userId,
    email,
    fullName: email,
    role: 'bdh',
    approved: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);
  const [profile, setProfile] = useState<Profile | null>(isSupabaseConfigured ? null : DEMO_PROFILE);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let cancelled = false;

    const syncFromSession = async () => {
      const { data } = await supabase!.auth.getSession();
      const session = data.session;
      if (cancelled) return;
      if (session?.user) {
        const loaded = await fetchProfile(session.user.id, session.user.email ?? '');
        if (!cancelled) setProfile(loaded);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    syncFromSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email ?? '').then((loaded) => {
          if (!cancelled) setProfile(loaded);
        });
      } else {
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return null;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message === 'Invalid login credentials' ? 'Email hoặc mật khẩu không đúng.' : error.message;
    return null;
  };

  const signUp = async (fullName: string, email: string, password: string): Promise<string | null> => {
    if (!supabase) return null;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return error.message;
    return null;
  };

  const signOut = async (): Promise<void> => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfile(null);
  };

  const refreshProfile = async (): Promise<void> => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      setProfile(await fetchProfile(data.session.user.id, data.session.user.email ?? ''));
    }
  };

  const value: AuthContextValue = {
    loading,
    isDemo: !isSupabaseConfigured,
    isAuthenticated: profile !== null,
    profile,
    isAdmin: profile?.role === 'admin',
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải dùng bên trong AuthProvider');
  return context;
};
