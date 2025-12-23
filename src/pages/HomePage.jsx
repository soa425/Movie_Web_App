import { useEffect, useState } from "react";
import { getPopularMovies } from "../api/tmdb";
import MovieCard from "../components/MovieCard/MovieCard";

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      const res = await getPopularMovies();
      setMovies(res.data.results);
      setLoading(false);
    };
    fetchMovies();
  }, []);

  if (loading) return <div className="text-center py-20 text-2xl animate-bounce">🎬 데이터를 불러오는 중...</div>;

  return (
    <div className="py-10">
      <h2 className="text-4xl font-black mb-10 tracking-tight text-blue-500">POPULAR MOVIES</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {movies.map((movie, index) => (
          // key값이 중복되지 않게 index를 활용 (테스트용)
          <MovieCard key={`${movie.id}-${index}`} movie={movie} />
        ))}
      </div>
    </div>
  );
}