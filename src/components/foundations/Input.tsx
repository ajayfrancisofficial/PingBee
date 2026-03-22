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
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  const theme = useAppTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={theme.colors.text.secondary}
        {...props}
      />
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
    input: {
      ...typography.variants.body,
      height: 48,
      backgroundColor: colors.surfaces.default,
      borderWidth: 1,
      borderColor: colors.borders.default,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      color: colors.text.primary,
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
