import axios from 'axios';

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TMDB_TOKEN}`,
    accept: 'application/json',
  },
  // 기본 파라미터를 설정하여 중복 코드를 줄입니다.
  params: {
    language: 'ko-KR',
  }
});

// 인기 영화 가져오기
export const getPopularMovies = async (page = 1) => {
  const response = await tmdbApi.get('/movie/popular', { params: { page } });
  return response.data.results;
};

// 현재 상영작 가져오기
export const getNowPlaying = async () => {
  const response = await tmdbApi.get('/movie/now_playing', { params: { page: 1 } });
  return response.data.results;
};

// 영화 검색하기
export const searchMovies = async (query) => {
  if (!query || query.trim() === "") return [];
  const response = await tmdbApi.get('/search/movie', {
    params: { query: encodeURIComponent(query), page: 1 }
  });
  return response.data.results;
};

// 영상(videos)과 출연진(credits) 정보를 한 번에 가져옵니다.
export const getMovieDetails = async (movieId) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}`, {
      params: { 
        // videos는 재생을 위해, credits는 상세 페이지 풍성함을 위해 추가
        append_to_response: 'videos,credits' 
      }
    });
    return response.data; 
  } catch (error) {
    console.error("상세 정보 호출 에러:", error);
    return null;
  }
};

export const getImageUrl = (path) => path ? `https://image.tmdb.org/t/p/w500${path}` : null;