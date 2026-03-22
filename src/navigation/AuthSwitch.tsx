import React, { useEffect } from 'react';
import { createStaticNavigation } from '@react-navigation/native';
import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';
import { useAuthStore } from '../store/authStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { getNavigationTheme } from '../theme/navigationTheme';

const AppNavigation = createStaticNavigation(AppStack);
const AuthNavigation = createStaticNavigation(AuthStack);

export const AuthSwitch = () => {
  const { isLoggedIn, isLoading, checkAuth } = useAuthStore();
  const appTheme = useAppTheme();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return null; // Awaiting Keychain extraction
  }

  const navTheme = getNavigationTheme(appTheme);
  return isLoggedIn ? (
    <AppNavigation theme={navTheme} />
  ) : (
    <AuthNavigation theme={navTheme} />
  );
};
