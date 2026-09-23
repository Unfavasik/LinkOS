/**
 * Client-side image -> WebP conversion via canvas.
 * Used before uploading avatars so storage only holds optimized .webp files.
 */

const DEFAULT_MAX_SIZE = 512;
const DEFAULT_QUALITY = 0.85;

async function loadImageSource(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      // Some formats (e.g. certain SVGs) fail here — fall back to <img> below.
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read the selected image.'));
    };
    img.src = url;
  });
}

export interface WebpConvertOptions {
  /** Longest side of the output image in px (default 512). */
  maxSize?: number;
  /** WebP quality 0-1 (default 0.85). */
  quality?: number;
  /** Center-crop to a square before resizing (default true). */
  square?: boolean;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Crop a region (in source-image pixels, e.g. from react-easy-crop's
 * croppedAreaPixels) out of the file and export it as an optimized WebP.
 */
export async function cropToWebp(
  file: File,
  area: CropArea,
  options: Pick<WebpConvertOptions, 'maxSize' | 'quality'> = {}
): Promise<File> {
  const { maxSize = DEFAULT_MAX_SIZE, quality = DEFAULT_QUALITY } = options;
  if (!area.width || !area.height) throw new Error('Please select a crop area.');

  const source = await loadImageSource(file);
  const scale = Math.min(1, maxSize / Math.max(area.width, area.height));
  const outW = Math.max(1, Math.round(area.width * scale));
  const outH = Math.max(1, Math.round(area.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser.');
  ctx.drawImage(
    source as CanvasImageSource,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    outW,
    outH
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', quality)
  );
  if (!blob) throw new Error('WebP conversion is not supported in this browser.');

  const baseName =
    file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]+/gi, '_').slice(0, 40) || 'avatar';
  return new File([blob], `${baseName}_${Date.now()}.webp`, { type: 'image/webp' });
}

/**
 * Ensure an uploaded image is a WebP file before it is stored.
 * Used by StorageService.uploadImage so every upload path (admin and user)
 * saves optimized WebP. SVGs are vector — passed through untouched.
 * Covers/gallery keep their aspect ratio (no square crop) and allow up to
 * 1600px so quality is preserved.
 */
export async function ensureWebp(file: File): Promise<File> {
  if (file.type === 'image/svg+xml') return file;
  if (file.type === 'image/webp' && file.size <= 2 * 1024 * 1024) return file;
  try {
    return await convertToWebp(file, { maxSize: 1600, square: false, quality: 0.85 });
  } catch (e) {
    // Conversion failed (e.g. exotic format) — keep the original rather than
    // blocking the upload entirely.
    console.warn('[v0] WebP conversion failed, uploading original file:', e);
    return file;
  }
}

export async function convertToWebp(file: File, options: WebpConvertOptions = {}): Promise<File> {
  const { maxSize = DEFAULT_MAX_SIZE, quality = DEFAULT_QUALITY, square = true } = options;

  // Already an optimized WebP within the size budget — upload as-is.
  if (file.type === 'image/webp' && file.size <= 2 * 1024 * 1024) return file;

  const source = await loadImageSource(file);
  const srcWidth = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
  const srcHeight = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
  if (!srcWidth || !srcHeight) throw new Error('Could not read the selected image.');

  // Center-crop to a square when requested
  let sx = 0;
  let sy = 0;
  let sw = srcWidth;
  let sh = srcHeight;
  if (square && srcWidth !== srcHeight) {
    const side = Math.min(srcWidth, srcHeight);
    sx = (srcWidth - side) / 2;
    sy = (srcHeight - side) / 2;
    sw = side;
    sh = side;
  }

  const scale = Math.min(1, maxSize / Math.max(sw, sh));
  const outW = Math.max(1, Math.round(sw * scale));
  const outH = Math.max(1, Math.round(sh * scale));

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser.');
  ctx.drawImage(source as CanvasImageSource, sx, sy, sw, sh, 0, 0, outW, outH);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', quality)
  );
  if (!blob) throw new Error('WebP conversion is not supported in this browser.');

  const baseName =
    file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]+/gi, '_').slice(0, 40) || 'avatar';
  return new File([blob], `${baseName}_${Date.now()}.webp`, { type: 'image/webp' });
}
