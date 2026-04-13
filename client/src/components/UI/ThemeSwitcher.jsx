import { useState, useRef, useEffect } from 'react';
import useThemeStore from '../../stores/useThemeStore';
import { themes } from '../../themes/themes';

export default function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const currentTheme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeData = themes[currentTheme];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 
                   border border-border hover:border-accent/50 transition-all
                   text-sm text-text-muted hover:text-text"
        title="Switch theme"
      >
        <span>{themeData.icon}</span>
        <span className="hidden sm:inline">{themeData.name}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-border 
                        rounded-xl shadow-2xl shadow-black/30 overflow-hidden animate-fade-in z-50">
          <div className="px-3 py-2 text-xs text-text-muted font-medium uppercase tracking-wider border-b border-border">
            Theme
          </div>
          {Object.values(themes).map((theme) => (
            <button
              key={theme.key}
              onClick={() => {
                setTheme(theme.key);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors
                ${currentTheme === theme.key 
                  ? 'bg-accent/10 text-accent' 
                  : 'text-text hover:bg-surface-2'}`}
            >
              <span className="text-base">{theme.icon}</span>
              <span className="flex-1 text-left font-medium">{theme.name}</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full border border-border" style={{ background: theme.preview.bg }} />
                <div className="w-3 h-3 rounded-full border border-border" style={{ background: theme.preview.accent }} />
                <div className="w-3 h-3 rounded-full border border-border" style={{ background: theme.preview.surface }} />
              </div>
              {currentTheme === theme.key && (
                <svg width="14" height="14" viewBox="0 0 14 14" className="text-accent">
                  <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
