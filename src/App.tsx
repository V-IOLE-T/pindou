
import { PixelCanvas } from './components/PixelCanvas';
import { ControlPanel } from './components/ControlPanel';
import { BOMPanel } from './components/BOMPanel';
import { usePixelation } from './hooks/usePixelation';
import { exportToImage } from './utils/export';

function App() {
  const {
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
    handleExport: getExportData,
  } = usePixelation();

  const handleExport = () => {
    const exportData = getExportData();
    if (exportData.pixels.length > 0) {
      exportToImage(
        exportData.pixels,
        exportData.width,
        exportData.height,
        {
          format: 'png',
          quality: 1,
          scale: 2,
        }
      );
    }
  };

  const boardHeight = Math.floor(boardWidth * 0.75);

  return (
    <div className="w-screen h-screen flex bg-gray-800">
      <ControlPanel
        boardWidth={boardWidth}
        onBoardWidthChange={setBoardWidth}
        brand={brand}
        onBrandChange={setBrand}
        dithering={dithering}
        onDitheringChange={setDithering}
        adjustments={adjustments}
        onAdjustmentsChange={setAdjustments}
        onFileUpload={handleFileUpload}
        onExport={handleExport}
        pixelCount={pixels.length}
        isLoading={isLoading}
      />

      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative">
          <PixelCanvas
            pixels={pixels}
            width={boardWidth}
            height={boardHeight}
            isLoading={isLoading}
          />
        </div>

        <div className="h-80 p-4 bg-gray-100 border-t border-gray-300 overflow-y-auto">
          <BOMPanel pixels={pixels} />
        </div>
      </div>
    </div>
  );
}

export default App;
