import React from 'react';
import {
  View,
  TextInput,
  Text,
  TextInputProps,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  style,
  ...props
}) => {
  const theme = useAppTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={theme.colors.text.secondary}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const makeStyles = ({ colors, spacing, typography, borderRadius }: AppTheme) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    label: {
      fontSize: typography.sizes.sm,
      color: colors.text.primary,
      marginBottom: spacing.xs,
      fontWeight: typography.weights.medium,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 48,
      backgroundColor: colors.surfaces.default,
      borderWidth: 1,
      borderColor: colors.borders.default,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
    },
    input: {
      ...typography.variants.body,
      flex: 1,
      height: '100%',
      color: colors.text.primary,
    },
    leftIcon: {
      marginRight: spacing.sm,
    },
    inputError: {
      borderColor: colors.semantic.error,
    },
    errorText: {
      color: colors.semantic.error,
      fontSize: typography.sizes.xs,
      marginTop: spacing.xs,
    },
  });
