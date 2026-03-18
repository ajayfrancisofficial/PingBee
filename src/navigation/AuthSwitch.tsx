import React, { useEffect } from 'react';
import { createStaticNavigation } from '@react-navigation/native';
import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';
import { useAuthStore } from '../store/authStore';

const AppNavigation = createStaticNavigation(AppStack);
const AuthNavigation = createStaticNavigation(AuthStack);

export const AuthSwitch = () => {
  const { isLoggedIn, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return null; // Awaiting Keychain extraction
  }

  return isLoggedIn ? <AppNavigation /> : <AuthNavigation />;
};
