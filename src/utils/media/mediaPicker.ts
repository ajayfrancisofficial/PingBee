import {
  FileToCopy,
  keepLocalCopy,
  pick,
  types as libTypes,
} from '@react-native-documents/picker';
import {
  launchImageLibrary,
  launchCamera,
  ImageLibraryOptions,
  CameraOptions,
  Asset,
} from 'react-native-image-picker';

export interface PickDocumentOptions {
  types?: (keyof typeof libTypes)[];
  allowMultiSelection?: boolean;
  copyTo?: 'cachesDirectory' | 'documentDirectory';
}

/**
 * Reusable utility to pick documents (PDFs, images, etc.) using @react-native-documents/picker.
 * Automatically requests permissions implicitly via the document picker UI.
 * @returns The local URIs of the picked documents or null if cancelled.
 */
let isPicking = false;

export const pickDocuments = async ({
  types = ['allFiles'],
  allowMultiSelection = true,
  copyTo = 'cachesDirectory',
}: PickDocumentOptions = {}): Promise<string[] | null> => {
  if (isPicking) {
    return null;
  }

  isPicking = true;
  try {
    const typeDefinitions = types.map(t => libTypes[t]);

    const pickerResponse = await pick({
      type: typeDefinitions,
      allowMultiSelection,
      mode: 'import',
      allowVirtualFiles: false,
    });
    const filesToCopy: FileToCopy[] = pickerResponse.map((file: any) => ({
      uri: file.uri,
      fileName: file.name,
    }));

    if (filesToCopy.length === 0) {
      return null;
    }

    const localCopyResponse = await keepLocalCopy({
      destination: copyTo,
      files: filesToCopy as [FileToCopy, ...FileToCopy[]],
    });
    if (localCopyResponse && localCopyResponse.length > 0) {
      return localCopyResponse.map((file: any) => file.localUri);
    }

    return null;
  } catch (err: any) {
    if (err.code === 'OPERATION_CANCELED') {
      return null;
    }
    console.error('Error picking documents: ', err);
    throw err;
  } finally {
    isPicking = false;
  }
};

/**
 * Reusable utility to pick an image/video specifically from the gallery.
 * Uses react-native-image-picker's launchImageLibrary.
 * @param options - Configuration for the picker (mediaType, selectionLimit, etc.)
 * @returns Array of local URIs of the picked media or null if cancelled.
 */
export const pickFromGallery = async (
  options: Partial<ImageLibraryOptions> = {},
): Promise<Asset[] | null> => {
  try {
    const pickerOptions: ImageLibraryOptions = {
      selectionLimit: 0, // Default to 0 (unlimited/many depending on OS)
      mediaType: 'mixed',
      ...options,
    };
    const result = await launchImageLibrary(pickerOptions);
    console.log('🚀 ~ pickFromGallery ~ result:', result);

    if (result.didCancel) {
      return null;
    }

    if (result.errorCode) {
      throw new Error(result.errorMessage || result.errorCode);
    }

    return result?.assets || null;
  } catch (error) {
    console.error('Error in pickFromGallery:', error);
    throw error;
  }
};

/**
 * Reusable utility to capture an image/video using the camera.
 * Uses react-native-image-picker's launchCamera.
 * @param options - Configuration for the camera (mediaType, quality, etc.)
 * @returns Array containing the local URI of the captured media or null if cancelled.
 */
export const pickUsingCamera = async (
  options: Partial<CameraOptions> = {},
): Promise<Asset[] | null> => {
  try {
    const cameraOptions: CameraOptions = {
      mediaType: 'photo',
      saveToPhotos: true,
      ...options,
    };
    const result = await launchCamera(cameraOptions);

    if (result.didCancel) {
      return null;
    }

    if (result.errorCode) {
      throw new Error(result.errorMessage || result.errorCode);
    }

    return result?.assets || null;
  } catch (error) {
    console.error('Error in pickUsingCamera:', error);
    throw error;
  }
};
