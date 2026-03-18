import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '../components/foundations/Button';
import { useAuthStore } from '../store/authStore';
import { theme } from '../theme';

export const YouScreen = () => {
  const logout = useAuthStore(state => state.logout);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (e) {
      console.log('Error logging out', e);
    } finally {
      // It will unmount as soon as Zustand updates isLoggedIn
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button 
        title="Logout" 
        onPress={handleLogout} 
        variant="outline" 
        isLoading={loading}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    marginTop: theme.spacing.md,
  },
});
