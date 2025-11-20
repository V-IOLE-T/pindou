import { type PixelData, type ExportOptions } from '../types';
import { getContrastColor } from './imageProcessing';

const PIXEL_SIZE = 20;
const AXIS_SIZE = 30;
const GRID_LINE_COLOR = '#E5E7EB';
const BOLD_GRID_LINE_COLOR = '#EC4899';

export function exportToImage(
  pixels: PixelData[],
  width: number,
  height: number,
  options: ExportOptions
): void {
  const { format, quality, scale } = options;

  // Calculate canvas size
  const canvasWidth = Math.floor((width * PIXEL_SIZE + AXIS_SIZE) * scale);
  const canvasHeight = Math.floor((height * PIXEL_SIZE + AXIS_SIZE) * scale);

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法获取Canvas上下文');
  }

  // Fill background
  ctx.fillStyle = '#374151';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw pixels
  pixels.forEach((pixel) => {
    const x = (pixel.x * PIXEL_SIZE + AXIS_SIZE) * scale;
    const y = (pixel.y * PIXEL_SIZE + AXIS_SIZE) * scale;
    const size = PIXEL_SIZE * scale;

    // Draw pixel background
    ctx.fillStyle = pixel.hex;
    ctx.fillRect(x, y, size, size);

    // Draw border
    ctx.strokeStyle = GRID_LINE_COLOR;
    ctx.lineWidth = 0.5 * scale;
    ctx.strokeRect(x, y, size, size);

    // Draw label (always show in export)
    if (size >= 10) {
      const textColor = getContrastColor(pixel.hex);
      ctx.fillStyle = textColor;
      ctx.font = `${size * 0.4}px 'Roboto Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pixel.code, x + size / 2, y + size / 2);
    }
  });

  // Draw bold grid lines every 10 pixels
  ctx.strokeStyle = BOLD_GRID_LINE_COLOR;
  ctx.lineWidth = 2 * scale;

  // Vertical bold lines
  for (let x = 0; x <= width; x += 10) {
    const pos = (x * PIXEL_SIZE + AXIS_SIZE) * scale;
    ctx.beginPath();
    ctx.moveTo(pos, AXIS_SIZE * scale);
    ctx.lineTo(pos, canvasHeight);
    ctx.stroke();
  }

  // Horizontal bold lines
  for (let y = 0; y <= height; y += 10) {
    const pos = (y * PIXEL_SIZE + AXIS_SIZE) * scale;
    ctx.beginPath();
    ctx.moveTo(AXIS_SIZE * scale, pos);
    ctx.lineTo(canvasWidth, pos);
    ctx.stroke();
  }

  // Draw axes
  ctx.fillStyle = '#F9FAFB';
  ctx.fillRect(0, 0, canvasWidth, AXIS_SIZE * scale);
  ctx.fillRect(0, 0, AXIS_SIZE * scale, canvasHeight);

  // Draw axis labels
  ctx.fillStyle = '#374151';
  ctx.font = `${12 * scale}px 'Roboto Mono', monospace`;
  ctx.textAlign = 'center';

  // Y-axis labels
  for (let y = 0; y < height; y++) {
    const labelY = (y * PIXEL_SIZE + AXIS_SIZE) * scale + (PIXEL_SIZE * scale) / 2;
    const labelX = (AXIS_SIZE * scale) / 2;
    ctx.fillText((y + 1).toString(), labelX, labelY);
  }

  // X-axis labels
  ctx.textAlign = 'center';
  for (let x = 0; x < width; x++) {
    const labelX = (x * PIXEL_SIZE + AXIS_SIZE) * scale + (PIXEL_SIZE * scale) / 2;
    const labelY = (AXIS_SIZE * scale) / 2;
    ctx.fillText((x + 1).toString(), labelX, labelY);
  }

  // Draw axis lines
  ctx.strokeStyle = '#9CA3AF';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(AXIS_SIZE * scale, 0);
  ctx.lineTo(AXIS_SIZE * scale, canvasHeight);
  ctx.moveTo(0, AXIS_SIZE * scale);
  ctx.lineTo(canvasWidth, AXIS_SIZE * scale);
  ctx.stroke();

  // Download
  canvas.toBlob(
    (blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pixelbead-pattern.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    format === 'png' ? 'image/png' : 'image/jpeg',
    quality
  );
}
