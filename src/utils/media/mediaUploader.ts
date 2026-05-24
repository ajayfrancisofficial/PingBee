import ReactNativeBlobUtil, {
  FetchBlobResponse,
  StatefulPromise,
} from 'react-native-blob-util';

const activeUploads = new Map<string, StatefulPromise<FetchBlobResponse>>();

export interface UploadOptions {
  taskId?: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
  name?: string; // FormData field name, e.g. "file" or "media"
  filename?: string;
  mimeType?: string;
  maxRetries?: number;
}

/**
 * Cancels an ongoing upload by its taskId.
 */
export const cancelUpload = (taskId: string) => {
  const task = activeUploads.get(taskId);
  if (task) {
    task.cancel();
    activeUploads.delete(taskId);
    console.log(`[MediaUploader] Cancelled upload task: ${taskId}`);
  }
};

/**
 * Uploads a file with an automatic retry mechanism for network failures.
 */
export const uploadMediaWithRetry = async (
  localPath: string,
  endpoint: string,
  options: UploadOptions,
): Promise<any> => {
  const maxRetries = options.maxRetries ?? 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      console.log(
        `[MediaUploader] Upload attempt ${attempt + 1}/${maxRetries}`,
      );
      const task = ReactNativeBlobUtil.fetch(
        options.method || 'POST',
        endpoint,
        {
          'Content-Type': 'multipart/form-data',
          ...options.headers,
        },
        [
          {
            name: options.name || 'file',
            filename: options.filename || 'media.jpg',
            type: options.mimeType || 'application/octet-stream',
            data: ReactNativeBlobUtil.wrap(localPath),
          },
        ],
      );

      if (options.taskId) {
        activeUploads.set(options.taskId, task);
      }

      const response = await task;

      if (options.taskId) {
        activeUploads.delete(options.taskId);
      }

      // We assume status 200-299 is success
      const status = response.info().status;
      const text = await response.text();
      if (status >= 200 && status < 300) {
        return JSON.parse(text);
      } else {
        throw new Error(`Upload failed with status: ${status}`);
      }
    } catch (error: unknown) {
      if (options.taskId) {
        activeUploads.delete(options.taskId);
      }

      // If the error is due to cancellation, do NOT retry.
      const isCancelled =
        error instanceof Error &&
        (error.message.includes('cancelled') ||
          error.message.includes('canceled'));

      if (isCancelled) {
        console.log(
          `[MediaUploader] Upload task ${options.taskId} was cancelled. Skipping retries.`,
        );
        throw error;
      }

      attempt++;
      if (attempt >= maxRetries) {
        console.error(
          '[MediaUploader] Max retries reached. Upload failed.',
          error,
        );
        throw error;
      }
      // Exponential backoff before retrying
      await new Promise(resolve =>
        setTimeout(() => resolve(undefined), attempt * 1000),
      );
    }
  }
};
