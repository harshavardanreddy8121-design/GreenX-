export async function compressImageFile(
  file: File,
  options?: { maxWidth?: number; quality?: number }
): Promise<string> {
  const maxWidth = options?.maxWidth ?? 1600;
  const quality = options?.quality ?? 0.72;

  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);

  const scale = image.width > maxWidth ? maxWidth / image.width : 1;
  const targetWidth = Math.round(image.width * scale);
  const targetHeight = Math.round(image.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to initialize image compression context');

  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
  return canvas.toDataURL('image/jpeg', quality);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image for compression'));
    image.src = src;
  });
}
