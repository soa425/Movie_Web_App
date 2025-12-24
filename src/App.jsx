import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyPage from './pages/MyPage';
import Search from './pages/Search';
import MovieDetailPage from './pages/MovieDetailPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="mypage" element={<MyPage />} />
          <Route path="search" element={<Search />} />
          <Route path="movie/:id" element={<MovieDetailPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}