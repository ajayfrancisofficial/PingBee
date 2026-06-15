import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  Edges,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { LogoutButton } from '../components/common/LogoutButton';
import { useAppTheme } from '../hooks/useAppTheme';
import { useUserStore } from '../store/userStore';
import { AppTheme } from '../theme';
import {
  Mail,
  User as UserIcon,
  CheckCircle,
  AlertCircle,
  UserCircle,
} from 'lucide-react-native';
import { TransitionTags } from '../constants/transitions';

const edges: Edges = Platform.select({
  ios: ['bottom'],
  default: [],
});

import { sizing } from '../theme/sizing';
import { useUserProfile } from '../hooks/useUserProfile';

export const YouScreen = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const { name, profilePicture, email, isVerified, username } = useUserStore();
  const iconColor = theme.colors.text.secondary;
  const iconSize = sizing.iconSizes.base;
  // Sync user profile on focus
  useUserProfile();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [80, 120],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [80, 120],
      [10, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const bodyNameStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [60, 100],
      [1, 0],
      Extrapolation.CLAMP,
    );
    const scale = interpolate(
      scrollY.value,
      [60, 100],
      [1, 0.9],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitleAlign: 'center',
      headerTitle: () => (
        <Animated.View style={headerTitleStyle}>
          <Text style={styles.headerTitleText}>{name}</Text>
        </Animated.View>
      ),
    });
  }, [navigation, name, headerTitleStyle, styles.headerTitleText]);

  return (
    <SafeAreaView edges={edges} style={styles.container}>
      <Animated.FlatList
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        data={[]}
        keyExtractor={(_, index) => index.toString()}
        renderItem={() => null}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <>
            {/* Profile Section */}
            <View style={styles.profileSection}>
              {/* Profile Image */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile')}
                activeOpacity={0.8}
              >
                {profilePicture ? (
                  <Animated.Image
                    source={{ uri: profilePicture }}
                    style={styles.profileImage}
                    sharedTransitionTag={TransitionTags.profileImage}
                  />
                ) : (
                  <View
                    style={[styles.profileImage, styles.placeholderContainer]}
                  >
                    <UserCircle
                      size={100}
                      color={theme.colors.text.tertiary}
                      strokeWidth={1}
                    />
                  </View>
                )}
              </TouchableOpacity>

              {/* Name */}
              <Animated.View style={[styles.nameRow, bodyNameStyle]}>
                <Text style={styles.nameText}>{name}</Text>
              </Animated.View>
            </View>

            {/* Profile Info Label */}
            <Text style={styles.sectionLabel}>Profile Info</Text>

            <View style={styles.settingsGroup}>
              {/* Username */}
              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <UserIcon size={iconSize} color={iconColor} />
                  <Text style={styles.infoLabel}>Username</Text>
                </View>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {username || '—'}
                </Text>
              </View>

              {/* Email with verification badge */}
              <View style={styles.emailInfoRow}>
                <View style={styles.emailRowHeader}>
                  <View style={styles.infoRowLeft}>
                    <Mail size={iconSize} color={iconColor} />
                    <Text style={styles.infoLabel}>Email</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('VerifyEmail')}
                    style={styles.manageButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.manageButtonText}>Manage</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.emailRowBody}>
                  <Text style={styles.emailText} numberOfLines={1}>
                    {email || '—'}
                  </Text>
                  {isVerified ? (
                    <CheckCircle
                      size={sizing.iconSizes.md}
                      color={theme.colors.semantic.success}
                    />
                  ) : (
                    <AlertCircle
                      size={sizing.iconSizes.md}
                      color={theme.colors.semantic.warning}
                    />
                  )}
                </View>
              </View>
            </View>
            {/* Logout */}
            <LogoutButton />
          </>
        }
      />
    </SafeAreaView>
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
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 100,
    },

    /* Top Bar */
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
    },
    topBarIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },

    /* Profile Section */
    profileSection: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    placeholderContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaces.default,
      borderStyle: 'dashed',
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    nameText: {
      ...typography.variants.heading1,
      fontSize: 28, // slight override
      color: colors.text.primary,
    },
    headerTitleText: {
      ...typography.variants.heading3,
      color: colors.text.primary,
      fontWeight: typography.weights.bold,
    },

    /* Section label */
    sectionLabel: {
      ...typography.variants.description,
      fontWeight: typography.weights.medium,
      color: colors.text.secondary,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
    },

    /* Settings / Info Groups */
    settingsGroup: {
      backgroundColor: colors.surfaces.default,
      marginHorizontal: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      overflow: 'hidden',
    },

    /* Profile Info rows */
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borders.separator,
    },
    infoRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    infoLabel: {
      ...typography.variants.body,
      color: colors.text.primary,
    },
    infoValue: {
      ...typography.variants.body,
      color: colors.text.secondary,
      flexShrink: 1,
      textAlign: 'right',
      marginLeft: spacing.sm,
    },
    emailInfoRow: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      gap: spacing.xs,
    },
    emailRowHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    emailRowBody: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingLeft: sizing.iconSizes.base + spacing.md,
    },
    emailText: {
      ...typography.variants.body,
      color: colors.text.secondary,
      flexShrink: 1,
    },
    manageButton: {
      backgroundColor: colors.surfaces.tertiary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      marginLeft: spacing.xs,
    },
    manageButtonText: {
      ...typography.variants.description,
      color: colors.brand.primary,
      fontWeight: typography.weights.medium,
    },
  });
