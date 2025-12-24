import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL?.trim(); 
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 로컬 찜 목록을 DB와 동기화하는 함수
  const syncLocalFavoritesToDB = async (userId) => {
    const localData = JSON.parse(localStorage.getItem("my_favorites") || "[]");
    if (localData.length > 0) {
      try {
        const inserts = localData.map(movie => ({
          user_id: userId,
          movie_id: movie.id,
          movie_title: movie.title,
          poster_path: movie.poster_path
        }));
        // upsert를 사용하여 중복 방지하며 삽입
        await supabase.from('favorites').upsert(inserts, { onConflict: 'user_id, movie_id' });
        console.log("로컬 찜 목록이 계정에 동기화되었습니다.");
      } catch (err) {
        console.error("동기화 실패:", err);
      }
    }
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) await syncLocalFavoritesToDB(currentUser.id);
      } catch (error) {
        console.error("세션 초기화 에러:", error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (_event === 'SIGNED_IN' && currentUser) {
        await syncLocalFavoritesToDB(currentUser.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    return await supabase.auth.signUp({ email: email.trim(), password });
  };
  
  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email: email.trim(), password });
  };

  // 구글 로그인 추가
  const signInWithGoogle = async () => {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };
  
  const signOut = () => {
    localStorage.removeItem("my_favorites"); // 로그아웃 시 로컬 데이터 선택적 삭제
    return supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signInWithGoogle, signOut, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);