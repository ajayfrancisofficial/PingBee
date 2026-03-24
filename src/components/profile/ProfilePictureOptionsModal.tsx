import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheet, BottomSheetProps } from '../foundations/BottomSheet';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  Instagram,
  Facebook,
} from 'lucide-react-native';
import { sizing } from '../../theme/sizing';

export interface ProfilePictureOptionsModalProps
  extends Omit<BottomSheetProps, 'children'> {
  onTakePhoto: () => void;
  onChoosePhoto: () => void;
  onDeletePhoto: () => void;
}

export const ProfilePictureOptionsModal: React.FC<
  ProfilePictureOptionsModalProps
> = ({ onTakePhoto, onChoosePhoto, onDeletePhoto, ...props }) => {
  const theme = useAppTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  const renderOption = (
    icon: React.ReactNode,
    label: string,
    onPress: () => void,
    isLast: boolean = false,
    isDestructive: boolean = false,
  ) => (
    <TouchableOpacity
      style={[styles.optionRow, !isLast && styles.optionBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={[styles.label, isDestructive && styles.destructiveLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheet {...props} title="Edit profile picture">
      {/* Primary Options Group */}
      <View style={styles.groupContainer}>
        {renderOption(
          <Camera
            size={sizing.iconSizes.md}
            color={theme.colors.text.secondary}
          />,
          'Take photo',
          onTakePhoto,
        )}
        {renderOption(
          <ImageIcon
            size={sizing.iconSizes.md}
            color={theme.colors.text.secondary}
          />,
          'Choose photo',
          onChoosePhoto,
        )}
      </View>
      {/* Destructive Options Group */}
      <View style={styles.groupContainer}>
        {renderOption(
          <Trash2
            size={sizing.iconSizes.md}
            color={theme.colors.semantic.error}
          />,
          'Delete photo',
          onDeletePhoto,
          true,
          true,
        )}
      </View>
    </BottomSheet>
  );
};

const makeStyles = ({ colors, spacing, borderRadius, typography }: AppTheme) =>
  StyleSheet.create({
    groupContainer: {
      backgroundColor: colors.surfaces.default, // The mock uses a slightly lighter surface over the background
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      overflow: 'hidden',
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
    },
    optionBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borders.separator,
    },
    iconContainer: {
      width: 24,
      alignItems: 'center',
      marginRight: spacing.md,
    },
    label: {
      ...typography.variants.body,
      color: colors.text.primary,
      flex: 1,
    },
    destructiveLabel: {
      color: colors.semantic.error,
    },
  });
