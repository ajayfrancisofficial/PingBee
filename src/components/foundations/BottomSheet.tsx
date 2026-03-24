import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModalWrapper, ModalWrapperProps } from './ModalWrapper';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { X } from 'lucide-react-native';
import { sizing } from '../../theme/sizing';

export interface BottomSheetProps extends Omit<ModalWrapperProps, 'justifyContent' | 'animationType'> {
  title?: string;
  showCloseButton?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  title,
  showCloseButton = true,
  children,
  onClose,
  ...props
}) => {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const styles = React.useMemo(() => makeStyles(theme, insets.bottom), [theme, insets.bottom]);

  return (
    <ModalWrapper
      {...props}
      onClose={onClose}
      animationType="slide"
      justifyContent="flex-end"
    >
      <View style={styles.sheetContainer}>
        {/* Header */}
        {(title || showCloseButton) && (
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <View style={styles.titleContainer}>
              {title && <Text style={styles.title}>{title}</Text>}
            </View>
            <View style={styles.closeButtonContainer}>
              {showCloseButton && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <X size={sizing.iconSizes.sm} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </ModalWrapper>
  );
};

const makeStyles = ({ colors, borderRadius, typography, spacing }: AppTheme, bottomInset: number) =>
  StyleSheet.create({
    sheetContainer: {
      backgroundColor: colors.backgrounds.default,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      paddingBottom: Math.max(bottomInset, spacing.xl),
      paddingTop: spacing.lg,
      paddingHorizontal: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xl,
    },
    headerSpacer: {
      width: 32, // to balance the close button
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    title: {
      ...typography.variants.heading3,
      color: colors.text.primary,
      fontWeight: typography.weights.semiBold,
    },
    closeButtonContainer: {
      width: 32,
      alignItems: 'flex-end',
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaces.default, // Match mock's dark circle background
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      // Content wrapper
    },
  });
