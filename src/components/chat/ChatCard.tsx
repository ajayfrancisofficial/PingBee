import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import Chat from '../../db/models/Chat';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { Users } from 'lucide-react-native';
import { useUserStore } from '../../store/userStore';

interface ChatCardProps {
  chat: Chat;
  onPress: (chat: Chat) => void;
}

const ChatCardComponent = ({ chat, onPress }: ChatCardProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const currentUser = useUserStore(state => state.username);
  console.log('🚀 ~ ChatCardComponent ~ currentUser:', currentUser);

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();

    // If it's today, show time. Otherwise, show date.
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.chatItem,
        pressed && styles.chatItemPressed,
      ]}
      onPress={() => onPress(chat)}
    >
      <View style={styles.avatar}>
        {chat.avatarUrl ? (
          <Image source={{ uri: chat.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{getInitials(chat.name)}</Text>
        )}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.headerRow}>
          <View style={styles.nameRow}>
            {chat.type === 'group' && (
              <Users
                color={theme.colors.text.secondary}
                size={theme.typography.variants.bodyMedium.fontSize}
                style={styles.groupIcon}
              />
            )}
            <Text style={styles.chatName} numberOfLines={1}>
              {chat.name}
            </Text>
          </View>
          <Text style={styles.timeText}>{formatTime(chat.updatedAt)}</Text>
        </View>

        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              chat.unreadCount ? styles.lastMessageUnread : null,
            ]}
            numberOfLines={2}
          >
            {chat.lastMessageSentUsername
              ? chat.lastMessageSentUsername === currentUser
                ? 'You: '
                : chat.type !== 'individual'
                ? `${chat.lastMessageSentUsername}: `
                : null
              : null}
            {chat.lastMessageText ?? ''}
          </Text>

          {chat.unreadCount ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

const enhance = withObservables(['chat'], ({ chat }: { chat: Chat }) => ({
  chat,
}));

export const ChatCard = enhance(ChatCardComponent);

const makeStyles = ({
  colors,
  typography,
  spacing,
  borderRadius,
  sizing,
}: AppTheme) =>
  StyleSheet.create({
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
      backgroundColor: colors.surfaces.default,
    },
    avatar: {
      width: sizing.xxxl + sizing.xs,
      height: sizing.xxxl + sizing.xs,
      borderRadius: (sizing.xxxl + sizing.xs) / 2,
      backgroundColor: colors.surfaces.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
      borderWidth: 1,
      borderColor: colors.borders.light,
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarText: {
      ...typography.variants.heading1,
      fontSize: 28,
      color: colors.text.primary,
    },
    chatContent: {
      flex: 1,
      justifyContent: 'center',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      paddingRight: spacing.sm,
    },
    groupIcon: {
      marginRight: spacing.xs,
    },
    chatName: {
      ...typography.variants.bodyMedium,
      color: colors.text.primary,
      flex: 1,
    },
    timeText: {
      ...typography.variants.caption,
      color: colors.text.secondary,
    },
    messageRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    lastMessage: {
      ...typography.variants.description,
      color: colors.text.secondary,
      flex: 1,
      paddingRight: spacing.sm,
    },
    lastMessageUnread: {
      ...typography.variants.description,
      fontWeight: typography.weights.medium,
      color: colors.brand.primary,
    },
    badge: {
      backgroundColor: colors.brand.primary,
      borderRadius: borderRadius.pill,
      minWidth: sizing.lg,
      height: sizing.lg,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 8,
    },
    badgeText: {
      color: colors.absolute.white,
      ...typography.variants.caption,
      fontWeight: '700',
    },
  });
