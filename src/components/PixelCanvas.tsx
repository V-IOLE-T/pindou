import React, { useRef, useEffect, useState, useCallback } from 'react';
import { type PixelData, type ZoomState } from '../types';
import { getContrastColor } from '../utils/imageProcessing';

interface PixelCanvasProps {
  pixels: PixelData[];
  width: number;
  height: number;
  isLoading?: boolean;
}

const PIXEL_SIZE = 20; // Base pixel size before zoom
const AXIS_SIZE = 30; // Space for axis labels
const GRID_LINE_COLOR = '#E5E7EB';
const BOLD_GRID_LINE_COLOR = '#EC4899'; // Pink for bold lines

export const PixelCanvas: React.FC<PixelCanvasProps> = ({
  pixels,
  width,
  height,
  isLoading = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomState, setZoomState] = useState<ZoomState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    dragStart: null,
  });
  const [showLabels, setShowLabels] = useState(true);

  // Update showLabels based on zoom level
  useEffect(() => {
    setShowLabels(zoomState.scale >= 0.5);
  }, [zoomState.scale]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { scale, offsetX, offsetY } = zoomState;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context
    ctx.save();

    // Apply zoom and pan
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Draw grid background
    const totalWidth = width * PIXEL_SIZE;
    const totalHeight = height * PIXEL_SIZE;

    // Draw pixels
    pixels.forEach((pixel) => {
      const x = pixel.x * PIXEL_SIZE;
      const y = pixel.y * PIXEL_SIZE;

      // Draw pixel background
      ctx.fillStyle = pixel.hex;
      ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);

      // Draw border
      ctx.strokeStyle = GRID_LINE_COLOR;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, PIXEL_SIZE, PIXEL_SIZE);

      // Draw label (only if zoom level is sufficient)
      if (showLabels && PIXEL_SIZE * scale >= 10) {
        const textColor = getContrastColor(pixel.hex);
        ctx.fillStyle = textColor;
        ctx.font = `${PIXEL_SIZE * 0.4}px 'Roboto Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          pixel.code,
          x + PIXEL_SIZE / 2,
          y + PIXEL_SIZE / 2
        );
      }
    });

    // Draw bold grid lines every 10 pixels
    ctx.strokeStyle = BOLD_GRID_LINE_COLOR;
    ctx.lineWidth = 2;

    // Vertical bold lines
    for (let x = 0; x <= width; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x * PIXEL_SIZE, 0);
      ctx.lineTo(x * PIXEL_SIZE, totalHeight);
      ctx.stroke();
    }

    // Horizontal bold lines
    for (let y = 0; y <= height; y += 10) {
      ctx.beginPath();
      ctx.moveTo(0, y * PIXEL_SIZE);
      ctx.lineTo(totalWidth, y * PIXEL_SIZE);
      ctx.stroke();
    }

    // Restore context
    ctx.restore();

    // Draw axes (not affected by zoom)
    ctx.fillStyle = '#374151';
    ctx.font = '12px Roboto Mono, monospace';
    ctx.textAlign = 'center';

    // Draw Y-axis labels (left side)
    for (let y = 0; y < height; y++) {
      const labelY = y * PIXEL_SIZE * scale + offsetY + AXIS_SIZE;
      const labelX = AXIS_SIZE / 2;

      if (labelY >= AXIS_SIZE && labelY <= canvas.height) {
        ctx.fillText((y + 1).toString(), labelX, labelY + PIXEL_SIZE * scale / 2);
      }
    }

    // Draw X-axis labels (top)
    ctx.textAlign = 'center';
    for (let x = 0; x < width; x++) {
      const labelX = x * PIXEL_SIZE * scale + offsetX + AXIS_SIZE + PIXEL_SIZE * scale / 2;
      const labelY = AXIS_SIZE / 2;

      if (labelX >= AXIS_SIZE && labelX <= canvas.width) {
        ctx.fillText((x + 1).toString(), labelX, labelY);
      }
    }

    // Draw axis backgrounds
    ctx.fillStyle = '#F9FAFB';
    ctx.fillRect(0, 0, canvas.width, AXIS_SIZE); // Top axis
    ctx.fillRect(0, 0, AXIS_SIZE, canvas.height); // Left axis

    // Draw axis lines
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(AXIS_SIZE, 0);
    ctx.lineTo(AXIS_SIZE, canvas.height);
    ctx.moveTo(0, AXIS_SIZE);
    ctx.lineTo(canvas.width, AXIS_SIZE);
    ctx.stroke();
  }, [pixels, width, height, zoomState, showLabels]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(zoomState.scale * delta, 0.1), 5);

    // Zoom towards mouse position
    const newOffsetX = mouseX - (mouseX - zoomState.offsetX) * (newScale / zoomState.scale);
    const newOffsetY = mouseY - (mouseY - zoomState.offsetY) * (newScale / zoomState.scale);

    setZoomState(prev => ({
      ...prev,
      scale: newScale,
      offsetX: newOffsetX,
      offsetY: newOffsetY,
    }));
  };

  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && e.shiftKey) { // Shift + Left click for panning
      setZoomState(prev => ({
        ...prev,
        isDragging: true,
        dragStart: { x: e.clientX - prev.offsetX, y: e.clientY - prev.offsetY },
      }));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (zoomState.isDragging && zoomState.dragStart) {
      setZoomState(prev => ({
        ...prev,
        offsetX: e.clientX - prev.dragStart!.x,
        offsetY: e.clientY - prev.dragStart!.y,
      }));
    }
  };

  const handleMouseUp = () => {
    setZoomState(prev => ({
      ...prev,
      isDragging: false,
      dragStart: null,
    }));
  };

  // Calculate canvas size
  const canvasWidth = Math.max(
    (width * PIXEL_SIZE + AXIS_SIZE) * zoomState.scale + zoomState.offsetX,
    300
  );
  const canvasHeight = Math.max(
    (height * PIXEL_SIZE + AXIS_SIZE) * zoomState.scale + zoomState.offsetY,
    300
  );

  return (
    <div className="relative w-full h-full bg-gray-700 overflow-hidden flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="border border-gray-600 shadow-lg cursor-move"
        style={{
          background: '#374151',
        }}
      />

      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-700 text-center">处理图片中...</p>
          </div>
        </div>
      )}

      {!isLoading && pixels.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="border-2 border-dashed border-gray-400 p-12 rounded-lg text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-4 text-gray-300 text-lg">拖拽图片至此或点击上传</p>
            <p className="mt-2 text-gray-400 text-sm">支持 JPG, PNG 格式</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded text-sm">
        缩放: {(zoomState.scale * 100).toFixed(0)}% | 按住 Shift+拖拽 平移 | 滚轮缩放
      </div>
    </div>
  );
};
