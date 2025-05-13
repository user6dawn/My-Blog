import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/styles.css';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const location = useLocation();

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const closeNav = () => {
    setIsNavOpen(false);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    closeNav();
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        isNavOpen &&
        !target.closest('.nav') &&
        !target.closest('.nav-toggle')
      ) {
        closeNav();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNavOpen]);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${isDark ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`header ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
        <div className="header-left">
          <span className={`header-title-large ${isDark ? 'text-white' : 'text-gray-900'}`}>
            The Balance Code Alliance
          </span>
          <span className={`header-subtitle-small ${isDark ? 'text-white' : 'text-gray-700'}`}>
            Restoring Order. Unlocking Peace. Empowering Lives
          </span>
        </div>

        <div className="header-right flex items-center">
          <button 
            className={`nav-toggle ${isDark ? 'text-white hover:text-emerald-300' : 'text-gray-800 hover:text-indigo-600'}`}
            onClick={toggleNav}
            aria-label={isNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={isNavOpen}
          >
            {isNavOpen ? '✕' : '☰'}
          </button>
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        </div>
      </header>

      {isNavOpen && (
        <>
          <nav className={`nav ${isNavOpen ? 'open' : ''} ${isDark ? 'bg-black' : 'bg-white'}`}>
            <Link to="/" className={`nav-link ${isDark ? 'text-white hover:text-emerald-300' : 'text-gray-900 hover:text-indigo-600'}`}>Home</Link>
            <Link to="/about" className={`nav-link ${isDark ? 'text-white hover:text-emerald-300' : 'text-gray-900 hover:text-indigo-600'}`}>About</Link>
            <Link to="/contact" className={`nav-link ${isDark ? 'text-white hover:text-emerald-300' : 'text-gray-900 hover:text-indigo-600'}`}>Contact</Link>
            <Link to="/gallery" className={`nav-link ${isDark ? 'text-white hover:text-emerald-300' : 'text-gray-900 hover:text-indigo-600'}`}>Gallery</Link>
          </nav>
          <div className={`nav-overlay ${isNavOpen ? 'open' : ''}`} onClick={closeNav} aria-hidden="true" />
        </>
      )}

      <main className={`flex-1 pt-24 pb-8 px-4 container mx-auto w-full ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {children}
      </main>

      <footer className={`footer ${isDark ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}>
        © {new Date().getFullYear()} Onyxe Nnaemeka's Blog. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;