import React, { useMemo } from 'react';
import { FlatList, Text, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { AppTheme } from '../theme/index';

const CallsScreen = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      data={Array(200)}
      keyExtractor={(_, index) => index.toString()}
      renderItem={() => <Text>Call</Text>}
      ListHeaderComponent={<Text style={styles.text}>Calls</Text>}
    />
  );
};

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgrounds.default,
    },
    contentContainer: {
      flexGrow: 1,
      paddingBottom: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      ...typography.variants.heading1,
      color: colors.text.primary,
    },
  });

export default CallsScreen;
