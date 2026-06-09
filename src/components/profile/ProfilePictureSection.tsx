import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { UserCircle } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { useUserStore } from '../../store/userStore';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { ProfilePictureOptionsModal } from './ProfilePictureOptionsModal';
import { MediaUtils } from '../../utils/media';
import { userService } from '../../services/User/userService';
import { TransitionTags } from '../../constants/transitions';
import { ImagePreviewModal } from '../common/ImagePreviewModal';

export const ProfilePictureSection = () => {
  const theme = useAppTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const {
    profilePicture,
    avatar,
    updateProfilePicture,
    deleteProfilePicture,
    name,
  } = useUserStore();

  const hasImage = Boolean(profilePicture);

  const [isOptionsVisible, setIsOptionsVisible] = React.useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = React.useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = React.useState(false);

  /**
   * Shared handler for both gallery and camera picks.
   * Receives the raw local path from crop-picker, compresses it, then uploads.
   */
  const handleImagePicked = async (localPath: string) => {
    try {
      // Slight compression before upload (70% quality)
      const compressedUri = await MediaUtils.compressImage(localPath, 0.7);

      // Optimistic local update (also creates local avatar thumbnail for offline cache)
      await updateProfilePicture(compressedUri);

      // Upload to server
      await userService.uploadProfilePicture(compressedUri);
    } catch (error) {
      console.error('[ProfilePictureSection] Failed to update picture:', error);
      // Revert optimistic update on failure
      if (profilePicture) {
        await updateProfilePicture(profilePicture);
      } else {
        deleteProfilePicture();
      }
    }
  };

  const handleChoosePhoto = () => {
    setIsOptionsVisible(false);
    requestAnimationFrame(async () => {
      try {
        const image = await MediaUtils.pickProfilePhotoFromGallery();
        if (image?.path) {
          await handleImagePicked(image.path);
        }
      } catch (error) {
        console.error('[ProfilePictureSection] Gallery pick failed:', error);
      }
    });
  };

  const handleTakePhoto = () => {
    setIsOptionsVisible(false);
    // do we need this request animation frame?
    requestAnimationFrame(async () => {
      try {
        const image = await MediaUtils.takeProfilePhoto();
        if (image?.path) {
          await handleImagePicked(image.path);
        }
      } catch (error) {
        console.error('[ProfilePictureSection] Camera capture failed:', error);
      }
    });
  };

  const handleDeletePhoto = () => {
    setIsOptionsVisible(false);
    setTimeout(() => setIsConfirmVisible(true), 400); // Wait for BottomSheet to close
  };

  const confirmDelete = async () => {
    setIsConfirmVisible(false);
    try {
      await userService.deleteProfilePicture();
    } catch (error) {
      console.error('[ProfilePictureSection] Failed to delete picture:', error);
    }
  };

  return (
    <>
      <View style={styles.imageSection}>
        {hasImage ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setIsPreviewVisible(true)}
          >
            <Animated.Image
              source={{ uri: profilePicture }}
              style={styles.profileImage}
              sharedTransitionTag={TransitionTags.profileImage}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholderContainer}>
            <UserCircle
              size={styles.profileImage.width}
              color={theme.colors.text.tertiary}
              strokeWidth={1}
            />
          </View>
        )}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => setIsOptionsVisible(true)}
        >
          <Text style={hasImage ? styles.editText : styles.addText}>
            {hasImage ? 'Edit' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Picture Options Sheet */}
      <ProfilePictureOptionsModal
        visible={isOptionsVisible}
        hasImage={hasImage}
        onClose={() => setIsOptionsVisible(false)}
        onTakePhoto={handleTakePhoto}
        onChoosePhoto={handleChoosePhoto}
        onDeletePhoto={handleDeletePhoto}
      />

      {/* Confirmation Dialog */}
      {isConfirmVisible && (
        <ConfirmationModal
          visible={isConfirmVisible}
          title="Delete profile picture"
          message="Are you sure you want to remove your profile picture? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => setIsConfirmVisible(false)}
          isDestructive={true}
        />
      )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        visible={isPreviewVisible}
        imageUrl={profilePicture}
        title={name}
        onClose={() => setIsPreviewVisible(false)}
      />
    </>
  );
};

const makeStyles = ({ colors, spacing, typography }: AppTheme) =>
  StyleSheet.create({
    imageSection: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    profileImage: {
      width: 140,
      height: 140,
      borderRadius: 70,
    },
    placeholderContainer: {
      width: 140,
      height: 140,
      borderRadius: 70,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editText: {
      color: colors.brand.primary,
      ...typography.variants.bodyMedium,
      marginTop: spacing.sm,
    },
    addText: {
      color: colors.semantic.success,
      ...typography.variants.bodyMedium,
      marginTop: spacing.sm,
    },
  });
