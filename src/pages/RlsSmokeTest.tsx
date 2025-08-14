import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function RlsSmokeTest() {
  const [msg, setMsg] = useState<string>('idle');
  const [user, setUser] = useState<any>(null);

  const onRun = async () => {
    setMsg('running…');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMsg('no user (로그인 필요)');
      return;
    }
    
    const { error } = await supabase.from('emotion_cards').insert([{
      user_id: user.id,
      image_url: 'https://example.com/dummy.png',
      caption: 'smoke test',
      emotion: 'test',
      template_id: 'test',
      store_slug: 'test'
    }]);
    setMsg(error ? `error: ${error.message}` : 'OK');
  };

  const onLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/rls-test'
      }
    });
    if (error) setMsg(`login error: ${error.message}`);
  };

  const onLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMsg('logged out');
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setMsg(user ? `logged in as: ${user.email}` : 'not logged in');
  };

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <h1>RLS Smoke Test</h1>
      
      <div style={{ marginBottom: 20 }}>
        <button onClick={checkUser} style={{ marginRight: 10 }}>
          현재 사용자 확인
        </button>
        <button onClick={onLogin} style={{ marginRight: 10 }}>
          로그인
        </button>
        <button onClick={onLogout}>
          로그아웃
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <button onClick={onRun} style={{ 
          padding: '10px 20px', 
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          INSERT 테스트
        </button>
      </div>

      <div style={{ 
        marginTop: 12, 
        padding: '10px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        border: '1px solid #dee2e6'
      }}>
        <strong>상태:</strong> {msg}
      </div>

      {user && (
        <div style={{ 
          marginTop: 20, 
          padding: '10px', 
          backgroundColor: '#d4edda', 
          borderRadius: '4px',
          border: '1px solid #c3e6cb'
        }}>
          <strong>로그인된 사용자:</strong> {user.email} (ID: {user.id})
        </div>
      )}
    </div>
  );
}
