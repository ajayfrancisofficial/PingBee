import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button } from '../foundations/Button';
import { authService } from '../../services/Auth/authService';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ConfirmationModal } from './ConfirmationModal';

export const LogoutButton = () => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const theme = useAppTheme();
  const styles = React.useMemo(() => makeStyles(), [theme]);

  const handleLogout = async () => {
    setShowConfirm(false);
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
    <>
      <Button
        title="Logout"
        onPress={() => setShowConfirm(true)}
        variant="outline"
        isLoading={loading}
        style={styles.logoutButton}
      />
      <ConfirmationModal
        visible={showConfirm}
        title="Logout"
        message="Are you sure you want to log out of PingBee?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowConfirm(false)}
        isDestructive={true}
      />
    </>
  );
};

const makeStyles = () =>
  StyleSheet.create({
    logoutButton: {
      width: '100%',
    },
  });
