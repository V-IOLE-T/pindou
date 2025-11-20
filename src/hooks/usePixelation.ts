import { useState, useEffect, useCallback } from 'react';
import { type PixelData, type ImageAdjustments, type BeadBrand } from '../types';
import { fileToImageData, pixelateImage, debounce } from '../utils/imageProcessing';

export function usePixelation() {
  const [pixels, setPixels] = useState<PixelData[]>([]);
  const [boardWidth, setBoardWidth] = useState(50);
  const [brand, setBrand] = useState<BeadBrand>('perler');
  const [dithering, setDithering] = useState(false);
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);

  // Process image when parameters change
  const processImage = useCallback(
    debounce(async (imageData: ImageData, width: number, beadBrand: BeadBrand, imgAdjustments: ImageAdjustments) => {
      if (!imageData) return;

      setIsLoading(true);

      try {
        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, 100));

        const aspectRatio = 0.75; // 3:4 aspect ratio
        const targetHeight = Math.floor(width * aspectRatio);

        const newPixels = pixelateImage(imageData, width, targetHeight, beadBrand, imgAdjustments);
        setPixels(newPixels);
      } catch (error) {
        console.error('Error processing image:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Reprocess image when parameters change
  useEffect(() => {
    if (originalImageData) {
      processImage(originalImageData, boardWidth, brand, adjustments);
    }
  }, [originalImageData, boardWidth, brand, adjustments, processImage]);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const imageData = await fileToImageData(file);
      setOriginalImageData(imageData);
    } catch (error) {
      console.error('Error loading image:', error);
      setIsLoading(false);
    }
  }, []);

  // Handle export
  const handleExport = useCallback(() => {
    return {
      pixels,
      width: boardWidth,
      height: Math.floor(boardWidth * 0.75),
    };
  }, [pixels, boardWidth]);

  return {
    pixels,
    boardWidth,
    setBoardWidth,
    brand,
    setBrand,
    dithering,
    setDithering,
    adjustments,
    setAdjustments,
    isLoading,
    handleFileUpload,
    handleExport,
  };
}
