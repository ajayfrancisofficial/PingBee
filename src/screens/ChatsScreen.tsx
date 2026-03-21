import { useNavigation } from '@react-navigation/native';
import React, { useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useFetchChats, Chat } from '../hooks/queries/useChats';
import { useAppTheme } from '../hooks/useAppTheme';
import { AppTheme } from '../theme/index';

const ChatsScreen = () => {
  const navigation = useNavigation<any>();
  const { data: chats, isPending, isError } = useFetchChats();
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        isPending ? (
          <ActivityIndicator size="small" color={theme.colors.brand.primary} />
        ) : null,
      headerSearchBarOptions: {
        // search bar options
        hideWhenScrolling: true,
      },
    });
  }, [navigation, isPending, theme]);

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const renderItem = ({ item }: { item: Chat }) => (
    <Pressable
      style={({ pressed }) => [
        styles.chatItem,
        pressed && styles.chatItemPressed,
      ]}
      onPress={() => {
        navigation.navigate('Chat', { name: item.name, chatId: item.id });
      }}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
      </View>

      <View style={styles.chatContent}>
        <Text style={styles.chatName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text
          style={[
            styles.lastMessage,
            item.unreadCount ? styles.lastMessageUnread : null,
          ]}
          numberOfLines={2}
        >
          {item.lastMessage}
        </Text>
      </View>

      {item.unreadCount ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {item.unreadCount > 99 ? '99+' : item.unreadCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );

  return (
    <FlatList
      contentInsetAdjustmentBehavior={'automatic'}
      data={chats}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

const makeStyles = ({ colors, typography, spacing, borderRadius }: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgrounds.default,
    },
    list: {
      paddingBottom: 100, // accommodate bottom tab bar
    },
    chatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borders.separator,
      backgroundColor: colors.backgrounds.default,
    },
    chatItemPressed: {
      backgroundColor: colors.surfaces.default, // subtle honey tint on press
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.surfaces.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
      borderWidth: 1,
      borderColor: colors.borders.light,
    },
    avatarText: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.bold,
      color: colors.brand.primaryDark,
    },
    chatContent: {
      flex: 1,
      justifyContent: 'center',
    },
    chatName: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semiBold,
      color: colors.text.primary,
      marginBottom: 4,
    },
    lastMessage: {
      fontSize: typography.sizes.sm,
      color: colors.text.secondary,
      fontWeight: typography.weights.regular,
    },
    lastMessageUnread: {
      color: colors.text.primary,
      fontWeight: typography.weights.medium,
    },
    badge: {
      backgroundColor: colors.brand.primary,
      borderRadius: borderRadius.pill,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 8,
      marginLeft: spacing.sm,
    },
    badgeText: {
      color: colors.absolute.white,
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.bold,
    },
    errorText: {
      textAlign: 'center',
      marginTop: spacing.xl,
      color: colors.semantic.error,
      fontSize: typography.sizes.sm,
    },
  });

export default ChatsScreen;
