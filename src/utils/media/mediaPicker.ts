import { FileToCopy, keepLocalCopy, pick, types } from '@react-native-documents/picker';


export interface PickImageOptions {
  allowMultiSelection?: boolean;
  copyTo?: 'cachesDirectory' | 'documentDirectory';
}

/**
 * Reusable utility to pick an image from the gallery using @react-native-documents/picker.
 * Automatically requests permissions implicitly via the document picker UI.
 * @returns The local URI of the picked image or null if cancelled.
 */
let isPicking = false;

export const pickImagesFromGallery = async (
  {
    allowMultiSelection = true,
    copyTo = 'cachesDirectory'
  }: PickImageOptions = {}
): Promise<string[] | null> => {
  if (isPicking) {
    return null;
  }
  
  isPicking = true;
  try {
    const pickerResponse = await pick({
      type: [types.images],
      allowMultiSelection,
      mode: 'import',
      allowVirtualFiles:false,
    });
    const filesToCopy:FileToCopy[] = pickerResponse.map((file: any) => ({
      uri:file.uri,
      fileName:file.name,
    }))

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
    console.error('Error picking images from gallery: ', err);
    throw err;
  } finally {
    isPicking = false;
  }
};
