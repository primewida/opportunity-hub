import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('oh-theme');
    if (saved) return saved;
    return 'system';
  });

  const getEffectiveTheme = useCallback(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }, [theme]);

  useEffect(() => {
    const effective = getEffectiveTheme();
    document.documentElement.setAttribute('data-theme', effective);
    document.body.classList.add('theme-transitioning');
    const timer = setTimeout(() => document.body.classList.remove('theme-transitioning'), 300);
    localStorage.setItem('oh-theme', theme);
    return () => clearTimeout(timer);
  }, [theme, getEffectiveTheme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      document.documentElement.setAttribute('data-theme', mq.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const effective = getEffectiveTheme();
      return effective === 'light' ? 'dark' : 'light';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, effectiveTheme: getEffectiveTheme() }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
