import React, { useState, useLayoutEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AppStackParamList } from '../navigation/AppStack';
import { useAppTheme } from '../hooks/useAppTheme';
import { userApi } from '../api/RESTApi/userApi';
import { chatApi } from '../api/RESTApi/chatApi';
import type { UserSearchResponse } from '../types/ApiTypes/RestApiTypes/restApiTypes';
import { AppTheme } from '../theme';

const NewChatScreen = () => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await userApi.searchUsers(query);
      if (response.success && response.data) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('[NewChatScreen] Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'New Chat',
      headerLargeTitle: true,
      headerSearchBarOptions: {
        placeholder: 'Search for users...',
        onChangeText: (event: any) => {
          const text = event.nativeEvent.text;
          setSearchQuery(text);
          handleSearch(text);
        },
      },
    });
  }, [navigation, handleSearch]);

  const onUserPress = async (user: UserSearchResponse) => {
    try {
      const response = await chatApi.getOrCreateConversation(user.user_id);
      if (response.success && response.data) {
        navigation.navigate('Chat', {
          name: `${user.firstname} ${user.lastname}`,
          chatId: String(response.data.conversation_id),
        });
      }
    } catch (error) {
      console.error('[NewChatScreen] Failed to start conversation:', error);
    }
  };

  const getInitials = (user: UserSearchResponse) => {
    const f = user.firstname?.[0] || '';
    const l = user.lastname?.[0] || '';
    return (f + l).toUpperCase() || '?';
  };

  const renderItem = ({ item }: { item: UserSearchResponse }) => (
    <Pressable
      style={({ pressed }) => [
        styles.userCard,
        pressed && styles.userCardPressed,
      ]}
      onPress={() => onUserPress(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(item)}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.firstname} {item.lastname}
        </Text>
        <Text style={styles.userUsername}>@{item.username}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
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
    loader: {
      marginTop: spacing.xl,
    },
    listContent: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
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
  });

export default NewChatScreen;
