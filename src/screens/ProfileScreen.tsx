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
import { useAppTheme } from '../hooks/useAppTheme';
import { useUserStore } from '../store/userStore';
import { AppTheme } from '../theme';
import { ChevronRight } from 'lucide-react-native';

const edges: Edges = Platform.select({
  ios: ['bottom'],
  default: [],
});

interface ProfileRowProps {
  label: string;
  value: string;
  styles: ReturnType<typeof makeStyles>;
  theme: AppTheme;
  onPress?: () => void;
}

const ProfileRow = ({ label, value, styles, theme, onPress }: ProfileRowProps) => (
  <View style={styles.rowSection}>
    <Text style={styles.rowLabel}>{label}</Text>
    <TouchableOpacity
      style={styles.rowCard}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <Text style={styles.rowValue}>{value}</Text>
      <ChevronRight size={20} color={theme.colors.text.tertiary} />
    </TouchableOpacity>
  </View>
);

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const { name, about, phoneNumber, profilePicture } = useUserStore();



  return (
    <SafeAreaView edges={edges} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Image */}
        <View style={styles.imageSection}>
          <Image source={{ uri: profilePicture }} style={styles.profileImage} />
          <TouchableOpacity activeOpacity={0.6}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <ProfileRow
          label="About"
          value={about}
          styles={styles}
          theme={theme}
        />

        {/* Name */}
        <ProfileRow
          label="Name"
          value={name}
          styles={styles}
          theme={theme}
        />

        {/* Phone Number */}
        <ProfileRow
          label="Phone number"
          value={phoneNumber}
          styles={styles}
          theme={theme}
        />

        {/* Links */}
        <View style={styles.rowSection}>
          <Text style={styles.rowLabel}>Links</Text>
          <TouchableOpacity style={styles.rowCard} activeOpacity={0.6}>
            <Text style={styles.addLinksText}>Add links</Text>
            <ChevronRight size={20} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        </View>
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

    /* Image Section */
    imageSection: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    profileImage: {
      width: 140,
      height: 140,
      borderRadius: 70,
    },
    editText: {
      color: colors.brand.primary,
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semiBold,
      marginTop: spacing.sm,
    },

    /* Rows */
    rowSection: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    rowLabel: {
      fontSize: typography.sizes.sm,
      color: colors.text.secondary,
      fontWeight: typography.weights.medium,
      marginBottom: spacing.xs,
    },
    rowCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surfaces.default,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.lg,
    },
    rowValue: {
      fontSize: typography.sizes.md,
      color: colors.text.primary,
      flex: 1,
    },
    addLinksText: {
      fontSize: typography.sizes.md,
      color: colors.brand.primary,
      fontWeight: typography.weights.medium,
      flex: 1,
    },
  });
