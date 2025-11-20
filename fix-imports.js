const fs = require('fs');

const files = [
  'src/components/BOMPanel.tsx',
  'src/components/ControlPanel.tsx',
  'src/components/PixelCanvas.tsx',
  'src/hooks/usePixelation.ts',
  'src/utils/export.ts',
  'src/utils/imageProcessing.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix BOMItem import
  content = content.replace("import { BOMItem }", "import type { BOMItem }");
  
  // Fix BeadBrand import
  content = content.replace("import { BeadBrand }", "import type { BeadBrand }");
  
  // Fix ImageAdjustments import
  content = content.replace("import { ImageAdjustments }", "import type { ImageAdjustments }");
  
  // Fix PixelData import
  content = content.replace("import { PixelData }", "import type { PixelData }");
  
  // Fix ZoomState import
  content = content.replace("import { ZoomState }", "import type { ZoomState }");
  
  // Fix ExportOptions import
  content = content.replace("import { ExportOptions }", "import type { ExportOptions }");
  
  // Fix ColorPalette import (only keep one)
  content = content.replace(/import type { ColorPalette, ImageAdjustments, PixelData, BeadBrand }/g, 
    "import type { ColorPalette, ImageAdjustments, PixelData, BeadBrand }");
  
  fs.writeFileSync(file, content);
});

console.log('Fixed imports');
