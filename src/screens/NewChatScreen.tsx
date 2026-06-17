import React, { useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import { AppStackParamList } from '../navigation/AppStack';
import { useAppTheme } from '../hooks/useAppTheme';
import { useUserSearch } from '../hooks/useUserSearch';
import { useConversationActions } from '../hooks/useConversationActions';
import type { UserSearchResponse } from '../types/ApiTypes/RestApiTypes/restApiTypes';
import { AppTheme } from '../theme';
import { Input } from '../components/foundations/Input';
import { setupConversation } from '../services/Chat/chatController';
import { useUserStore } from '../store/userStore';

const NewChatScreen = () => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const { searchQuery, users, isLoading, handleSearch } = useUserSearch();
  const { isStarting, selectedUserId, startConversation } =
    useConversationActions();
  const { userId } = useUserStore();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'New Chat',
      headerLargeTitle: true,
    });
  }, [navigation]);

  const onUserPress = async (user: UserSearchResponse) => {
    try {
      const response = await startConversation(user.user_id);
      if (response.success && response.data) {
        const chatId = String(response.data.conversation_id);
        const name =
          `${user.firstname} ${user.lastname}`.trim() || user.username;

        // Populate chat, users, and chat_participants tables
        await setupConversation(chatId, user, String(userId));

        navigation.navigate('Chat', {
          name,
          chatId,
          avatarUrl: user.avatar_url || undefined,
          chatType: 'individual',
          otherUserId: String(user.user_id),
        });
      }
    } catch (error) {
      // Error is already logged in the hook
    }
  };

  const getInitials = (user: UserSearchResponse) => {
    const f = user.firstname?.[0] || '';
    const l = user.lastname?.[0] || '';
    return (f + l).toUpperCase() || '?';
  };

  const renderItem = ({ item }: { item: UserSearchResponse }) => {
    const isThisUserStarting = selectedUserId === item.user_id;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.userCard,
          pressed && styles.userCardPressed,
        ]}
        onPress={() => onUserPress(item)}
        disabled={isStarting}
      >
        <View style={styles.avatar}>
          {item.avatar_url ? (
            <Image
              source={{ uri: item.avatar_url }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>{getInitials(item)}</Text>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.firstname} {item.lastname}
          </Text>
          <Text style={styles.userUsername}>@{item.username}</Text>
        </View>
        {isThisUserStarting && (
          <ActivityIndicator
            size="small"
            color={theme.colors.brand.primary}
            style={styles.cardLoader}
          />
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search for users..."
          value={searchQuery}
          onChangeText={handleSearch}
          leftIcon={
            <Search
              size={theme.sizing.iconSizes.md}
              color={theme.colors.text.secondary}
            />
          }
          autoFocus
          clearButtonMode="while-editing"
          editable={!isStarting}
        />
      </View>

      {isLoading && users.length === 0 ? (
        <ActivityIndicator
          style={styles.loader}
          color={theme.colors.brand.primary}
        />
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => String(item.user_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          contentInsetAdjustmentBehavior="automatic"
          ListEmptyComponent={
            searchQuery.length > 0 && !isLoading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No users found for "{searchQuery}"
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const makeStyles = ({
  colors,
  spacing,
  typography,
  borderRadius,
  sizing,
}: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgrounds.default,
    },
    searchContainer: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      backgroundColor: colors.backgrounds.default,
    },
    loader: {
      marginTop: spacing.xl,
    },
    listContent: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xl,
    },
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borders.separator,
    },
    userCardPressed: {
      backgroundColor: colors.surfaces.default,
    },
    avatar: {
      width: sizing.xxxl + sizing.xxs,
      height: sizing.xxxl + sizing.xxs,
      borderRadius: (sizing.xxxl + sizing.xxs) / 2,
      backgroundColor: colors.brand.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarText: {
      ...typography.variants.heading3,
      color: colors.brand.primary,
      fontWeight: '600',
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      ...typography.variants.bodyMedium,
      fontWeight: '600',
      color: colors.text.primary,
    },
    userUsername: {
      ...typography.variants.description,
      color: colors.text.secondary,
      marginTop: sizing.xxs,
    },
    emptyContainer: {
      marginTop: spacing.xxl,
      alignItems: 'center',
    },
    emptyText: {
      ...typography.variants.bodyMedium,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    cardLoader: {
      marginLeft: spacing.sm,
    },
  });

export default NewChatScreen;
