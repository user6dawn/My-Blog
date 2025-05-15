import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import GalleryPage from './pages/GalleryPage';
import PostDetailPage from './pages/PostDetailPage';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Ads from './pages/admin/Ads';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
        
        {/* Admin */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/ads" element={<Ads />} />
      </Routes>
    </Router>
  );
}

export default App;
