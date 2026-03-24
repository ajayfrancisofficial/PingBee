import ReactNativeBlobUtil from 'react-native-blob-util';

// The base directory for all media in our app
export const MEDIA_CACHE_DIR = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/PingBeeMedia`;

/**
 * Initializes the media cache directory if it doesn't exist.
 */
export const initMediaCacheDir = async () => {
  const exists = await ReactNativeBlobUtil.fs.isDir(MEDIA_CACHE_DIR);
  if (!exists) {
    await ReactNativeBlobUtil.fs.mkdir(MEDIA_CACHE_DIR);
  }
};

/**
 * Gets a deterministic local file path for a given URL to avoid deduplication.
 * E.g., hashes the URL or extracts the filename.
 */
export const getLocalFilePath = (url: string): string => {
  // Extracting filename assumes standard URL structures for now.
  // In a robust app, a proper hashing library (e.g. md5) of the URL is recommended.
  const fileName =
    url.substring(url.lastIndexOf('/') + 1) || String(Date.now());
  return `${MEDIA_CACHE_DIR}/${fileName}`;
};

/**
 * Checks if the media file is already downloaded to avoid re-downloading.
 */
export const isMediaCached = async (url: string): Promise<boolean> => {
  const path = getLocalFilePath(url);
  return await ReactNativeBlobUtil.fs.exists(path);
};

/**
 * Totally clears the media cache.
 * Can be called periodically (e.g., on app startup based on a timestamp stored in mmkvStorage).
 */
export const clearMediaCache = async (): Promise<void> => {
  try {
    const exists = await ReactNativeBlobUtil.fs.isDir(MEDIA_CACHE_DIR);
    if (exists) {
      // Unlink the whole directory to clear it completely
      await ReactNativeBlobUtil.fs.unlink(MEDIA_CACHE_DIR);
    }
    // Re-initialize the empty directory
    await initMediaCacheDir();
    console.log('[MediaCache] Cache totally cleared.');
  } catch (error) {
    console.error('[MediaCache] Failed to clear cache:', error);
  }
};

/**
 * Deletes a media file from the local file system.
 * @param uri - The local URI of the file to delete.
 */
export const deleteMedia = async (uri: string): Promise<void> => {
  console.log('🚀 ~ deleteMedia ~ uri:', uri);
  if (!uri) {
    return;
  }

  // Handle both file:// and raw absolute paths, but ignore remote or virtual URIs
  const isLocalFile = uri.startsWith('file://') || uri.startsWith('/');
  const isRemoteOrContent =
    uri.startsWith('http') || uri.startsWith('content://');

  if (!isLocalFile || isRemoteOrContent) {
    return;
  }

  try {
    const path = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
    const exists = await ReactNativeBlobUtil.fs.exists(path);
    if (exists) {
      await ReactNativeBlobUtil.fs.unlink(path);
    }
  } catch (error) {
    console.error(`[MediaCache] Error deleting file: ${uri}`, error);
  }
};
