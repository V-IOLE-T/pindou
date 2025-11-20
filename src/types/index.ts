// 拼豆画板配置
export interface BoardConfig {
  width: number;  // 横向格数 (e.g., 50)
  height: number; // 纵向格数 (自动计算)
  brand: 'perler' | 'artkal_s' | 'artkal_c'; // 品牌色卡
  dithering: boolean; // 是否开启抖动算法(让颜色过渡更自然)
}

// 单个像素点数据
export interface PixelData {
  x: number; // 列坐标
  y: number; // 行坐标
  hex: string; // 渲染用的颜色 (e.g., #FF0000)
  code: string; // 品牌色号 (e.g., P05)
  name: string; // 颜色名称 (e.g., Red)
  isLight: boolean; // 背景是否为亮色 (用于决定文字是用黑还是白)
}

// 色卡定义结构 (需预置JSON)
export type ColorPalette = {
  [code: string]: {
    hex: string;
    name: string;
    brand: 'perler' | 'artkal_s' | 'artkal_c';
  };
};

// 色卡品牌
export type BeadBrand = 'perler' | 'artkal_s' | 'artkal_c';

// 缩放状态
export interface ZoomState {
  scale: number;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
  dragStart: { x: number; y: number } | null;
}

// 图片调整参数
export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
}

// 物料清单项
export interface BOMItem {
  code: string;
  name: string;
  hex: string;
  count: number;
}

// 导出选项
export interface ExportOptions {
  format: 'png' | 'jpg';
  quality: number;
  scale: number; // 导出缩放倍数
}
