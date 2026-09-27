import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemeContextType {
  theme: 'dark' | 'light';
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
  accentColor: '#20C933',
  setAccentColor: () => {},
});

export const applyAccentColorToDom = (color: string) => {
  if (!color) return;
  const hex = color.startsWith('#') ? color : '#20C933';

  try {
    localStorage.setItem('vagou_accent_color', hex);
    const root = document.documentElement;
    root.style.setProperty('--accent-color', hex);
    root.style.setProperty('--color-emerald-500', hex);
    root.style.setProperty('--color-emerald-400', `color-mix(in srgb, ${hex} 85%, white 15%)`);
    root.style.setProperty('--color-emerald-600', `color-mix(in srgb, ${hex} 85%, black 15%)`);

    let styleEl = document.getElementById('vagou-dynamic-accent');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'vagou-dynamic-accent';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      :root {
        --accent-color: ${hex} !important;
        --color-emerald-500: ${hex} !important;
      }
      .text-white, .dark .text-white { color: #ffffff !important; }
    `;
  } catch (err) {
    console.error('Erro ao aplicar cor de destaque:', err);
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    try {
      const explicitChoice = localStorage.getItem('vagou_user_theme_preference');
      if (explicitChoice === 'dark' || explicitChoice === 'light') {
        return explicitChoice;
      }
      const savedLegacy = localStorage.getItem('vagou_theme');
      if (savedLegacy === 'dark' || savedLegacy === 'light') {
        return savedLegacy;
      }
    } catch {}
    return 'dark';
  });

  const [accentColor, setAccentColorState] = useState<string>(() => {
    try {
      return localStorage.getItem('vagou_accent_color') || '#20C933';
    } catch {
      return '#20C933';
    }
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    } catch {}
  }, [theme]);

  useEffect(() => {
    applyAccentColorToDom(accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('vagou_user_theme_preference', next);
        localStorage.setItem('vagou_theme', next);
      } catch {}
      return next;
    });
  };

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('vagou_user_theme_preference', newTheme);
      localStorage.setItem('vagou_theme', newTheme);
    } catch {}
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    applyAccentColorToDom(color);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
