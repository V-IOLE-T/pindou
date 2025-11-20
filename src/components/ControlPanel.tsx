import React from 'react';
import { Slider, Switch, Select, Button, Upload, message } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import type { BeadBrand, ImageAdjustments } from '../types';

interface ControlPanelProps {
  boardWidth: number;
  onBoardWidthChange: (width: number) => void;
  brand: BeadBrand;
  onBrandChange: (brand: BeadBrand) => void;
  dithering: boolean;
  onDitheringChange: (dithering: boolean) => void;
  adjustments: ImageAdjustments;
  onAdjustmentsChange: (adjustments: ImageAdjustments) => void;
  onFileUpload: (file: File) => void;
  onExport: () => void;
  pixelCount: number;
  isLoading?: boolean;
}

const { Dragger } = Upload;

export const ControlPanel: React.FC<ControlPanelProps> = ({
  boardWidth,
  onBoardWidthChange,
  brand,
  onBrandChange,
  dithering,
  onDitheringChange,
  adjustments,
  onAdjustmentsChange,
  onFileUpload,
  onExport,
  pixelCount,
  isLoading = false,
}) => {
  const handleFileUpload = (file: File) => {
    // Validate file type
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }

    // Validate file size (max 10MB)
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('图片大小不能超过10MB！');
      return false;
    }

    onFileUpload(file);
    return false; // Prevent auto upload
  };

  const physicalSize = (boardWidth * 5) / 10; // 5mm per bead, convert to cm

  return (
    <div className="w-80 bg-white h-full shadow-lg flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">PixelBead Studio</h2>
        <p className="text-sm text-gray-600 mt-1">拼豆图纸生成器</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Image Upload */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">图片上传</h3>
          <Dragger
            accept="image/*"
            showUploadList={false}
            beforeUpload={handleFileUpload}
            disabled={isLoading}
            className="bg-gray-50 border-2 border-dashed border-gray-300 hover:border-blue-500"
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined className="text-2xl text-gray-400" />
            </p>
            <p className="ant-upload-text text-gray-600">点击或拖拽图片到此区域</p>
            <p className="ant-upload-hint text-gray-400 text-xs">
              支持 JPG、PNG 格式，最大 10MB
            </p>
          </Dragger>
        </div>

        {/* Board Width */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            画板尺寸
            <span className="text-xs text-gray-500 ml-2">
              ({boardWidth}格 ≈ {physicalSize.toFixed(1)}cm)
            </span>
          </h3>
          <Slider
            min={10}
            max={150}
            value={boardWidth}
            onChange={onBoardWidthChange}
            marks={{
              10: '10',
              50: '50',
              100: '100',
              150: '150',
            }}
            tooltip={{
              formatter: (value) => `${value}格`,
            }}
          />
        </div>

        {/* Brand Selection */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">品牌色卡</h3>
          <Select
            value={brand}
            onChange={onBrandChange}
            className="w-full"
            disabled={isLoading}
          >
            <Select.Option value="perler">Perler Beads</Select.Option>
            <Select.Option value="artkal_s">Artkal (小颗粒)</Select.Option>
            <Select.Option value="artkal_c">Artkal (大颗粒)</Select.Option>
          </Select>
        </div>

        {/* Dithering */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">抖动算法</h3>
            <p className="text-xs text-gray-500">让颜色过渡更自然</p>
          </div>
          <Switch
            checked={dithering}
            onChange={onDitheringChange}
            disabled={isLoading}
          />
        </div>

        {/* Image Adjustments */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">色彩调整</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-600 flex justify-between mb-1">
                <span>亮度</span>
                <span className="font-mono">{adjustments.brightness}</span>
              </label>
              <Slider
                min={-100}
                max={100}
                value={adjustments.brightness}
                onChange={(value) =>
                  onAdjustmentsChange({ ...adjustments, brightness: value })
                }
                tooltip={{
                  formatter: (value) => `${value}`,
                }}
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 flex justify-between mb-1">
                <span>对比度</span>
                <span className="font-mono">{adjustments.contrast}</span>
              </label>
              <Slider
                min={-100}
                max={100}
                value={adjustments.contrast}
                onChange={(value) =>
                  onAdjustmentsChange({ ...adjustments, contrast: value })
                }
                tooltip={{
                  formatter: (value) => `${value}`,
                }}
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 flex justify-between mb-1">
                <span>饱和度</span>
                <span className="font-mono">{adjustments.saturation}</span>
              </label>
              <Slider
                min={-100}
                max={100}
                value={adjustments.saturation}
                onChange={(value) =>
                  onAdjustmentsChange({ ...adjustments, saturation: value })
                }
                tooltip={{
                  formatter: (value) => `${value}`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        {pixelCount > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">统计信息</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>画板尺寸:</span>
                <span className="font-mono">
                  {boardWidth} x {Math.floor((boardWidth * 0.75))}格
                </span>
              </div>
              <div className="flex justify-between">
                <span>总像素:</span>
                <span className="font-mono">{pixelCount}</span>
              </div>
              <div className="flex justify-between">
                <span>物理尺寸:</span>
                <span className="font-mono">{physicalSize.toFixed(1)} cm</span>
              </div>
            </div>
          </div>
        )}

        {/* Export Button */}
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={onExport}
          disabled={pixelCount === 0 || isLoading}
          className="w-full h-12 text-base font-semibold"
          size="large"
        >
          下载高清图纸
        </Button>
      </div>
    </div>
  );
};
