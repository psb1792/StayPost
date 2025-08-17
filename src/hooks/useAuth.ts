import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 인증 상태 확인 함수
  const checkAuthStatus = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth 로그인 함수
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  // 테스트 계정 로그인 함수 (백업용)
  const signInWithTestAccount = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      });
      
      if (error) {
        // 계정이 없으면 회원가입 시도
        if (error.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: 'test@example.com',
            password: 'testpassword123'
          });
          if (signUpError) throw signUpError;
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error signing in with test account:', error);
      throw error;
    }
  };

  // 로그아웃 함수
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // 인증 상태 모니터링
  useEffect(() => {
    checkAuthStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithTestAccount,
    signOut,
    checkAuthStatus
  };
}
