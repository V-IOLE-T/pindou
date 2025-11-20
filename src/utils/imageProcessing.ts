import type { ImageAdjustments, PixelData, BeadBrand } from '../types';import { getColorPalette } from '../data/colorPalettes';

// RGB to Lab color space converter
function rgbToLab(r: number, g: number, b: number) {
  // Convert RGB to XYZ
  const srgb = [r / 255, g / 255, b / 255].map(val => {
    return val > 0.04045 ? Math.pow((val + 0.055) / 1.055, 2.4) : val / 12.92;
  });

  const [R, G, B] = srgb;
  const X = R * 0.4124 + G * 0.3576 + B * 0.1805;
  const Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const Z = R * 0.0193 + G * 0.1192 + B * 0.9505;

  // Convert XYZ to Lab
  const refX = 0.95047;
  const refY = 1.00000;
  const refZ = 1.08883;

  const x = X / refX;
  const y = Y / refY;
  const z = Z / refZ;

  const fx = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  const fy = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  const fz = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  const L = (116 * fy) - 16;
  const a = 500 * (fx - fy);
  const b2 = 200 * (fy - fz);

  return { L, a, b: b2 };
}

// 获取与目标颜色最匹配的品牌色号
export function findClosestColor(
  targetHex: string,
  brand: BeadBrand
): { code: string; name: string; hex: string } | null {
  const palette = getColorPalette(brand);

  // Convert target hex to RGB
  const targetR = parseInt(targetHex.slice(1, 3), 16);
  const targetG = parseInt(targetHex.slice(3, 5), 16);
  const targetB = parseInt(targetHex.slice(5, 7), 16);

  const targetLab = rgbToLab(targetR, targetG, targetB);

  let minDelta = Infinity;
  let closestMatch: { code: string; name: string; hex: string } | null = null;

  Object.entries(palette).forEach(([code, colorData]) => {
    const r = parseInt(colorData.hex.slice(1, 3), 16);
    const g = parseInt(colorData.hex.slice(3, 5), 16);
    const b = parseInt(colorData.hex.slice(5, 7), 16);

    const lab = rgbToLab(r, g, b);

    // Calculate Delta E using Euclidean distance
    const delta = Math.sqrt(
      Math.pow(targetLab.L - lab.L, 2) +
      Math.pow(targetLab.a - lab.a, 2) +
      Math.pow(targetLab.b - lab.b, 2)
    );

    if (delta < minDelta) {
      minDelta = delta;
      closestMatch = { code, name: colorData.name, hex: colorData.hex };
    }
  });

  return closestMatch;
}

// 应用图像调整参数
export function applyImageAdjustments(
  imageData: ImageData,
  adjustments: ImageAdjustments
): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const { brightness, contrast, saturation } = adjustments;

  const brightnessFactor = (brightness / 100) * 255;
  const contrastFactor = (contrast / 100) + 1;
  const saturationFactor = (saturation / 100) + 1;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Apply brightness
    r += brightnessFactor;
    g += brightnessFactor;
    b += brightnessFactor;

    // Apply contrast
    r = ((r / 255 - 0.5) * contrastFactor + 0.5) * 255;
    g = ((g / 255 - 0.5) * contrastFactor + 0.5) * 255;
    b = ((b / 255 - 0.5) * contrastFactor + 0.5) * 255;

    // Apply saturation (convert to HSL)
    const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
    r = gray + (r - gray) * saturationFactor;
    g = gray + (g - gray) * saturationFactor;
    b = gray + (b - gray) * saturationFactor;

    // Clamp values
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  return new ImageData(data, imageData.width, imageData.height);
}

// 图片像素化处理
export function pixelateImage(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number,
  brand: BeadBrand,
  adjustments: ImageAdjustments
): PixelData[] {
  // Apply adjustments first
  const adjustedData = applyImageAdjustments(imageData, adjustments);

  const pixels: PixelData[] = [];
  const ratioX = adjustedData.width / targetWidth;
  const ratioY = adjustedData.height / targetHeight;

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      // Get the color of the pixel in the center of this grid cell
      const srcX = Math.floor(x * ratioX + ratioX / 2);
      const srcY = Math.floor(y * ratioY + ratioY / 2);

      const idx = (srcY * adjustedData.width + srcX) * 4;
      const r = adjustedData.data[idx];
      const g = adjustedData.data[idx + 1];
      const b = adjustedData.data[idx + 2];

      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

      const match = findClosestColor(hex, brand);

      if (match) {
        pixels.push({
          x,
          y,
          hex: match.hex,
          code: match.code,
          name: match.name,
          isLight: getLuminance(match.hex) > 0.5,
        });
      }
    }
  }

  return pixels;
}

// 计算颜色亮度（用于文字反色）
export function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Using YIQ formula
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq / 255;
}

// 获取文字颜色（黑或白）
export function getContrastColor(hex: string): string {
  return getLuminance(hex) > 0.5 ? '#000000' : '#FFFFFF';
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

// 文件转ImageData
export function fileToImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('无法获取Canvas上下文'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      resolve(imageData);
    };
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
}
