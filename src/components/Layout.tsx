'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import NotificationBell from './NotificationBell';
import { supabase } from '@/lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin';
  const isAdminPage = pathname ? pathname.startsWith('/admin') && !isLoginPage : false;
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const closeNav = () => {
    setIsNavOpen(false);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
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
  }, [pathname]);

  useEffect(() => {
    if (isLoginPage) {
      let active = true;
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;
        if (session) {
          router.replace('/admin/dashboard');
        }
      };

      checkSession();
      return () => {
        active = false;
      };
    }

    if (!isAdminPage) return;

    let active = true;
    setIsCheckingAuth(true);

    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!active) return;

      if (!session || error) {
        router.replace('/admin/login');
        setIsCheckingAuth(false);
        return;
      }

      setIsCheckingAuth(false);
    };

    checkAuth();

    return () => {
      active = false;
    };
  }, [isAdminPage, isLoginPage, pathname, router]);

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

  if (isLoginPage) {
    return (
      <div className={`min-h-screen flex flex-col transition-colors duration-200 ${isDark ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}`}>
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    );
  }

  if (isAdminPage && isCheckingAuth) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className="text-lg font-medium">Checking session...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${isDark ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}`}>
      {isAdminPage ? (
        <>
          <aside
            className={`fixed left-0 top-0 z-40 flex h-screen w-72 flex-col justify-between border-r border-gray-200 bg-white p-6 shadow-lg ${isDark ? 'bg-black text-white border-gray-800' : 'bg-white text-gray-900'}`}
          >
            <div>
              <div className={`mb-10 text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Admin Panel
              </div>

              <nav className="flex flex-col space-y-2">
                <Link
                  href="/admin/dashboard"
                  className={`nav-link ${
                    pathname === '/admin/dashboard'
                      ? (isDark ? 'text-emerald-300' : 'text-blue-600')
                      : (isDark ? 'text-white hover:text-emerald-300' : 'text-gray-900 hover:text-indigo-600')
                  }`}
                >
                  Admin Dashboard
                </Link>

                <Link
                  href="/admin/ads"
                  className={`nav-link ${
                    pathname === '/admin/ads'
                      ? (isDark ? 'text-emerald-300' : 'text-blue-600')
                      : (isDark ? 'text-white hover:text-emerald-300' : 'text-gray-900 hover:text-indigo-600')
                  }`}
                >
                  Manage Ads
                </Link>

                <Link
                  href="/admin/upload-gallery"
                  className={`nav-link ${
                    pathname === '/admin/upload-gallery'
                      ? (isDark ? 'text-emerald-300' : 'text-blue-600')
                      : (isDark ? 'text-white hover:text-emerald-300' : 'text-gray-900 hover:text-indigo-600')
                  }`}
                >
                  Manage Gallery
                </Link>
              </nav>
            </div>

            <button
              onClick={handleAdminLogout}
              className={`nav-link text-left ${isDark ? 'text-white hover:text-emerald-300' : 'text-gray-900 hover:text-indigo-600'}`}
            >
              Logout
            </button>
          </aside>
        </>
      ) : (
        <>
          <header className={`header ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
            <div className="header-left">
              <span className={`header-title-large ${isDark ? 'text-white' : 'text-gray-900'}`}>
                The Phinominal African Lives
              </span>
              <span className={`header-subtitle-small ${isDark ? 'text-white' : 'text-gray-700'}`}>
                African stories that remind us who we are and what is possible
              </span>
            </div>

            <div className="header-right flex items-center">
              <button
                className={`nav-toggle ${isDark ? 'text-white hover:text-emerald-300' : 'text-gray-800 hover:text-indigo-600'}`}
                onClick={toggleNav}
                aria-label={isNavOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isNavOpen}
              >
                {isNavOpen ? '✕' : '☰'}
              </button>
            </div>
          </header>

          {isNavOpen && (
            <>
              <nav className={`nav ${isNavOpen ? 'open' : ''} ${isDark ? 'bg-black' : 'bg-white'}`}>
                <Link href="/" className={`nav-link ${isDark ? 'text-white hover:text-emerald-300' : 'text-gray-900 hover:text-indigo-600'}`}>Home</Link>
                <Link href="/about" className={`nav-link ${isDark ? 'text-white hover:text-emerald-300' : 'text-gray-900 hover:text-indigo-600'}`}>About</Link>
                <Link href="/contact" className={`nav-link ${isDark ? 'text-white hover:text-emerald-300' : 'text-gray-900 hover:text-indigo-600'}`}>Contact</Link>
                <Link href="/gallery" className={`nav-link ${isDark ? 'text-white hover:text-emerald-300' : 'text-gray-900 hover:text-indigo-600'}`}>Gallery</Link>
              </nav>
              <div className={`nav-overlay ${isNavOpen ? 'open' : ''}`} onClick={closeNav} aria-hidden="true" />
            </>
          )}
        </>
      )}

      <main className={`flex-1 ${isAdminPage ? 'pt-6 md:pl-72' : 'pt-24'} pb-8 px-4 container mx-auto w-full ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {children}
      </main>

      {!isAdminPage && <NotificationBell isDark={isDark} toggleTheme={toggleTheme} />}

      {!isAdminPage && (
        <footer className={`footer ${isDark ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}>
          © {new Date().getFullYear()} Onyxe Nnaemeka's Blog. All rights reserved.
        </footer>
      )}
    </div>
  );
};

export default Layout;