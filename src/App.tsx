import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/components/pages/HomePage';
import AboutPage from '@/components/pages/AboutPage';
import ContactPage from '@/components/pages/ContactPage';
import GalleryPage from '@/components/pages/GalleryPage';
import PostDetailPage from '@/components/pages/PostDetailPage';
import Dashboard from '@/components/pages/admin/Dashboard';
import Login from '@/components/pages/admin/Login';
import Ads from '@/components/pages/admin/Ads';
import UploadGallery from '@/components/pages/admin/UploadGallery';
import './styles/styles.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/ads" element={<Ads />} />
        <Route path="/admin/upload-gallery" element={<UploadGallery />} />
      </Routes>
    </Router>
  );
}

export default App;