import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useThemeMode } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

const Root = () => {
  const { paperTheme, isDark } = useThemeMode();
  return (
    <PaperProvider theme={paperTheme}>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </AuthProvider>
    </PaperProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  );
}
