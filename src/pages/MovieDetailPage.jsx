import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieDetails } from "../api/tmdb";
import { Star, Clock, ChevronLeft, Heart, Play, X } from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // tmdb.js에서 이미 response.data를 리턴하므로 res 자체가 데이터입니다.
        const res = await getMovieDetails(id);
        
        if (!res) {
          console.error("영화 데이터를 불러오지 못했습니다.");
          return;
        }

        setMovie(res);

        // ✅ res.data.videos -> res.videos로 수정 (TypeError 방지)
        if (res.videos && res.videos.results) {
          const trailer = res.videos.results.find(
            (vid) => vid.site === "YouTube" && (vid.type === "Trailer" || vid.type === "Teaser")
          );
          if (trailer) setTrailerKey(trailer.key);
        }

        if (user) {
          const { data } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', user.id)
            .eq('movie_id', id)
            .single();
          if (data) setIsSaved(true);
        }
      } catch (error) {
        console.error("로딩 실패:", error);
      }
    };
    loadData();
  }, [id, user]);

  const handleFavorite = async () => {
    if (!user) return alert("로그인이 필요합니다!");
    if (isSaved) return alert("이미 보관함에 있습니다.");

    try {
      const { error } = await supabase.from('favorites').insert([{ 
        user_id: user.id, 
        movie_id: movie.id, 
        movie_title: movie.title, 
        poster_path: movie.poster_path 
      }]);
      if (error) throw error;
      setIsSaved(true);
    } catch (error) {
      alert("저장 실패");
    }
  };

  if (!movie) return (
    <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-black tracking-widest">
      LOADING...
    </div>
  );

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden text-left">
      {/* 배경 이미지 */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} 
          className="w-full h-full object-cover opacity-20 blur-sm"
          alt="background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
      </div>

      <div className="relative z-10 p-6 md:p-16">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-12 font-bold transition-colors">
          <ChevronLeft size={24}/> 뒤로가기
        </button>

        <div className="flex flex-col lg:flex-row gap-16 items-center lg:items-start">
          {/* 포스터 영역 */}
          <div className="relative group shrink-0">
            <img 
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
              className="w-[300px] md:w-[450px] rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10" 
              alt="poster" 
            />
            {trailerKey && (
              <button 
                onClick={() => setShowTrailer(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]"
              >
                <div className="bg-white text-black p-5 rounded-full scale-90 group-hover:scale-100 transition-transform">
                  <Play fill="black" size={32}/>
                </div>
              </button>
            )}
          </div>
          
          {/* 영화 상세 정보 */}
          <div className="flex flex-col pt-4">
            <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter italic">{movie.title}</h1>
            
            <div className="flex flex-wrap gap-6 mb-10 text-xl font-bold">
              <span className="flex items-center gap-2 text-yellow-400">
                <Star fill="currentColor" size={24}/> {movie.vote_average?.toFixed(1)}
              </span>
              <span className="flex items-center gap-2 text-gray-300">
                <Clock size={24}/> {movie.runtime}분
              </span>
              <span className="px-4 py-1 border border-white/20 rounded-lg text-sm self-center text-gray-400">
                {movie.release_date}
              </span>
            </div>

            <div className="mb-10">
               <h3 className="text-gray-500 font-black text-sm uppercase tracking-widest mb-4">Overview</h3>
               <p className="text-xl md:text-2xl leading-relaxed text-gray-200 max-w-3xl font-light">
                {movie.overview || "상세 줄거리 정보가 등록되지 않은 영화입니다."}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setShowTrailer(true)}
                disabled={!trailerKey}
                className={`flex items-center gap-3 px-12 py-6 rounded-2xl font-black text-2xl transition-all shadow-xl ${
                  trailerKey ? 'bg-white text-black hover:bg-gray-200 active:scale-95' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Play fill="currentColor" size={24} />
                {trailerKey ? "지금 재생" : "재생 불가"}
              </button>

              <button 
                onClick={handleFavorite}
                className={`flex items-center gap-3 px-12 py-6 rounded-2xl font-black text-2xl transition-all shadow-xl border ${
                  isSaved 
                  ? 'bg-pink-600 border-pink-500 text-white' 
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10 active:scale-95'
                }`}
              >
                <Heart fill={isSaved ? "white" : "none"} size={24} />
                {isSaved ? "찜 완료" : "찜하기"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 유튜브 플레이어 모달 */}
      {showTrailer && trailerKey && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-20 bg-black/95 backdrop-blur-xl"
          onClick={() => setShowTrailer(false)}
        >
          <button 
            onClick={() => setShowTrailer(false)}
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
          >
            <X size={48} />
          </button>
          <div 
            className="w-full h-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫힘 방지
          >
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}