import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Star, Heart, Play, Calendar, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

// movies: 전체 리스트, onNavigate: 선택된 영화를 변경하는 부모의 함수
export default function MovieDetailModal({ 
  movie, 
  movies = [], 
  onClose, 
  onToggleFavorite, 
  isFavorite, 
  onNavigate 
}) {
  const navigate = useNavigate();

  if (!movie) return null;

  // 현재 인덱스 확인
  const currentIndex = movies.findIndex((m) => m.id === movie.id);

  // 이전/다음 이동 함수
  const handleMove = (direction) => {
    if (!onNavigate) return;
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < movies.length) {
      onNavigate(movies[nextIndex]);
    }
  };

  const goToDetail = () => {
    onClose(); 
    navigate(`/details/${movie.id}`);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* 왼쪽 이동 버튼 */}
      {currentIndex > 0 && (
        <button 
          onClick={(e) => { e.stopPropagation(); handleMove('prev'); }}
          className="absolute left-4 md:left-10 z-[110] p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all hidden md:block"
        >
          <ChevronLeft size={60} strokeWidth={1} />
        </button>
      )}

      {/* 오른쪽 이동 버튼 */}
      {currentIndex < movies.length - 1 && (
        <button 
          onClick={(e) => { e.stopPropagation(); handleMove('next'); }}
          className="absolute right-4 md:right-10 z-[110] p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all hidden md:block"
        >
          <ChevronRight size={60} strokeWidth={1} />
        </button>
      )}

      <div 
        className="relative w-full max-w-5xl bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 기존 상세 내용 유지 */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-50 p-3 bg-black/50 rounded-full text-white hover:bg-white/20 transition-all hover:rotate-90"
        >
          <X size={28} />
        </button>
        
        <div className="w-full md:w-1/2 relative group h-[400px] md:h-auto overflow-hidden">
          <img 
            key={movie.id} // 이미지 전환 애니메이션을 위한 키값
            src={movie.poster_path ? `https://image.tmdb.org/t/p/w780${movie.poster_path}` : 'https://via.placeholder.com/780x1170?text=No+Image'} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 animate-in fade-in slide-in-from-right-5" 
            alt={movie.title} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#0a0a0a]" />
        </div>

        <div className="p-8 md:p-14 md:w-1/2 flex flex-col justify-center">
          <span className="text-blue-500 font-bold tracking-widest text-sm mb-3 uppercase">Featured Movie</span>
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter leading-tight italic drop-shadow-lg">
            {movie.title}
          </h2>

          <div className="flex items-center gap-5 mb-8 text-lg font-bold">
            <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-lg">
              <Star size={20} fill="currentColor" />
              {movie.vote_average?.toFixed(1) || "0.0"}
            </div>
            <span className="text-gray-700">|</span>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Calendar size={20} />
              {movie.release_date?.split('-')[0] || "미정"}
            </div>
          </div>

          <div className="mb-10 text-gray-400 text-lg leading-relaxed max-h-[200px] overflow-y-auto pr-4 custom-scrollbar">
            <p className="first-letter:text-3xl first-letter:font-bold first-letter:text-white">
              {movie.overview || "상세 줄거리가 등록되지 않은 영화입니다."}
            </p>
          </div>
          
          <div className="flex flex-col gap-4 mt-auto">
            <div className="flex gap-4">
              <button 
                onClick={(e) => onToggleFavorite(e, movie)}
                className={`flex-1 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${
                  isFavorite 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-pink-600 text-white hover:bg-pink-700 shadow-pink-600/20'
                }`}
              >
                <Heart size={24} fill={isFavorite ? "black" : "none"} /> 
                {isFavorite ? "내 리스트에서 삭제" : "내 리스트에 찜하기"}
              </button>
              
              <button className="p-5 bg-gray-900 border border-white/10 rounded-2xl hover:bg-gray-800 transition-colors text-white group">
                <Play size={24} fill="white" className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

            <button 
              onClick={goToDetail}
              className="w-full bg-transparent border border-white/20 text-white py-5 rounded-2xl font-black text-xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
            >
              영화 상세 페이지로 이동 
              <ExternalLink size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}