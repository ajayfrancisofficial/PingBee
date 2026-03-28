import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Edges, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../hooks/useAppTheme';
import { useUserStore } from '../store/userStore';
import { AppTheme } from '../theme';
import { ChevronRight } from 'lucide-react-native';
import { sizing } from '../theme/sizing';
import { ProfilePictureSection } from '../components/profile/ProfilePictureSection';

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

const ProfileRow = ({
  label,
  value,
  styles,
  theme,
  onPress,
}: ProfileRowProps) => (
  <View style={styles.rowSection}>
    <Text style={styles.rowLabel}>{label}</Text>
    <TouchableOpacity
      style={styles.rowCard}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <Text style={styles.rowValue}>{value}</Text>
      <ChevronRight
        size={sizing.iconSizes.md}
        color={theme.colors.text.tertiary}
      />
    </TouchableOpacity>
  </View>
);

export const ProfileScreen = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const { name, about, phoneNumber } = useUserStore();

  return (
    <SafeAreaView edges={edges} style={styles.container}>
      <FlatList
        data={[]}
        keyExtractor={(_, index) => index.toString()}
        renderItem={() => null}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <>
            {/* Profile Image Section */}
            <ProfilePictureSection />

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
                <ChevronRight
                  size={sizing.iconSizes.md}
                  color={theme.colors.text.tertiary}
                />
              </TouchableOpacity>
            </View>
          </>
        }
      />
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

    /* Rows */
    rowSection: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    rowLabel: {
      ...typography.variants.description,
      fontWeight: typography.weights.medium,
      color: colors.text.secondary,
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
      ...typography.variants.body,
      color: colors.text.primary,
      flex: 1,
    },
    addLinksText: {
      ...typography.variants.bodyMedium,
      color: colors.brand.primary,
      flex: 1,
    },
  });
