import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ModalWrapper } from '../foundations/ModalWrapper';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';

export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = true,
}) => {
  const theme = useAppTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  // If using iOS style, standard modals are anchored center.
  return (
    <ModalWrapper
      visible={visible}
      onClose={onCancel}
      animationType="fade"
      justifyContent="center"
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, isDestructive ? styles.destructiveButton : styles.confirmButton]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ModalWrapper>
  );
};

const makeStyles = ({ colors, spacing, borderRadius, typography }: AppTheme) =>
  StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    modalView: {
      width: '100%',
      backgroundColor: colors.backgrounds.elevated,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      alignItems: 'center',
      // Shadow
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    title: {
      ...typography.variants.heading3,
      color: colors.text.primary,
      fontWeight: typography.weights.bold,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    message: {
      ...typography.variants.body,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: spacing.md,
    },
    button: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: colors.surfaces.secondary,
    },
    cancelButtonText: {
      ...typography.variants.bodyMedium,
      color: colors.text.primary,
      fontWeight: typography.weights.semiBold,
    },
    confirmButton: {
      backgroundColor: colors.brand.primary,
    },
    destructiveButton: {
      backgroundColor: colors.semantic.error,
    },
    confirmButtonText: {
      ...typography.variants.bodyMedium,
      color: colors.absolute.white,
      fontWeight: typography.weights.semiBold,
    },
  });
