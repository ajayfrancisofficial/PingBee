import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';

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
  const theme = useAppTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

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
        <ActivityIndicator
          color={
            isSolid ? theme.colors.absolute.white : theme.colors.brand.primary
          }
        />
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

const makeStyles = ({ colors, borderRadius, spacing, typography }: AppTheme) =>
  StyleSheet.create({
    button: {
      height: 48,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    },
    solidButton: {
      backgroundColor: colors.brand.primary,
    },
    outlineButton: {
      backgroundColor: colors.absolute.transparent,
      borderWidth: 1,
      borderColor: colors.brand.primary,
    },
    disabled: {
      opacity: 0.5,
    },
    text: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semiBold,
    },
    solidText: {
      color: colors.text.onPrimary,
    },
    outlineText: {
      color: colors.brand.primary,
    },
    plainText: {
      color: colors.brand.primary,
    },
  });
