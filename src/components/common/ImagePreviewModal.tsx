import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { ModalWrapper } from '../foundations/ModalWrapper';

export interface ImagePreviewModalProps {
  visible: boolean;
  imageUrl?: string;
  title?: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  visible,
  imageUrl,
  title,
  onClose,
}) => {
  const theme = useAppTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  if (!imageUrl) return null;

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      animationType="fade"
      justifyContent="center"
    >
      <View style={styles.centeredView}>
        <Pressable style={styles.previewBox} onPress={e => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {title || 'Preview'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Close preview"
            >
              <X size={20} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        </Pressable>
      </View>
    </ModalWrapper>
  );
};

const makeStyles = ({
  colors,
  spacing,
  borderRadius,
  typography,
  width,
}: AppTheme) => {
  const size = Math.min(width * 0.85, 400);
  return StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    previewBox: {
      width: size,
      borderRadius: borderRadius.xl,
      backgroundColor: colors.backgrounds.elevated,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 10,
      borderWidth: 1,
      borderColor: colors.borders.default,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borders.separator,
      backgroundColor: colors.surfaces.default,
    },
    title: {
      ...typography.variants.bodyMedium,
      fontWeight: typography.weights.bold,
      color: colors.text.primary,
      flex: 1,
      marginRight: spacing.sm,
    },
    closeButton: {
      padding: spacing.xs,
    },
    imageContainer: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: colors.surfaces.secondary,
    },
    image: {
      width: '100%',
      height: '100%',
    },
  });
};
