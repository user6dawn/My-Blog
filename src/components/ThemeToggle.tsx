import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className={`fixed top-4 right-[80px] z-50 p-3 rounded-full shadow-lg transition-colors duration-300 ease-in-out border ${
        isDark
          ? 'bg-black text-white border-gray-700 hover:bg-gray-900'
          : 'bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-100'
      }`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-6 h-6 text-amber-400" />
      ) : (
        <Moon className="w-6 h-6 text-indigo-600" />
      )}
    </button>
  );
};

export default ThemeToggle;