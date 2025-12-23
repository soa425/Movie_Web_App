import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { getImageUrl, getMovieDetails } from '../api/tmdb'; // getMovieDetails 추가
import { X, Play, Heart, Star, Calendar, Users, Loader2 } from 'lucide-react';

export default function MyPage() {
  const [favorites, setFavorites] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null); // 모달용 상태
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error("찜 목록 로드 실패:", error);
      } else {
        setFavorites(data || []);
      }
      setLoading(false);
    };
    
    fetchFavorites();
  }, [user]);

  // 영화 클릭 시 상세 정보 가져와 모달 열기
  const handleOpenModal = async (movieId) => {
    try {
      const detail = await getMovieDetails(movieId);
      setSelectedMovie(detail);
    } catch (err) {
      console.error("상세 정보 로드 실패:", err);
    }
  };

  // 지금 재생 버튼 클릭 시 이동
  const handlePlay = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  if (!user) return <div className="p-20 text-white text-center">로그인이 필요합니다.</div>;
  if (loading) return <div className="min-h-screen bg-[#141414] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#141414] text-white p-12 pt-24 text-left">
      <h2 className="text-3xl font-black mb-10 italic">내가 찜한 영화 ({favorites.length})</h2>
      
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-gray-800 rounded-xl">
          <p className="text-gray-500 mb-6">찜한 영화가 아직 없습니다.</p>
          <button 
            onClick={() => navigate('/')} 
            className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition"
          >
            영화 구경하러 가기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {favorites.map((movie) => (
            <div 
              key={movie.movie_id} 
              className="group cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => handleOpenModal(movie.movie_id)} // 클릭 시 모달 열기
            >
              <div className="rounded-xl overflow-hidden aspect-[2/3] shadow-2xl border border-white/5 bg-gray-900">
                <img 
                  src={getImageUrl(movie.poster_path)} 
                  alt={movie.movie_title}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-3 text-sm font-bold text-gray-300 truncate">{movie.movie_title}</p>
            </div>
          ))}
        </div>
      )}

      {/* --- 상세 정보 모달 --- */}
      {selectedMovie && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setSelectedMovie(null)}>
          <div 
            className="relative w-full max-w-4xl bg-[#181818] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button onClick={() => setSelectedMovie(null)} className="absolute top-6 right-6 z-[130] p-2 bg-black/50 rounded-full text-white hover:bg-white/20 transition">
              <X size={24} />
            </button>
            
            {/* 상단 텍스트 정보 */}
            <div className="p-8 md:p-12 pb-0">
              <h2 className="text-4xl md:text-5xl font-black mb-2 italic tracking-tighter">{selectedMovie.title}</h2>
              <p className="text-gray-500 text-lg font-medium mb-6">{selectedMovie.original_title}</p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-300 mb-6">
                <div className="flex items-center gap-1.5 text-yellow-500">
                  <Star size={18} fill="currentColor" />
                  <span className="text-lg">{selectedMovie.vote_average?.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={18} className="text-gray-500" />
                  <span>{selectedMovie.release_date?.split('-')[0]}년 개봉</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={18} className="text-gray-500" />
                  <span>{selectedMovie.vote_count?.toLocaleString()}명 참여</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {selectedMovie.genres?.map((genre) => (
                  <span key={genre.id} className="bg-white/5 border border-white/10 px-3 py-1 rounded-md text-xs font-bold text-gray-300 uppercase">
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            {/* 하단 포스터 + 줄거리 */}
            <div className="flex flex-col md:flex-row gap-10 px-8 md:px-12 mb-10">
              <div className="w-full md:w-40 flex-shrink-0">
                <img src={getImageUrl(selectedMovie.poster_path)} className="w-full rounded-xl shadow-2xl border border-white/5" alt="Poster" />
              </div>
              <div className="flex-1">
                <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 italic">줄거리</h4>
                <p className="text-gray-200 text-base md:text-lg leading-relaxed font-light line-clamp-6">
                  {selectedMovie.overview || "줄거리 정보가 준비되지 않았습니다."}
                </p>
              </div>
            </div>
            
            {/* 버튼 그룹 */}
            <div className="flex gap-4 px-8 md:px-12 pb-12">
              <button 
                onClick={() => handlePlay(selectedMovie.id)}
                className="flex-1 bg-white text-black py-4 rounded-xl font-black flex items-center justify-center gap-3 hover:bg-gray-200 transition-all active:scale-95"
              >
                <Play fill="black" size={20} /> 지금 재생
              </button>
              <button className="flex-1 py-4 rounded-xl font-black flex items-center justify-center gap-3 transition-all border bg-pink-600 border-pink-500 text-white shadow-lg">
                <Heart size={20} fill="white" /> 찜한 목록
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}