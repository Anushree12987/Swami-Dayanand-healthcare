import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      className={`relative w-[72px] h-[36px] rounded-full flex items-center transition-colors duration-300 ${
        isDark ? 'bg-[#1F2937]' : 'bg-white'
      } border ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
      style={{
        boxShadow: isDark ? '3px 4px 0px rgba(0,0,0,0.5)' : '3px 4px 0px rgba(0,0,0,0.1)'
      }}
    >
      {/* Background Icons (inactive state hints) */}
      <div className="absolute w-full flex justify-between px-2 text-[14px] pointer-events-none">
        <FaSun className={`transition-opacity duration-300 ${isDark ? 'text-gray-400 opacity-100' : 'text-transparent opacity-0'}`} />
        <FaMoon className={`transition-opacity duration-300 ${isDark ? 'text-transparent opacity-0' : 'text-gray-400 opacity-100'}`} />
      </div>

      {/* Sliding Blue Thumb */}
      <div
        className={`absolute top-[4px] left-[4px] w-[26px] h-[26px] bg-[#2563EB] rounded-full flex items-center justify-center transition-transform duration-300 ease-spring shadow-sm z-10 ${
          isDark ? 'translate-x-[36px]' : 'translate-x-0'
        }`}
      >
        {isDark ? (
          <FaMoon className="text-gray-900 dark:text-white text-[12px]" />
        ) : (
          <FaSun className="text-gray-900 dark:text-white text-[12px]" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
