import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // 핵심 수정: email.trim()을 추가하여 보이지 않는 공백 에러를 방지합니다.
            const { error } = await signIn(email.trim(), password);
            if (error) throw error;
            navigate('/');
        } catch (err) {
            // 에러 발생 시 사용자에게 더 친절한 한글 메시지를 보여줍니다.
            alert("로그인 실패: 이메일 또는 비밀번호가 일치하지 않습니다.");
        }
    }

    return (
        <div className="flex justify-center items-center pt-20 px-4">
            <div className="bg-slate-900 p-8 md:p-10 rounded-3xl border border-slate-800 w-full max-w-md shadow-2xl">
                {/*LOGIN -> 로그인으로 변경 */}
                <h2 className="text-3xl font-black mb-8 text-center text-white tracking-tight">로그인</h2>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">이메일 주소</label>
                        <input
                            type="email"
                            placeholder="example@movie.com"
                            className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 border border-transparent transition-all"
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">비밀번호</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 border border-transparent transition-all"
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/20 mt-4"
                    >
                        로그인
                    </button>
                </form>
                <p className="mt-8 text-center text-slate-400 text-sm">
                    아직 회원이 아니신가요? <Link to="/signup" className="text-blue-400 hover:underline font-bold ml-1">회원가입</Link>
                </p>
            </div>
        </div>
    );
}