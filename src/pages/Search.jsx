import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchMovies, getImageUrl, getMovieDetails } from '../api/tmdb';
import { Search as SearchIcon, X, Heart, Star, Clock, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Search() {
  const [term, setTerm] = useState(''); 
  const [results, setResults] = useState([]); 
  const [selectedMovie, setSelectedMovie] = useState(null); 
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuth(); // 로그인 정보
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (term.trim()) {
        const data = await searchMovies(term);
        setResults(data);
      } else {
        setResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [term]);

  const openModal = async (movie) => {
    try {
      setSelectedMovie(movie); // 일단 창부터 띄우기
      const movieData = await getMovieDetails(movie.id);
      if (movieData) {
        setSelectedMovie(movieData);
        if (user) {
          const { data } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', user.id)
            .eq('movie_id', movie.id)
            .single();
          setIsSaved(!!data);
        }
      }
    } catch (error) {
      console.error("로딩 실패", error);
    }
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!user) return alert("로그인이 필요합니다! 상단 메뉴에서 로그인을 먼저 해주세요.");
    
    try {
      if (isSaved) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('movie_id', selectedMovie.id);
        setIsSaved(false);
      } else {
        await supabase.from('favorites').insert([{
          user_id: user.id,
          movie_id: selectedMovie.id,
          movie_title: selectedMovie.title,
          poster_path: selectedMovie.poster_path
        }]);
        setIsSaved(true);
      }
    } catch (error) {
      alert("DB 저장 실패. 테이블 이름을 확인해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* 검색바 */}
        <div className="relative mb-12">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="영화 제목 검색..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="w-full bg-gray-900 border-none rounded-2xl py-4 px-14 text-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 영화 리스트 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {results.map((movie) => (
            <div key={movie.id} onClick={() => openModal(movie)} className="cursor-pointer group">
              <div className="rounded-xl overflow-hidden aspect-[2/3] bg-gray-800">
                <img src={getImageUrl(movie.poster_path)} className="w-full h-full object-cover group-hover:scale-105 transition" alt="" />
              </div>
              <p className="mt-2 text-sm font-bold truncate text-center">{movie.title}</p>
            </div>
          ))}
        </div>

        {/* 🔥 무조건 보이는 모달 팝업 */}
        {selectedMovie && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 overflow-y-auto">
            <div 
              className="bg-gray-900 w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col md:flex-row relative shadow-[0_0_40px_rgba(255,255,255,0.1)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 닫기 버튼 */}
              <button onClick={() => setSelectedMovie(null)} className="absolute top-4 right-4 z-50 p-2 bg-black/60 rounded-full text-white hover:bg-white/20">
                <X size={24} />
              </button>

              {/* 포스터 */}
              <div className="w-full md:w-1/2 h-64 md:h-auto">
                <img src={getImageUrl(selectedMovie.poster_path)} className="w-full h-full object-cover" alt="" />
              </div>

              {/* 내용 섹션 */}
              <div className="w-full md:w-1/2 p-8 flex flex-col max-h-[70vh] md:max-h-none overflow-y-auto">
                <h2 className="text-3xl font-black mb-2 text-white">{selectedMovie.title}</h2>
                <div className="flex gap-4 mb-4 text-yellow-500 font-bold items-center">
                  <Star fill="currentColor" size={18} /> {selectedMovie.vote_average?.toFixed(1)}
                  <span className="text-gray-500 text-sm">| {selectedMovie.runtime || 0}분</span>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-8 flex-1">
                  {selectedMovie.overview || "영화 상세 설명이 없습니다."}
                </p>

                {/* 🚨 찜하기 버튼 영역 (강제 고정) */}
                <div className="mt-auto space-y-3 pt-6 border-t border-gray-800">
                  <button 
                    onClick={handleFavorite}
                    className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      isSaved ? 'bg-gray-700 text-pink-500 border-2 border-pink-500' : 'bg-pink-600 text-white hover:bg-pink-500'
                    }`}
                  >
                    <Heart fill={isSaved ? "currentColor" : "none"} size={22} />
                    {isSaved ? "이미 내 리스트에 있음" : "내 리스트에 찜하기"}
                  </button>

                  <button 
                    onClick={() => {
                        setSelectedMovie(null);
                        navigate(`/movie/${selectedMovie.id}`);
                    }}
                    className="w-full py-4 bg-white text-black rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
                  >
                    상세페이지로 이동 <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}