import React, { useLayoutEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { getInitials } from '../../utils/StringUtils';

interface ChatScreenHeaderProps {
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
  isLoading: boolean;
  onAvatarPress: () => void;
}

export const ChatScreenHeader = ({
  name,
  avatarUrl,
  isOnline,
  isLoading,
  onAvatarPress,
}: ChatScreenHeaderProps) => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleRow}>
          {avatarUrl ? (
            <TouchableOpacity activeOpacity={0.7} onPress={onAvatarPress}>
              <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
            </TouchableOpacity>
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{getInitials(name)}</Text>
            </View>
          )}
          <Animated.View
            layout={LinearTransition}
            style={styles.headerTextContainer}
          >
            <Text style={styles.headerTitle} numberOfLines={1}>
              {name}
            </Text>
            {isOnline && <Text style={styles.headerSubtitle}>online</Text>}
          </Animated.View>
          {isLoading && (
            <ActivityIndicator
              size="small"
              color={theme.colors.brand.primary}
              style={styles.headerSpinner}
            />
          )}
        </View>
      ),
      headerLeft: undefined,
      headerRight: undefined,
    });
  }, [
    name,
    avatarUrl,
    isLoading,
    isOnline,
    navigation,
    theme,
    styles,
    onAvatarPress,
  ]);

  return null;
};

const makeStyles = ({ colors, typography, spacing }: AppTheme) =>
  StyleSheet.create({
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerAvatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      marginRight: spacing.sm,
    },
    avatarPlaceholder: {
      width: 34,
      height: 34,
      borderRadius: 17,
      marginRight: spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surfaces.secondary,
      borderWidth: 1,
      borderColor: colors.borders.light,
    },
    avatarText: {
      ...typography.variants.bodyMedium,
      fontWeight: 'bold',
      color: colors.text.primary,
      fontSize: 14,
    },
    headerTextContainer: {
      justifyContent: 'center',
    },
    headerTitle: {
      ...typography.variants.bodyMedium,
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    headerSubtitle: {
      ...typography.variants.description,
      color: colors.brand.primary,
      fontSize: 12,
    },
    headerSpinner: {
      marginLeft: spacing.sm,
    },
  });
