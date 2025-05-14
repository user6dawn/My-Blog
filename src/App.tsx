import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import GalleryPage from './pages/GalleryPage';
import PostDetailPage from './pages/PostDetailPage';

import Dashboard from './pages/admin/Dashboard';
import Login from './pages/admin/Login';
import Ads from './pages/admin/Ads';

function App() {
  return (
    <Routes>
      {/* Layout wraps only public pages */}
      <Route >
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
      </Route>

      {/* Admin routes (not wrapped in Layout) */}
      <Route path="/admin" element={<Login />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/ads" element={<Ads />} />
    </Routes>
  );
}

export default App;
