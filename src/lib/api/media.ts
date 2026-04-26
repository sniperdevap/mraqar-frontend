import axiosWrapper from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import axios from 'axios';

import { Media } from '@/types/ad';

export type UploadResponse = Media;

export const uploadMedia = async (file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosWrapper<UploadResponse>('post', API_ENDPOINTS.MEDIA.UPLOAD, formData, null, {
    onUploadProgress: progressEvent => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
  return response.data;
};

type MediaKind = 'image' | 'video';

interface MultipartInitResponse {
  uploadId: string;
  key: string;
  partSize: number;
}

interface MultipartPartUrlResponse {
  uploadUrl: string;
}

interface MultipartThumbnailUrlResponse {
  key: string;
  uploadUrl: string;
}

interface MultipartUploadedPart {
  partNumber: number;
  etag: string;
}

interface MultipartUploadOptions {
  mediaType: MediaKind;
  thumbnailDataUrl?: string;
  onProgress?: (progress: number) => void;
}

const CHUNK_UPLOAD_CONCURRENCY = 4;
const DEFAULT_PART_SIZE = 8 * 1024 * 1024;
const PART_MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 800;

const extractDataUrlMimeType = (dataUrl: string): string => {
  const match = dataUrl.match(/^data:([^;]+);base64,/);
  return match?.[1] || 'image/jpeg';
};

const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl);
  return response.blob();
};

const initMultipartUpload = async (file: File): Promise<MultipartInitResponse> => {
  const response = await axiosWrapper<MultipartInitResponse>('post', API_ENDPOINTS.MEDIA.MULTIPART_INIT, {
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    fileSize: file.size,
  });

  return response.data;
};

const getMultipartPartUrl = async (key: string, uploadId: string, partNumber: number): Promise<string> => {
  const response = await axiosWrapper<MultipartPartUrlResponse>('post', API_ENDPOINTS.MEDIA.MULTIPART_PART_URL, {
    key,
    uploadId,
    partNumber,
  });

  return response.data.uploadUrl;
};

const getMultipartThumbnailUrl = async (mimeType: string): Promise<MultipartThumbnailUrlResponse> => {
  const response = await axiosWrapper<MultipartThumbnailUrlResponse>('post', API_ENDPOINTS.MEDIA.MULTIPART_THUMBNAIL_URL, {
    mimeType,
  });

  return response.data;
};

const completeMultipartUpload = async (payload: {
  key: string;
  uploadId: string;
  parts: MultipartUploadedPart[];
  mimeType: string;
  fileSize: number;
  type: MediaKind;
  thumbnailKey?: string;
}): Promise<UploadResponse> => {
  const response = await axiosWrapper<UploadResponse>('post', API_ENDPOINTS.MEDIA.MULTIPART_COMPLETE, payload);
  return response.data;
};

const abortMultipartUpload = async (key: string, uploadId: string): Promise<void> => {
  try {
    await axiosWrapper('post', API_ENDPOINTS.MEDIA.MULTIPART_ABORT, { key, uploadId });
  } catch {
    // ignore abort errors; main upload error will be surfaced to user
  }
};

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

const waitForOnline = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  if (window.navigator.onLine) return;

  await new Promise<void>(resolve => {
    const onOnline = () => {
      window.removeEventListener('online', onOnline);
      resolve();
    };
    window.addEventListener('online', onOnline);
  });
};

const isLikelyNetworkError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) return false;
  const axiosError = error;
  return !axiosError.response || axiosError.code === 'ERR_NETWORK' || axiosError.message.toLowerCase().includes('network');
};

export const uploadMediaMultipart = async (file: File, options: MultipartUploadOptions): Promise<UploadResponse> => {
  const init = await initMultipartUpload(file);
  const partSize = init.partSize || DEFAULT_PART_SIZE;

  const partsCount = Math.max(1, Math.ceil(file.size / partSize));
  const uploadedParts: MultipartUploadedPart[] = [];
  const uploadedBytesByPart = new Map<number, number>();

  const updateProgress = () => {
    if (!options.onProgress) return;
    let uploadedBytes = 0;
    uploadedBytesByPart.forEach(value => {
      uploadedBytes += value;
    });
    const progress = Math.min(100, Math.round((uploadedBytes / file.size) * 100));
    options.onProgress(progress);
  };

  let thumbnailKey: string | undefined;

  try {
    if (options.thumbnailDataUrl) {
      const thumbnailMimeType = extractDataUrlMimeType(options.thumbnailDataUrl);
      const thumbnailBlob = await dataUrlToBlob(options.thumbnailDataUrl);
      const thumbnailUpload = await getMultipartThumbnailUrl(thumbnailMimeType);
      await axios.put(thumbnailUpload.uploadUrl, thumbnailBlob, {
        headers: {
          'Content-Type': thumbnailMimeType,
        },
      });
      thumbnailKey = thumbnailUpload.key;
    }

    const partNumbers = Array.from({ length: partsCount }, (_, index) => index + 1);
    let nextPartIndex = 0;

    const uploadSinglePart = async (partNumber: number): Promise<void> => {
      const start = (partNumber - 1) * partSize;
      const end = Math.min(start + partSize, file.size);
      const chunk = file.slice(start, end);

      let lastError: unknown;

      for (let attempt = 1; attempt <= PART_MAX_RETRIES; attempt += 1) {
        try {
          const uploadUrl = await getMultipartPartUrl(init.key, init.uploadId, partNumber);

          const response = await axios.put(uploadUrl, chunk, {
            onUploadProgress: progressEvent => {
              const loaded = Math.min(progressEvent.loaded, chunk.size);
              uploadedBytesByPart.set(partNumber, loaded);
              updateProgress();
            },
          });

          uploadedBytesByPart.set(partNumber, chunk.size);
          updateProgress();

          const etagHeader = response.headers.etag;
          const etag = Array.isArray(etagHeader) ? etagHeader[0] : etagHeader;

          if (!etag) {
            throw new Error('Missing ETag in multipart upload response. Please expose ETag in R2 CORS settings.');
          }

          uploadedParts.push({ partNumber, etag });
          return;
        } catch (error) {
          lastError = error;
          uploadedBytesByPart.set(partNumber, 0);
          updateProgress();

          if (isLikelyNetworkError(error)) {
            await waitForOnline();
          }

          if (attempt < PART_MAX_RETRIES) {
            await sleep(BASE_RETRY_DELAY_MS * 2 ** (attempt - 1));
            continue;
          }
        }
      }

      throw lastError;
    };

    const worker = async (): Promise<void> => {
      while (nextPartIndex < partNumbers.length) {
        const currentIndex = nextPartIndex;
        nextPartIndex += 1;
        await uploadSinglePart(partNumbers[currentIndex]);
      }
    };

    const workersCount = Math.min(CHUNK_UPLOAD_CONCURRENCY, partsCount);
    await Promise.all(Array.from({ length: workersCount }, () => worker()));

    return await completeMultipartUpload({
      key: init.key,
      uploadId: init.uploadId,
      parts: uploadedParts,
      mimeType: file.type || 'application/octet-stream',
      fileSize: file.size,
      type: options.mediaType,
      thumbnailKey,
    });
  } catch (error) {
    await abortMultipartUpload(init.key, init.uploadId);
    throw error;
  }
};
