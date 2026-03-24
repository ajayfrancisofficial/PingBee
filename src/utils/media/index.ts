import * as mediaCache from './mediaCache';
import * as mediaPicker from './mediaPicker';
import * as mediaUploader from './mediaUploader';
import * as mediaDownloader from './mediaDownloader';
import * as mediaImageGenerator from './mediaImageGenerator';

export const MediaUtils = {
  ...mediaCache,
  ...mediaPicker,
  ...mediaUploader,
  ...mediaDownloader,
  ...mediaImageGenerator,
};
