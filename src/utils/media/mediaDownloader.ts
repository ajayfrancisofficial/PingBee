import ReactNativeBlobUtil, { FetchBlobResponse, StatefulPromise } from 'react-native-blob-util';
import { getLocalFilePath, isMediaCached, initMediaCacheDir } from './mediaCache';

const activeDownloads = new Map<string, StatefulPromise<FetchBlobResponse>>();

export interface DownloadOptions {
  taskId?: string;
  onProgress?: (received: number, total: number) => void;
  // Allows downloading part of the file if supported by the server
  resume?: boolean; 
}

/**
 * Cancels an ongoing download by its taskId.
 */
export const cancelDownload = (taskId: string) => {
  const task = activeDownloads.get(taskId);
  if (task) {
    task.cancel();
    activeDownloads.delete(taskId);
    console.log(`[MediaDownloader] Cancelled download task: ${taskId}`);
  }
};

/**
 * Downloads a file from the given URL.
 * Automatically handles deduplication by checking the cache first.
 */
export const downloadMedia = async (url: string, options?: DownloadOptions): Promise<string> => {
  await initMediaCacheDir();
  
  const localPath = getLocalFilePath(url);
  const isCached = await isMediaCached(url);

  if (isCached && !options?.resume) {
    console.log('[MediaDownloader] File already in cache, deduplicating:', localPath);
    return localPath;
  }

  try {
    let task = ReactNativeBlobUtil.config({
      path: localPath,
      // overwrite: !options?.resume // Can be configured later for partial resumes
    }).fetch('GET', url);

    if (options?.taskId) {
      activeDownloads.set(options.taskId, task);
    }

    if (options?.onProgress) {
      task = task.progress((received, total) => {
        options.onProgress?.(parseInt(received, 10), parseInt(total, 10));
      });
    }

    const response: FetchBlobResponse = await task;
    
    if (options?.taskId) {
      activeDownloads.delete(options.taskId);
    }
    
    return response.path();
  } catch (error) {
    if (options?.taskId) {
      activeDownloads.delete(options.taskId);
    }
    console.error('[MediaDownloader] Failed to download:', error);
    throw error;
  }
};
