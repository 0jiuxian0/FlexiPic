import type { AppState, ImageFormat } from './state';

const MIME_TYPES: Record<ImageFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

const EXTENSIONS: Record<ImageFormat, string> = {
  png: 'png',
  jpeg: 'jpg',
  webp: 'webp',
};

/** 运行时检测浏览器是否支持 WebP 编码 */
function supportsWebp(): boolean {
  const canvas = document.createElement('canvas');
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
}

/** 通过临时链接触发文件下载，完成后立即释放 Blob URL */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * 将预览 Canvas 导出为图片文件。
 * WebP 不受支持时自动回退 PNG，并通过 onFallback 通知用户。
 */
export function exportCanvas(
  canvas: HTMLCanvasElement,
  state: AppState,
  onFallback?: (message: string) => void,
): void {
  let format = state.format;
  if (format === 'webp' && !supportsWebp()) {
    format = 'png';
    onFallback?.('WebP is not supported in this browser. Falling back to PNG.');
  }

  const mime = MIME_TYPES[format];
  // PNG 为无损格式，不传 quality 参数；JPEG/WebP 使用用户设定的压缩质量
  const quality = format === 'png' ? undefined : state.quality;
  const filename = `flexipic-${state.width}x${state.height}.${EXTENSIONS[format]}`;

  canvas.toBlob(
    (blob) => {
      if (blob) triggerDownload(blob, filename);
    },
    mime,
    quality,
  );
}
