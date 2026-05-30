import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import {
  useNavigation,
  type StaticScreenProps,
} from '@react-navigation/native';

import { useAppTheme } from '../hooks/useAppTheme';
import { useChatStore } from '../store/chatStore';
import { AppTheme } from '../theme';
import { ChatBox } from '../components/chat/ChatBox';

// ─── Screen ───────────────────────────────────────────────────────────────────

export type ChatScreenParams = { name: string; chatId: string };
type Props = StaticScreenProps<ChatScreenParams>;

const ChatScreen = ({ route }: Props) => {
  const navigation = useNavigation();
  const { name, chatId } = route.params;
  const setActiveChatId = useChatStore(s => s.setActiveChatId);
  const appTheme = useAppTheme();
  const styles = useMemo(() => makeStyles(appTheme), [appTheme]);

  const [isLoading, setIsLoading] = useState(false);

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
          <Text style={styles.headerTitle} numberOfLines={1}>
            {name}
          </Text>
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
  }, [name, isLoading, navigation, appTheme, styles]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return <ChatBox chatId={chatId} onLoadingChange={setIsLoading} />;
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = ({ colors, typography, spacing }: AppTheme) =>
  StyleSheet.create({
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
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
