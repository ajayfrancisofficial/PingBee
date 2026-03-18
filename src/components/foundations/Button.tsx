import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { theme } from '../../theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'solid' | 'outline' | 'text';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'solid',
  isLoading = false,
  style,
  disabled,
  ...props
}) => {
  const isSolid = variant === 'solid';
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSolid && styles.solidButton,
        isOutline && styles.outlineButton,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={isSolid ? theme.colors.white : theme.colors.primary} />
      ) : (
        <Text
          style={[
            styles.text,
            isSolid && styles.solidText,
            isOutline && styles.outlineText,
            variant === 'text' && styles.plainText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  solidButton: {
    backgroundColor: theme.colors.primary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold as any,
  },
  solidText: {
    color: theme.colors.white,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  plainText: {
    color: theme.colors.primary,
  },
});
