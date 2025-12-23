import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Search } from 'lucide-react'; // 1. Search 아이콘 추가

export default function Layout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
      <nav className="p-6 max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          MOVIE 
        </Link>
        
        <div className="flex items-center gap-6">
          {/* 2. 검색 링크 추가 (모든 사용자에게 노출) */}
          <Link to="/search" className="flex items-center gap-2 text-slate-300 hover:text-white font-bold transition-colors">
            <Search size={22} /> SEARCH
          </Link>

          {user ? (
            <Link to="/mypage" className="flex items-center gap-2 text-slate-300 hover:text-white font-bold transition-colors">
              <UserCircle size={24} /> MY PAGE
            </Link>
          ) : (
            <Link to="/login" className="px-6 py-2 bg-blue-600 rounded-full font-bold text-sm hover:bg-blue-500 transition-colors">
              SIGN IN
            </Link>
          )}
        </div>
      </nav>

      {/* 각 페이지가 나오는 곳 */}
      <Outlet />

      <footer className="max-w-7xl mx-auto mt-20 py-8 border-t border-slate-900 text-center text-slate-600 text-sm">
        <p>© 2025 Movie Explorer. All rights reserved.</p>
      </footer>
    </div>
  );
}