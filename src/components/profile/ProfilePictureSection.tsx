import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { useUserStore } from '../../store/userStore';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { ProfilePictureOptionsModal } from './ProfilePictureOptionsModal';
import { MediaUtils } from '../../utils/media';
import { updateProfilePictureApi } from '../../services/userService';
import { TransitionTags } from '../../constants/transitions';

export const ProfilePictureSection = () => {
  const theme = useAppTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const { profilePicture, avatar, updateProfilePicture, deleteProfilePicture } =
    useUserStore();

  const [isOptionsVisible, setIsOptionsVisible] = React.useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = React.useState(false);

  const handleChoosePhoto = () => {
    setIsOptionsVisible(false);
    requestAnimationFrame(async () => {
      try {
        const assets = await MediaUtils.pickFromGallery({
          mediaType: 'photo',
          selectionLimit: 1,
        });
        if (assets && assets.length > 0) {
          const uri = assets[0].uri;
          if (uri) {
            const oldProfileUri = profilePicture;
            const oldAvatarUri = avatar;

            await updateProfilePicture(uri);
            await updateProfilePictureApi(uri, 'gallery');

            // Delete old profile picture and avatar ONLY after successful update
            if (oldProfileUri) {
              await MediaUtils.deleteMedia(oldProfileUri);
            }
            if (oldAvatarUri) {
              await MediaUtils.deleteMedia(oldAvatarUri);
            }
          }
        }
      } catch (error) {
        console.error('Failed to update picture', error);
      }
    });
  };

  const handleTakePhoto = () => {
    setIsOptionsVisible(false);
    // do we need this request animation frame?
    requestAnimationFrame(async () => {
      try {
        const assets = await MediaUtils.pickUsingCamera({
          mediaType: 'photo',
        });
        if (assets && assets.length > 0) {
          const uri = assets[0].uri;
          if (uri) {
            const oldProfileUri = profilePicture;
            const oldAvatarUri = avatar;

            await updateProfilePicture(uri);
            await updateProfilePictureApi(uri, 'camera');

            // Delete old profile picture and avatar ONLY after successful update
            if (oldProfileUri) {
              await MediaUtils.deleteMedia(oldProfileUri);
            }
            if (oldAvatarUri) {
              await MediaUtils.deleteMedia(oldAvatarUri);
            }
          }
        }
      } catch (error) {
        console.error('Failed to take photo', error);
      }
    });
  };

  const handleDeletePhoto = () => {
    setIsOptionsVisible(false);
    setTimeout(() => setIsConfirmVisible(true), 400); // Wait for BottomSheet to close
  };

  const confirmDelete = async () => {
    setIsConfirmVisible(false);
    if (profilePicture) {
      await MediaUtils.deleteMedia(profilePicture);
    }
    if (avatar) {
      await MediaUtils.deleteMedia(avatar);
    }
    deleteProfilePicture();
    updateProfilePictureApi('', 'removed').catch(console.error);
  };

  return (
    <>
      <View style={styles.imageSection}>
        <Animated.Image
          source={{ uri: profilePicture }}
          style={styles.profileImage}
          sharedTransitionTag={TransitionTags.profileImage}
        />
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => setIsOptionsVisible(true)}
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Picture Options Sheet */}
      {isOptionsVisible && (
        <ProfilePictureOptionsModal
          visible={isOptionsVisible}
          onClose={() => setIsOptionsVisible(false)}
          onTakePhoto={handleTakePhoto}
          onChoosePhoto={handleChoosePhoto}
          onDeletePhoto={handleDeletePhoto}
        />
      )}

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
    editText: {
      color: colors.brand.primary,
      ...typography.variants.bodyMedium,
      marginTop: spacing.sm,
    },
  });
