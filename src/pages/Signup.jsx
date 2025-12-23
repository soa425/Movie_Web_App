import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // 핵심 수정: .trim()을 추가하여 이메일 앞뒤의 보이지 않는 공백을 제거합니다.
      // 이 처리가 없으면 "invalid email" 에러가 발생할 수 있습니다.
      const { error } = await signUp(email.trim(), password);
      
      if (error) throw error;
      
      alert("회원가입이 완료되었습니다! 로그인을 진행해주세요.");
      navigate('/login');
    } catch (err) { 
      // 에러 메시지를 한국어로 쉽게 이해할 수 있도록 분기 처리하거나 그대로 출력합니다.
      alert("회원가입 에러: " + err.message); 
    }
  };

  return (
    <div className="flex justify-center items-center pt-20 px-4">
      <div className="bg-slate-900 p-8 md:p-10 rounded-3xl border border-slate-800 w-full max-w-md shadow-2xl">
        {/* SIGN UP -> 회원가입으로 변경 */}
        <h2 className="text-3xl font-black mb-8 text-center text-white tracking-tight">회원가입</h2>
        
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">이메일 주소</label>
            <input 
              type="email" 
              placeholder="example@movie.com" 
              className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500 border border-transparent transition-all" 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">비밀번호</label>
            <input 
              type="password" 
              placeholder="6자리 이상 비밀번호" 
              className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500 border border-transparent transition-all" 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-500/20 mt-4"
          >
            계정 생성하기
          </button>
        </form>
        
        <p className="mt-8 text-center text-slate-400 text-sm">
          이미 계정이 있으신가요? 
          <Link to="/login" className="text-purple-400 hover:underline font-bold ml-1">로그인</Link>
        </p>
      </div>
    </div>
  );
}