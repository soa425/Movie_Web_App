import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Heart, Search, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-[150] flex items-center justify-between px-6 md:px-12 py-4 bg-black/90 border-b border-white/10 text-white">
      <div className="flex items-center gap-10">
        <Link to="/" className="text-blue-500 font-black text-2xl tracking-tighter">MOVIEFLIX</Link>
        {/* 요청하신 목록 추가 */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-bold text-gray-300">
          <Link to="/" className="hover:text-white transition">홈</Link>
          <Link to="/movies" className="hover:text-white transition">영화</Link>
          <Link to="/latest" className="hover:text-white transition">최신 콘텐츠</Link>
          {user && <Link to="/mypage" className="hover:text-white transition">내가 찜한 콘텐츠</Link>}
        </div>
      </div>

      <div className="flex items-center gap-6 font-bold text-sm">
        <Link to="/search" className="flex items-center gap-2 hover:text-blue-400 transition">
          <Search size={18} /> 찾아보기
        </Link>
        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/mypage" className="text-pink-500 flex items-center gap-2"><Heart size={18} fill="currentColor" /> 찜한 목록</Link>
            <button onClick={() => signOut()} className="text-gray-400 hover:text-white flex items-center gap-2"><LogOut size={18} /> 로그아웃</button>
          </div>
        ) : (
          <Link to="/login" className="bg-blue-600 px-6 py-2 rounded-md hover:bg-blue-500 transition text-white">로그인</Link>
        )}
      </div>
    </nav>
  );
}