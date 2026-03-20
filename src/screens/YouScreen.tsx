import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Edges, SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/foundations/Button';
import { ThemeSwitch } from '../components/common/ThemeSwitch';
import { useAuthStore } from '../store/authStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { AppTheme } from '../theme';

const edges: Edges = Platform.select({
  ios: ['bottom'],
  default: [],
});

export const YouScreen = () => {
  const logout = useAuthStore(state => state.logout);
  const [loading, setLoading] = useState(false);
  const theme = useAppTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (e) {
      console.log('Error logging out', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={edges} style={styles.container}>
      {/* Top row: Appearance toggle */}
      <View style={styles.header}>
        <ThemeSwitch />
      </View>

      <View style={styles.spacer} />

      <Button
        title="Logout"
        onPress={handleLogout}
        variant="outline"
        isLoading={loading}
        style={styles.logoutButton}
      />
    </SafeAreaView>
  );
};

const makeStyles = ({ colors, spacing }: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.lg,
      backgroundColor: colors.backgrounds.default,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    spacer: {
      flex: 1,
    },
    logoutButton: {
      width: '100%',
      marginTop: spacing.md,
    },
  });
