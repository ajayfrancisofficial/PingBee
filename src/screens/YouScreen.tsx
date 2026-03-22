import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Edges, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ThemeSwitch } from '../components/common/ThemeSwitch';
import { LogoutButton } from '../components/common/LogoutButton';
import { useAppTheme } from '../hooks/useAppTheme';
import { useUserStore } from '../store/userStore';
import { AppTheme } from '../theme';
import {
  Search,
  QrCode,
  List,
  Star,
  Megaphone,
  Monitor,
  UserRound,
  Lock,
  MessageCircle,
  ChevronRight,
} from 'lucide-react-native';

const edges: Edges = Platform.select({
  ios: ['bottom'],
  default: [],
});

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  styles: ReturnType<typeof makeStyles>;
  theme: AppTheme;
}

const SettingsRow = ({
  icon,
  label,
  onPress,
  styles,
  theme,
}: SettingsRowProps) => (
  <TouchableOpacity
    style={styles.settingsRow}
    onPress={onPress}
    activeOpacity={0.6}
  >
    <View style={styles.settingsRowLeft}>
      {icon}
      <Text style={styles.settingsRowLabel}>{label}</Text>
    </View>
    <ChevronRight size={20} color={theme.colors.text.tertiary} />
  </TouchableOpacity>
);

export const YouScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const { name, about, profilePicture } = useUserStore();

  const iconColor = theme.colors.text.secondary;
  const iconSize = 22;

  return (
    <SafeAreaView edges={edges} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBarIcon} activeOpacity={0.6}>
            <Search size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBarIcon} activeOpacity={0.6}>
            <QrCode size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* About tooltip */}
          <View style={styles.aboutBubble}>
            <Text style={styles.aboutText}>{about}</Text>
            <View style={styles.aboutBubbleArrow} />
          </View>

          {/* Profile Image */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: profilePicture }}
              style={styles.profileImage}
            />
          </TouchableOpacity>

          {/* Name */}
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>{name}</Text>
            <View style={styles.plusBadge}>
              <Text style={styles.plusText}>+</Text>
            </View>
          </View>
        </View>

        {/* Settings Label */}
        <Text style={styles.sectionLabel}>Settings</Text>

        {/* Settings Group 1 */}
        <View style={styles.settingsGroup}>
          <SettingsRow
            icon={<List size={iconSize} color={iconColor} />}
            label="Lists"
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon={<Star size={iconSize} color={iconColor} />}
            label="Starred"
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon={<Megaphone size={iconSize} color={iconColor} />}
            label="Broadcast messages"
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon={<Monitor size={iconSize} color={iconColor} />}
            label="Linked devices"
            styles={styles}
            theme={theme}
          />
        </View>

        {/* Settings Group 2 */}
        <View style={styles.settingsGroup}>
          <SettingsRow
            icon={<UserRound size={iconSize} color={iconColor} />}
            label="Account"
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon={<Lock size={iconSize} color={iconColor} />}
            label="Privacy"
            styles={styles}
            theme={theme}
          />
          <SettingsRow
            icon={<MessageCircle size={iconSize} color={iconColor} />}
            label="Chats"
            styles={styles}
            theme={theme}
          />
        </View>

        {/* Appearance toggle */}
        <View style={styles.themeRow}>
          <ThemeSwitch />
        </View>

        {/* Logout */}
        <LogoutButton />
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = ({ colors, spacing, typography, borderRadius }: AppTheme) =>
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
    aboutBubble: {
      backgroundColor: colors.surfaces.default,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.sm,
      position: 'relative',
    },
    aboutText: {
      fontSize: typography.sizes.md,
      color: colors.text.primary,
    },
    aboutBubbleArrow: {
      position: 'absolute',
      bottom: -6,
      alignSelf: 'center',
      left: '50%',
      marginLeft: -6,
      width: 12,
      height: 12,
      backgroundColor: colors.surfaces.default,
      transform: [{ rotate: '45deg' }],
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: colors.surfaces.tertiary,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    nameText: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: colors.text.primary,
    },
    plusBadge: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.semantic.success,
      justifyContent: 'center',
      alignItems: 'center',
    },
    plusText: {
      color: colors.absolute.white,
      fontSize: 14,
      fontWeight: typography.weights.bold,
      lineHeight: 18,
    },

    /* Section label */
    sectionLabel: {
      fontSize: typography.sizes.sm,
      color: colors.text.secondary,
      fontWeight: typography.weights.medium,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
    },

    /* Settings Groups */
    settingsGroup: {
      backgroundColor: colors.surfaces.default,
      marginHorizontal: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      overflow: 'hidden',
    },
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
    },
    settingsRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    settingsRowLabel: {
      fontSize: typography.sizes.md,
      color: colors.text.primary,
      fontWeight: typography.weights.regular,
    },

    /* Theme row */
    themeRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xs,
    },
  });
