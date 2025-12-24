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
  const [isSaved, setIsSaved] = useState(false); // 찜 상태
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  // 제목 콜론(:) 여백 추가
  const formatTitle = (title) => title ? title.replace(/:/g, ' : ') : '';

  useEffect(() => {
    const loadData = async () => {
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        const res = await getMovieDetails(id);
        if (!res) return;
        setMovie(res);

        // --- 강력한 예고편 찾기 (KO -> EN -> ALL) ---
        const fetchTrailer = async () => {
          let trailer = res.videos?.results?.find(v => v.site === "YouTube" && v.type === "Trailer");
          if (!trailer) {
            const enRes = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}&language=en-US`).then(r => r.json());
            trailer = enRes.results?.find(v => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"));
          }
          if (!trailer) {
            const allRes = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`).then(r => r.json());
            trailer = allRes.results?.find(v => v.site === "YouTube");
          }
          return trailer ? trailer.key : null;
        };

        const key = await fetchTrailer();
        setTrailerKey(key);

        // 로그인한 경우에만 DB에서 기존 찜 상태 불러오기
        if (user) {
          const { data } = await supabase.from('favorites').select('*').eq('user_id', user.id).eq('movie_id', id).maybeSingle();
          if (data) setIsSaved(true);
        }
      } catch (error) { console.error("로드 에러:", error); }
    };
    loadData();
  }, [id, user]);

  // --- 로그인 없이도 작동하는 찜하기 함수 ---
  const handleFavorite = async () => {
    // 1. 먼저 화면상의 상태를 토글 (로그인 안 해도 즉시 반응)
    const nextState = !isSaved;
    setIsSaved(nextState);

    // 2. 로그인된 상태라면 Supabase DB에도 동기화
    if (user) {
      try {
        if (nextState) {
          await supabase.from('favorites').insert([{ 
            user_id: user.id, 
            movie_id: movie.id, 
            movie_title: movie.title, 
            poster_path: movie.poster_path 
          }]);
        } else {
          await supabase.from('favorites').delete().eq('user_id', user.id).eq('movie_id', movie.id);
        }
      } catch (error) {
        console.error("DB 저장 실패:", error);
      }
    } else {
      // 로그인이 안 된 경우 알림 (선택 사항)
      console.log("로그인되지 않음: 로컬에서만 찜 상태가 유지됩니다.");
    }
  };

  if (!movie) return <div className="h-screen bg-black flex items-center justify-center text-blue-500 font-bold">LOADING...</div>;

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden flex flex-col items-center">
      <div className="fixed inset-0 z-0">
        <img src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} className="w-full h-full object-cover opacity-10 blur-2xl" alt="bg" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-6xl px-6 py-10 md:py-16">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white mb-10 font-bold transition-colors">
          <ChevronLeft size={20}/> 뒤로가기
        </button>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-center md:items-start text-left">
          {/* 포스터 영역 */}
          <div className="shrink-0 w-full max-w-[280px] md:max-w-[360px] rounded-3xl overflow-hidden shadow-2xl border border-white/5">
            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} className="w-full h-auto" alt="poster" />
          </div>

          {/* 상세 정보 영역 */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 italic leading-tight break-keep">
              {formatTitle(movie.title)}
            </h1>
            
            <div className="flex flex-wrap gap-5 mb-6 text-lg font-bold">
              <span className="text-yellow-400 flex items-center gap-1.5"><Star fill="currentColor" size={20}/> {movie.vote_average?.toFixed(1)}</span>
              <span className="text-gray-400 flex items-center gap-1.5"><Clock size={20}/> {movie.runtime}분</span>
              <span className="text-gray-600 border-l border-white/20 pl-4">{movie.release_date}</span>
            </div>

            {/* 장르 표시 (상세페이지/팝업 공용) */}
            <div className="mb-8">
              <h3 className="text-gray-500 font-black text-xs uppercase tracking-[0.2em] mb-4">Genres</h3>
              <div className="flex flex-wrap gap-3">
                {movie.genres?.map((genre) => (
                  <span key={genre.id} className="px-5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-black">
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-4">Overview</h3>
              <p className="text-lg md:text-xl leading-relaxed text-gray-300 font-light break-keep max-w-2xl">
                {movie.overview || "상세 정보를 불러오는 중입니다."}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => setShowTrailer(true)} 
                disabled={!trailerKey}
                className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black text-xl transition-all ${
                  trailerKey ? 'bg-white text-black hover:bg-blue-600 hover:text-white' : 'bg-gray-800 text-gray-500'
                }`}
              >
                <Play fill="currentColor" size={24} />
                {trailerKey ? "지금 재생" : "재생 불가"}
              </button>
              
              {/* 찜하기 버튼 (로그인 상관없이 토글 가능) */}
              <button 
                onClick={handleFavorite} 
                className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black text-xl border transition-all ${
                  isSaved ? 'bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-600/20' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
              >
                <Heart fill={isSaved ? "white" : "none"} size={24} />
                {isSaved ? "보관됨" : "찜하기"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 유튜브 플레이어 모달 */}
      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/98 p-4 md:p-10" onClick={() => setShowTrailer(false)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white"><X size={48}/></button>
          <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`} frameBorder="0" allowFullScreen></iframe>
          </div>
        </div>
      )}
    </div>
  );
}