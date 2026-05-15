import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const get = (key, fallback) => {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
};

export function ThemeProvider({ children }) {
  const [mode, setModeState]         = useState(() => get('tc-mode', 'dark'));
  const [theme, setThemeState]       = useState(() => get('tc-theme', 'default'));
  const [headerType, setHeaderState] = useState(() => get('tc-header', 'fixed'));
  const [contentWidth, setWidthState]= useState(() => get('tc-content', 'wide'));
  const [systemDark, setSystemDark]  = useState(() => {
    try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch { return false; }
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const h = e => setSystemDark(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  const dark = mode === 'dark' || (mode === 'system' && systemDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tc-theme', theme);
  }, [theme]);

  useEffect(() => { localStorage.setItem('tc-mode', mode); }, [mode]);
  useEffect(() => { localStorage.setItem('tc-header', headerType); }, [headerType]);
  useEffect(() => { localStorage.setItem('tc-content', contentWidth); }, [contentWidth]);

  const setMode   = v => setModeState(v);
  const setTheme  = v => setThemeState(v);
  const setHeader = v => setHeaderState(v);
  const setWidth  = v => setWidthState(v);

  const toggle = () => setModeState(m => {
    if (m === 'light') return 'dark';
    if (m === 'dark')  return 'light';
    return dark ? 'light' : 'dark';
  });

  const reset = () => {
    setModeState('dark');
    setThemeState('default');
    setHeaderState('fixed');
    setWidthState('wide');
  };

  return (
    <ThemeContext.Provider value={{
      dark, mode, setMode,
      theme, setTheme,
      headerType, setHeader,
      contentWidth, setWidth,
      toggle, reset,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
