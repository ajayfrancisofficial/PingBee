import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppTheme } from '../../theme';
import { useUserStore } from '../../store/userStore';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { ProfilePictureOptionsModal } from './ProfilePictureOptionsModal';
import { MediaUtils } from '../../utils/media';
import { updateProfilePictureApi } from '../../services/userService';

export const ProfilePictureSection = () => {
  const theme = useAppTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);
  const { profilePicture, updateProfilePicture, deleteProfilePicture } =
    useUserStore();

  const [isOptionsVisible, setIsOptionsVisible] = React.useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = React.useState(false);

  const handleChoosePhoto = () => {
    setIsOptionsVisible(false);
    requestAnimationFrame(async () => {
      try {
        const uris = await MediaUtils.pickImagesFromGallery({
          copyTo: 'cachesDirectory',
          allowMultiSelection: false,
        });
        if (uris && uris.length > 0) {
          const uri = uris[0];
          await updateProfilePicture(uri);
          updateProfilePictureApi(uri, 'gallery').catch(console.error);
        }
      } catch (error) {
        console.error('Failed to update picture', error);
      }
    });
  };

  const handleTakePhoto = () => {
    setIsOptionsVisible(false);
    // Placeholder for future camera implementation
    console.log('Take photo clicked');
  };

  const handleDeletePhoto = () => {
    setIsOptionsVisible(false);
    setTimeout(() => setIsConfirmVisible(true), 400); // Wait for BottomSheet to close
  };

  const confirmDelete = async () => {
    setIsConfirmVisible(false);
    deleteProfilePicture();
    updateProfilePictureApi('', 'removed').catch(console.error);
  };

  return (
    <>
      <View style={styles.imageSection}>
        <Image source={{ uri: profilePicture }} style={styles.profileImage} />
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
