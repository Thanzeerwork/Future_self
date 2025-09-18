import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3DarkTheme as PaperDarkTheme, MD3LightTheme as PaperLightTheme } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme } from '@react-navigation/native';
import { colors as baseColors } from '../constants/colors';

const STORAGE_KEY = 'app-theme';

const ThemeContext = createContext({});

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

const buildColorPalette = (mode) => {
  if (mode === 'dark') {
    return {
      ...baseColors,
      background: baseColors.dark.background,
      surface: baseColors.dark.surface,
      text: baseColors.dark.text,
      textPrimary: baseColors.dark.text,
      textSecondary: baseColors.dark.textSecondary,
      border: baseColors.dark.border,
      white: baseColors.white,
      black: baseColors.black,
    };
  }
  return {
    ...baseColors,
    textPrimary: baseColors.text,
  };
};

export const ThemeProvider = ({ children }) => {
  const systemScheme = Appearance.getColorScheme();
  const defaultMode = systemScheme === 'dark' ? 'dark' : 'light';
  const [mode, setMode] = useState(defaultMode);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
          setMode(saved);
        }
      } catch {}
      setBootstrapped(true);
    })();
  }, []);

  const toggleMode = async () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  const paperTheme = useMemo(() => {
    const isDark = mode === 'dark';
    const base = isDark ? PaperDarkTheme : PaperLightTheme;
    const palette = buildColorPalette(mode);
    return {
      ...base,
      dark: isDark,
      colors: {
        ...base.colors,
        primary: baseColors.primary,
        secondary: baseColors.secondary,
        background: palette.background,
        surface: palette.surface,
        text: palette.text,
        outline: palette.border,
        error: baseColors.error,
      },
    };
  }, [mode]);

  const navigationTheme = useMemo(() => {
    const isDark = mode === 'dark';
    const base = isDark ? NavigationDarkTheme : NavigationLightTheme;
    const palette = buildColorPalette(mode);
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: baseColors.primary,
        background: palette.background,
        card: palette.surface,
        text: palette.text,
        border: palette.border,
        notification: baseColors.accent,
      },
    };
  }, [mode]);

  const colors = useMemo(() => buildColorPalette(mode), [mode]);

  const value = {
    mode,
    isDark: mode === 'dark',
    toggleMode,
    setMode,
    paperTheme,
    navigationTheme,
    colors,
    bootstrapped,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};


