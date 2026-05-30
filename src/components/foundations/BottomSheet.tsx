import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetModalProps,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { X } from 'lucide-react-native';
import { sizing } from '../../theme/sizing';

export interface BottomSheetProps
  extends Omit<BottomSheetModalProps, 'children' | 'snapPoints'> {
  visible: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  children: React.ReactNode;
  enableDynamicSizing?: boolean;
  showBackdrop?: boolean;
  snapPoints?: Array<string | number>;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  showCloseButton = true,
  children,
  enableDynamicSizing = true,
  showBackdrop = true,
  snapPoints,
  onChange,
  ...props
}) => {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const styles = React.useMemo(
    () => makeStyles(theme, insets.bottom),
    [theme, insets.bottom],
  );

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback<
    NonNullable<BottomSheetModalProps['onChange']>
  >(
    (index, position, type) => {
      // -1 means the sheet was dismissed
      if (index === -1) {
        onClose();
      }
      onChange?.(index, position, type);
    },
    [onChange, onClose],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      enableDynamicSizing={enableDynamicSizing}
      snapPoints={snapPoints || (enableDynamicSizing ? undefined : ['50%'])}
      backdropComponent={showBackdrop ? renderBackdrop : undefined}
      onChange={handleSheetChanges}
      backgroundStyle={{
        backgroundColor: theme.colors.backgrounds.default,
        borderTopLeftRadius: theme.borderRadius.xxl,
        borderTopRightRadius: theme.borderRadius.xxl,
      }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.borders.separator }}
      {...props}
    >
      <BottomSheetView style={styles.sheetContainer}>
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
                  <X
                    size={sizing.iconSizes.sm}
                    color={theme.colors.text.secondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View style={styles.content}>{children}</View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const makeStyles = (
  { colors, typography, spacing }: AppTheme,
  bottomInset: number,
) =>
  StyleSheet.create({
    sheetContainer: {
      paddingBottom: Math.max(bottomInset, spacing.xl),
      paddingTop: spacing.sm,
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
