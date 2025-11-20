import type { PixelData, BOMItem } from '../types';
import React from 'react';

interface BOMPanelProps {
  pixels: PixelData[];
}

export const BOMPanel: React.FC<BOMPanelProps> = ({ pixels }) => {
  // Calculate BOM from pixels
  const calculateBOM = (): BOMItem[] => {
    const colorMap = new Map<string, { code: string; name: string; hex: string; count: number }>();

    pixels.forEach((pixel) => {
      const existing = colorMap.get(pixel.code);
      if (existing) {
        existing.count++;
      } else {
        colorMap.set(pixel.code, {
          code: pixel.code,
          name: pixel.name,
          hex: pixel.hex,
          count: 1,
        });
      }
    });

    // Convert to array and sort by count (descending)
    return Array.from(colorMap.values()).sort((a, b) => b.count - a.count);
  };

  const bom = calculateBOM();
  const totalBeads = pixels.length;

  if (bom.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">物料清单</h3>
        <p className="text-xs text-gray-500 text-center py-4">
          上传图片后显示物料清单
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">物料清单</h3>
        <span className="text-xs text-gray-500">
          共 {totalBeads} 颗豆子
        </span>
      </div>

      <div className="max-h-80 overflow-y-auto space-y-2">
        {bom.map((item) => (
          <div
            key={item.code}
            className="flex items-center justify-between bg-white p-3 rounded border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {/* Color swatch */}
              <div
                className="w-8 h-8 rounded border-2 border-gray-300 shadow-sm flex-shrink-0"
                style={{ backgroundColor: item.hex }}
                title={item.name}
              />

              {/* Code and name */}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-gray-800 font-mono">
                  {item.code}
                </div>
                <div className="text-xs text-gray-600 truncate">{item.name}</div>
              </div>
            </div>

            {/* Count */}
            <div className="text-right flex-shrink-0 ml-3">
              <div className="text-lg font-bold text-blue-600 font-mono">
                {item.count}
              </div>
              <div className="text-xs text-gray-500">
                {((item.count / totalBeads) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-gray-300">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">色号种类:</span>
          <span className="font-semibold text-gray-800 font-mono">{bom.length}</span>
        </div>
      </div>
    </div>
  );
};
