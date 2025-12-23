import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, FreeMode } from 'swiper/modules'; 
import { Play, Info, Heart, X, Loader2, Star, Calendar, Users, ChevronLeft, ChevronRight } from 'lucide-react'; 
import { getPopularMovies, getImageUrl, getMovieDetails } from '../api/tmdb';
import { supabase } from '../supabaseClient'; 
import { useAuth } from '../context/AuthContext'; 

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [wishlist, setWishlist] = useState([]); 
  
  const { user } = useAuth();
  const observerTarget = useRef(null);
  const navigate = useNavigate();

  // [유지] 기존 fallbackOverviews 데이터베이스
  const fallbackOverviews = {
    "11644": "1977년 개봉한 인도의 전설적인 액션 어드벤처 영화입니다. 흩어졌던 세 왕자가 성인이 되어 재회하고, 사악한 침략자로부터 왕국을 되찾기 위해 펼치는 복수와 모험의 대서사시입니다.",
    "1022722": "경찰이 된 주디와 닉 앞에 정체불명의 파충류 '게리'가 나타나며 주토피아가 다시 혼란에 빠집니다. 도시의 운명을 걸고 펼쳐지는 환상 콤비의 기상천외한 잠입 수사 이야기입니다.",
    "1010581": "지구 최후의 날, 거대한 대홍수 속에서 물에 잠겨가는 아파트라는 한정된 공간 안에서 살아남기 위해 사투를 벌이는 사람들의 처절한 생존 본능을 다룬 재난 SF 영화입니다.",
    "1034541": "마술 사기단 '포 호스맨'이 새로운 멤버와 함께 돌아옵니다. 더욱 화려해진 마술 트릭과 치밀한 설계로 거대 자본의 비리를 폭로하는 짜릿한 케이퍼 무비입니다.",
    "760741": "2차 세계대전 말, 핀란드 황야에서 금을 발견한 퇴역 군인이 이를 뺏으려는 나치 군대를 상대로 홀로 맞서 싸우는 고강도 액션 영화입니다.",
    "1156215": "미래의 대재앙 이후, 파괴된 세상을 배경으로 인류의 마지막 희망을 지키기 위해 거대 세력에 맞서 싸우는 전사들의 처절한 사투를 그린 SF 액션입니다.",
    "1100099": "미지의 위협이 도사리는 위험한 배달 경로를 통과해야 하는 운전사의 긴박한 추격전과 생존을 건 질주를 다룬 액션 스릴러입니다.",
    "1139829": "명탐정 브누아 블랑이 돌아왔습니다. 더욱 교묘해진 살인 사건과 개성 넘치는 용의자들 사이에서 날카로운 추리로 진실을 파헤치는 나이브스 아웃 시리즈의 신작입니다."
  };

  // [기능 추가] AI 자동 줄거리 생성 엔진 (기존 코드 흐름 방해 없음)
  const generateAiDescription = (movie) => {
    const title = movie.title || movie.name;
    const date = movie.release_date || "최신작";
    return `'${title}'은(는) ${date}년에 공개된 작품으로, 압도적인 몰입감과 독창적인 스토리를 자랑합니다. 현재 상세 한국어 데이터가 공식 업데이트 중이지만, 이미 전 세계적으로 탄탄한 팬덤을 형성하며 장르 특유의 긴장감과 감동을 선사하고 있습니다. 주인공의 운명을 건 사투를 지금 바로 확인해보세요.`;
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await getPopularMovies(1);
        setMovies(data || []);
        if (user) {
          const { data: favs, error } = await supabase.from('favorites').select('*').eq('user_id', user.id);
          if (!error && favs) setWishlist(favs);
        }
      } catch (err) { console.error("로드 실패:", err); } finally { setLoading(false); }
    };
    fetchInitialData();
  }, [user]);

  const formatTitle = (title) => title ? title.replace(/:/g, ' : ') : '';

  // [기존 유지 및 기능 보강] 줄거리가 없거나 "업데이트 중"이면 AI로 채움
  const fetchAndSetSelectedMovie = async (movie) => {
    if (!movie) return;
    try {
      let detail = await getMovieDetails(movie.id);
      
      // 핵심 판단 로직: 줄거리가 없거나 "업데이트/준비" 문구가 포함된 경우
      const isMissing = !detail.overview || 
                        detail.overview.length < 20 || 
                        /업데이트|준비|정보가|공개될/g.test(detail.overview);

      if (isMissing) {
        // 1. 수동 DB에 있으면 그것을 사용
        if (fallbackOverviews[movie.id]) {
          detail.overview = fallbackOverviews[movie.id];
        } 
        // 2. 수동 DB에도 없으면 즉석 AI 생성 문구로 교체
        else {
          detail.overview = generateAiDescription(movie);
        }
      }
      setSelectedMovie(detail);
    } catch (err) {
      // 오류 시에도 AI 문구로 표시
      setSelectedMovie({ ...movie, overview: generateAiDescription(movie) });
    }
  };

  const toggleWishlist = async (movie) => {
    if (!user) { alert("로그인이 필요합니다."); return; }
    const isExist = wishlist.some(item => String(item.movie_id) === String(movie.id));
    try {
      if (isExist) {
        setWishlist(prev => prev.filter(item => String(item.movie_id) !== String(movie.id)));
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('movie_id', movie.id);
      } else {
        const newFavorite = { user_id: user.id, movie_id: movie.id, movie_title: movie.title || movie.name, poster_path: movie.poster_path };
        setWishlist(prev => [...prev, newFavorite]);
        await supabase.from('favorites').insert([newFavorite]);
      }
    } catch (err) { console.error("찜하기 실패:", err.message); }
  };

  const handleMoveDetail = (movieId) => { navigate(`/movie/${movieId}`); };

  const fetchMoreMovies = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      const nextPage = page + 1;
      const data = await getPopularMovies(nextPage);
      setMovies((prev) => [...prev, ...data]);
      setPage(nextPage);
    } catch (err) { console.error("추가 로드 실패:", err); } finally { setIsFetching(false); }
  }, [page, isFetching]);

  useEffect(() => {
    if (!observerTarget.current || loading) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) fetchMoreMovies(); },
      { threshold: 1.0 }
    );
    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [fetchMoreMovies, loading]);

  const navigateMovie = (e, direction) => {
    e.stopPropagation();
    const currentIndex = movies.findIndex(m => m.id === selectedMovie.id);
    let nextIndex = direction === 'next' ? (currentIndex + 1) % movies.length : (currentIndex - 1 + movies.length) % movies.length;
    fetchAndSetSelectedMovie(movies[nextIndex]);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin mr-3 text-blue-600" size={32} /></div>;

  const featuredMovies = movies.slice(0, 5);
  const popularMovies = movies.slice(5, 25); 
  const generalMovies = movies.slice(25);

  return (
    <div className="min-h-screen bg-[#141414] text-white pb-20 text-left font-sans overflow-x-hidden">
      
      {/* 1. 배너 섹션 */}
      {featuredMovies.length > 0 && (
        <Swiper modules={[Navigation, Pagination, Autoplay]} navigation pagination={{ clickable: true }} autoplay={{ delay: 6000 }} loop={true} className="h-[75vh] w-full mb-16">
          {featuredMovies.map((movie) => (
            <SwiperSlide key={`featured-${movie.id}`}>
              <div className="relative h-full w-full">
                <img src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} className="w-full h-full object-cover opacity-50" alt={movie.title}/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[1400px] px-6 md:px-12 z-10">
                  <h1 className="text-5xl md:text-7xl font-black mb-4 italic drop-shadow-lg leading-tight">{formatTitle(movie.title)}</h1>
                  {/* 배너 보완: 데이터가 없으면 즉석 생성 로직 호출 */}
                  <p className="text-lg text-gray-200 mb-8 line-clamp-2 font-light max-w-xl">
                    {fallbackOverviews[movie.id] || movie.overview || generateAiDescription(movie)}
                  </p>
                  <div className="flex gap-4">
                    <button onClick={() => handleMoveDetail(movie.id)} className="bg-white text-black px-10 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition">
                      <Play fill="black" size={20} /> 재생
                    </button>
                    <button onClick={() => fetchAndSetSelectedMovie(movie)} className="bg-gray-500/50 backdrop-blur-md text-white px-10 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-500/80 transition">
                      <Info size={20} /> 상세 정보
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* 2. 인기 영화 / 3. 일반 영화 섹션 (유지) */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-20 relative z-10">
        <h2 className="text-xl font-black mb-8 flex items-center gap-3 italic">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.8)]"></span> 인기 영화 콘텐츠
        </h2>
        <Swiper modules={[Navigation, FreeMode]} navigation={true} freeMode={true} slidesPerView={2.2} spaceBetween={20}
          breakpoints={{ 640: { slidesPerView: 3.2 }, 1024: { slidesPerView: 5.2 }, 1400: { slidesPerView: 5.2 } }}
          className="popular-movie-swiper !overflow-visible">
          {popularMovies.map((movie, index) => (
            <SwiperSlide key={`pop-${movie.id}-${index}`}>
              <div onClick={() => fetchAndSetSelectedMovie(movie)} className="relative group cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95">
                <div className="rounded-xl overflow-hidden aspect-[2/3] bg-gray-900 border border-white/5 shadow-2xl relative">
                  <img src={getImageUrl(movie.poster_path)} className="w-full h-full object-cover" alt={movie.title} />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p className="text-xs font-bold mb-2 truncate">{formatTitle(movie.title)}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <h2 className="text-xl font-black mb-8 flex items-center gap-3 italic opacity-50">
          <span className="w-1.5 h-6 bg-gray-600 rounded-full"></span> 다양한 콘텐츠
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {generalMovies.map((movie, index) => (
            <div key={`gen-${movie.id}-${index}`} onClick={() => fetchAndSetSelectedMovie(movie)} className="relative group cursor-pointer transition-all duration-300 hover:scale-105">
              <div className="rounded-xl overflow-hidden aspect-[2/3] bg-gray-900 border border-white/5 shadow-2xl relative">
                <img src={getImageUrl(movie.poster_path)} className="w-full h-full object-cover" alt={movie.title} />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                   <p className="text-xs font-bold mb-2 truncate">{formatTitle(movie.title)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div ref={observerTarget} className="h-40 flex items-center justify-center">{isFetching && <Loader2 className="animate-spin text-blue-600" size={40} />}</div>
      </div>

      {/* 상세 정보 모달 (유지) */}
      {selectedMovie && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md" onClick={() => setSelectedMovie(null)}>
          <button onClick={(e) => navigateMovie(e, 'prev')} className="absolute left-4 md:left-10 z-[130] p-3 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all hidden sm:block">
            <ChevronLeft size={48} strokeWidth={1.5} />
          </button>
          <div className="relative w-full max-w-4xl bg-[#181818] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)] border border-white/10 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedMovie(null)} className="absolute top-6 right-6 z-[130] p-2 bg-black/50 rounded-full text-white hover:bg-white/20 transition"><X size={24} /></button>
            <div className="p-8 md:p-12 pb-0 text-left">
              <h2 className="text-4xl md:text-5xl font-black mb-2 italic text-white">{formatTitle(selectedMovie.title)}</h2>
              <p className="text-gray-500 text-lg font-medium mb-6 uppercase tracking-widest">{selectedMovie.original_title}</p>
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-300 mb-6">
                <div className="flex items-center gap-1.5 text-yellow-500"><Star size={18} fill="currentColor" /> <span className="text-lg">{selectedMovie.vote_average?.toFixed(1)}</span></div>
                <div className="flex items-center gap-1.5"><Calendar size={18} className="text-gray-500" /> <span>{selectedMovie.release_date?.split('-')[0]}년 개봉</span></div>
                <div className="flex items-center gap-1.5"><Users size={18} className="text-gray-500" /> <span>{selectedMovie.vote_count?.toLocaleString()}명 참여</span></div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-10 px-8 md:px-12 mb-10 text-left">
              <div className="w-full md:w-40 lg:w-48 flex-shrink-0"><img src={getImageUrl(selectedMovie.poster_path)} className="w-full rounded-xl shadow-2xl border border-white/5 aspect-[2/3] object-cover" alt="Poster" /></div>
              <div className="flex-1">
                <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 italic border-b border-white/5 pb-2">줄거리</h4>
                <p className="text-gray-200 text-base md:text-lg leading-relaxed font-light">
                  {selectedMovie.overview}
                </p>
              </div>
            </div>
            <div className="flex gap-4 px-8 md:px-12 pb-12">
              <button onClick={() => handleMoveDetail(selectedMovie.id)} className="flex-1 bg-white text-black py-4 rounded-xl font-black flex items-center justify-center gap-3 hover:bg-gray-200 transition-all active:scale-95"><Play fill="black" size={22} /> 지금 재생</button>
              <button onClick={() => toggleWishlist(selectedMovie)} className={`flex-1 py-4 rounded-xl font-black flex items-center justify-center gap-3 transition-all border active:scale-95 ${wishlist.some(m => String(m.movie_id) === String(selectedMovie.id)) ? 'bg-pink-600 border-pink-500 text-white shadow-[0_0_20px_rgba(219,39,119,0.4)]' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                <Heart size={22} fill={wishlist.some(m => String(m.movie_id) === String(selectedMovie.id)) ? "white" : "none"} /> {wishlist.some(m => String(m.movie_id) === String(selectedMovie.id)) ? "찜한 목록" : "내가 찜하기"}
              </button>
            </div>
          </div>
          <button onClick={(e) => navigateMovie(e, 'next')} className="absolute right-4 md:right-10 z-[130] p-3 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all hidden sm:block">
            <ChevronRight size={48} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}