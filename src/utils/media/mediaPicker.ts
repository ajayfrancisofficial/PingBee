import {
  FileToCopy,
  keepLocalCopy,
  pick,
  types as libTypes,
} from '@react-native-documents/picker';

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
 * TODO: Implement using a library like react-native-image-crop-picker or expo-image-picker
 * that specifically target the iOS/Android gallery UI.
 */
export const pickImagesFromGallery = async (
  //add type for the options
  _options: aa = {},
): Promise<string[] | null> => {
  console.log('[MediaPicker] pickImagesFromGallery - Not implemented yet');
  return null;
};
