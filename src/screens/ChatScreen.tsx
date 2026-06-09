import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useNavigation,
  type StaticScreenProps,
} from '@react-navigation/native';

import { useAppTheme } from '../hooks/useAppTheme';
import { useChatStore } from '../store/chatStore';
import { AppTheme } from '../theme';
import { ChatBox } from '../components/chat/ChatBox';
import { getInitials } from '../utils/StringUtils';
import { ImagePreviewModal } from '../components/common/ImagePreviewModal';

// ─── Screen ───────────────────────────────────────────────────────────────────

export type ChatScreenParams = {
  name: string;
  chatId: string;
  avatarUrl?: string;
};
type Props = StaticScreenProps<ChatScreenParams>;

const ChatScreen = ({ route }: Props) => {
  const navigation = useNavigation();
  const { name, chatId, avatarUrl } = route.params;
  const setActiveChatId = useChatStore(s => s.setActiveChatId);
  const appTheme = useAppTheme();
  const styles = useMemo(() => makeStyles(appTheme), [appTheme]);

  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  // Register active chat (used by WebSocket routing)
  useEffect(() => {
    setActiveChatId(chatId);
    return () => setActiveChatId(null);
  }, [chatId, setActiveChatId]);

  // ─── Navigation header ─────────────────────────────────────────────────────
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleRow}>
          {avatarUrl ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsPreviewVisible(true)}
            >
              <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
            </TouchableOpacity>
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{getInitials(name)}</Text>
            </View>
          )}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {name}
            </Text>
          </View>
          {isLoading && (
            <ActivityIndicator
              size="small"
              color={appTheme.colors.brand.primary}
              style={styles.headerSpinner}
            />
          )}
        </View>
      ),
      headerLeft: undefined,
      headerRight: undefined,
    });
  }, [name, avatarUrl, isLoading, navigation, appTheme, styles]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <ChatBox chatId={chatId} onLoadingChange={setIsLoading} />
      <ImagePreviewModal
        visible={isPreviewVisible}
        imageUrl={avatarUrl}
        title={name}
        onClose={() => setIsPreviewVisible(false)}
      />
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    headerSpinner: {
      marginLeft: spacing.sm,
    },
  });

export default ChatScreen;
