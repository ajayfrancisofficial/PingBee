import { useNavigation } from '@react-navigation/native';
import React, { useLayoutEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useLocalChats } from '../hooks/db/useLocalChats';
import { useAppTheme } from '../hooks/useAppTheme';
import { AppTheme } from '../theme/index';
import Chat from '../db/models/Chat';

const ChatsScreen = () => {
  const navigation = useNavigation();
  const chats = useLocalChats();
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        hideWhenScrolling: true,
      },
    });
  }, [navigation]);

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
          {item.lastMessageText ?? ''}
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
      style={styles.container}
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
      ...typography.variants.heading1,
      fontSize: 28, // Maintain slight override for heading
      color: colors.text.primary,
    },
    chatContent: {
      flex: 1,
      justifyContent: 'center',
    },
    chatName: {
      ...typography.variants.bodyMedium,
      color: colors.text.primary,
      marginBottom: 4,
    },
    lastMessage: {
      ...typography.variants.description,
      color: colors.text.secondary,
    },
    lastMessageUnread: {
      ...typography.variants.description,
      fontWeight: typography.weights.medium,
      color: typography.variants.bodyMedium.fontWeight
        ? colors.brand.primary
        : colors.brand.primary,
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
      ...typography.variants.caption,
      fontWeight: '700', // keeping bold
    },
    errorText: {
      textAlign: 'center',
      marginTop: spacing.xl,
      color: colors.semantic.error,
      ...typography.variants.description,
    },
  });

export default ChatsScreen;
