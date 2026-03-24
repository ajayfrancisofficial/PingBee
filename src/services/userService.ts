export type UpdateProfilePictureType = 'removed' | 'gallery' | 'camera';

/**
 * Mock API service for updating the user profile picture.
 * Shows how a multipart/form-data request would be structured.
 */
export const updateProfilePictureApi = async (
  localUri: string, 
  updateType: UpdateProfilePictureType
): Promise<{ success: boolean; url: string }> => {
  console.log(`[userService] Updating profile picture. Type: ${updateType}, URI: ${localUri}`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(() => resolve(undefined), 800));

  // If this was a real API call using fetch or axios:
  /*
  const formData = new FormData();
  formData.append('type', updateType);
  
  if (updateType !== 'removed' && localUri) {
    // Get filename from path or default to profile.jpg
    const filename = localUri.split('/').pop() || 'profile.jpg';
    
    // In React Native, file must have uri, type, and name for FormData
    formData.append('profilePicture', {
      uri: localUri,
      name: filename,
      type: 'image/jpeg',
    } as any);
  }

  const response = await fetch('YOUR_API_URL/updateProfilePicture', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      // 'Authorization': `Bearer ${token}`
    },
  });
  const data = await response.json();
  return data;
  */

  // Mock response
  if (updateType === 'removed') {
    return { success: true, url: '' };
  } else {
    // Returning the local URI conceptually representing the remote CDN URL success
    return { success: true, url: localUri };
  }
};
