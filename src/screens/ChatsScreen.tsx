import { Plus } from 'lucide-react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AppStackParamList } from '../navigation/AppStack';
import React, { useLayoutEffect, useMemo } from 'react';
import { View, StyleSheet, Pressable, FlatList } from 'react-native';
import { useLocalChats } from '../hooks/db/useLocalChats';
import { useAppTheme } from '../hooks/useAppTheme';
import { AppTheme } from '../theme/index';
import Chat from '../db/models/Chat';
import { ChatCard } from '../components/chat/ChatCard';
import { AiChatbotFab } from '../components/chat/AiChatbotFab';

const ChatsScreen = () => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { chats, refreshChats, isRefreshing, unreadChatsCount } =
    useLocalChats();
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Chats',
      tabBarBadge: unreadChatsCount > 0 ? unreadChatsCount : undefined,
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('NewChat')}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            marginRight: theme.spacing.sm,
          })}
        >
          <Plus
            color={theme.colors.brand.primary}
            size={theme.sizing.iconSizes.lg}
          />
        </Pressable>
      ),
    });
  }, [navigation, theme, unreadChatsCount]);

  const handleChatPress = (chat: Chat) => {
    navigation.navigate('Chat', {
      name: chat.name,
      chatId: chat.id,
      avatarUrl: chat.avatarUrl,
      chatType: chat.type,
    });
  };

  const renderItem = ({ item }: { item: Chat }) => (
    <ChatCard chat={item} onPress={handleChatPress} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.listContainer}
        contentInsetAdjustmentBehavior={'automatic'}
        data={chats}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onRefresh={refreshChats}
        refreshing={isRefreshing}
      />
      <AiChatbotFab
        onPress={() => {
          navigation.navigate('Chat', {
            name: 'Pingy',
            chatId: 'pingy',
            chatType: 'individual',
          });
        }}
      />
    </View>
  );
};

const makeStyles = ({ colors, typography, spacing }: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgrounds.default,
    },
    listContainer: {
      flex: 1,
    },
    list: {
      paddingBottom: 100, // accommodate bottom tab bar
    },
    footerLoader: {
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    errorText: {
      textAlign: 'center',
      marginTop: spacing.xl,
      color: colors.semantic.error,
      ...typography.variants.description,
    },
  });

export default ChatsScreen;
