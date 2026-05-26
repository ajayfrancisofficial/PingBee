import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button } from '../foundations/Button';
import { authService } from '../../services/Auth/authService';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';

export const LogoutButton = () => {
  const [loading, setLoading] = useState(false);
  const theme = useAppTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (e) {
      console.log('Error logging out', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      title="Logout"
      onPress={handleLogout}
      variant="outline"
      isLoading={loading}
      style={styles.logoutButton}
    />
  );
};

const makeStyles = ({ spacing }: AppTheme) =>
  StyleSheet.create({
    logoutButton: {
      width: '100%',
      marginTop: spacing.md,
    },
  });
