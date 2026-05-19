import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { userService } from '../services/User/userService';
import { useGuardedFetch } from './useGuardedFetch';

/**
 * Custom hook to fetch the user's profile on screen focus.
 * Uses a concurrency guard via useGuardedFetch to prevent duplicate requests.
 */
export function useUserProfile() {
  const fetchProfile = useCallback(async () => {
    await userService.getProfile();
  }, []);

  const { execute: syncProfile, isLoading } = useGuardedFetch(
    fetchProfile,
    'useUserProfile',
  );

  useFocusEffect(
    useCallback(() => {
      syncProfile();
    }, [syncProfile])
  );

  return { isLoading };
}
