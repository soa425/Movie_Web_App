import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

export default function MovieCard({ movie }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/details/${movie.id}`)} className="group cursor-pointer">
      <div className="relative aspect-[2/3] overflow-hidden rounded-[2rem] bg-gray-900 border border-white/5 transition-all duration-300 group-hover:-translate-y-2 group-hover:border-blue-500/50 shadow-2xl">
        <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end">
          <p className="font-bold text-xl leading-tight mb-2">{movie.title}</p>
          <div className="flex items-center text-yellow-400 font-black text-sm">
            <Star size={14} fill="currentColor" className="mr-1"/> {movie.vote_average}
          </div>
        </div>
      </div>
    </div>
  );
}
