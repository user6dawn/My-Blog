import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import GalleryPage from './pages/GalleryPage';
import PostDetailPage from './pages/PostDetailPage';
import Dashboard from './pages/admin/Dashboard';
import Login from './pages/admin/Login';
import Ads from './pages/admin/Ads';
import UploadGallery from './pages/admin/UploadGallery';
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