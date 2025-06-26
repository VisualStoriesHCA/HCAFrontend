import { DrawingMode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Minus, Plus, Undo, Redo } from "lucide-react";
import ColorPicker from "./ColorPicker";

interface DrawingToolsProps {
  currentMode: DrawingMode;
  setMode: (mode: DrawingMode) => void;
  onAdjustStory: () => void;
  adjusting: boolean;
  hasImage: boolean;
  showGenerateButton?: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const DrawingTools = ({ 
  currentMode, 
  setMode, 
  onAdjustStory, 
  adjusting,
  hasImage,
  showGenerateButton = false,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}: DrawingToolsProps) => {

  const handleColorChange = (color: string) => {
    setMode({ 
      mode: "draw", 
      color: color, 
      thickness: currentMode.thickness || 5 
    });
  };

  const handleModeChange = (mode: "draw" | "erase") => {
    setMode({ 
      mode: mode, 
      color: currentMode.color || "#000000", 
      thickness: currentMode.thickness || 5 
    });
  };

  const updateThickness = (thickness: number) => {
    setMode({ ...currentMode, thickness });
  };

  const decreaseThickness = () => {
    const newThickness = Math.max(1, (currentMode.thickness || 5) - 1);
    updateThickness(newThickness);
  };

  const increaseThickness = () => {
    const newThickness = Math.min(50, (currentMode.thickness || 5) + 1);
    updateThickness(newThickness);
  };

  return (
    <div className="flex flex-col gap-3 p-3 border-t bg-gray-50">
      {/* Generate Button Row (if needed) */}
      {showGenerateButton && (
        <div className="flex justify-end">
          <Button
            onClick={onAdjustStory}
            disabled={adjusting}
            variant="default"
          >
            {adjusting ? "Generating..." : "Generate Story"}
          </Button>
        </div>
      )}

      {/* Tools Row - Color Picker with History Controls */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <ColorPicker
            currentColor={currentMode.color || "#000000"}
            currentMode={currentMode.mode}
            onColorChange={handleColorChange}
            onModeChange={handleModeChange}
            disabled={!hasImage}
          />
        </div>
        
        {/* History Controls */}
        <div className="flex border rounded overflow-hidden ml-4">
          <Button
            type="button"
            variant="outline"
            className="rounded-none text-sm px-3"
            onClick={onUndo}
            disabled={!hasImage || !canUndo}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-none text-sm px-3"
            onClick={onRedo}
            disabled={!hasImage || !canRedo}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Pen Thickness and Zoom Controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Pen Thickness */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Thickness:</span>
          <Button
            size="sm"
            variant="outline"
            onClick={decreaseThickness}
            disabled={!hasImage || (currentMode.thickness || 5) <= 1}
            className="h-7 w-7 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <div className="flex items-center justify-center min-w-[2rem]">
            <span className="text-sm font-mono">{currentMode.thickness || 5}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={increaseThickness}
            disabled={!hasImage || (currentMode.thickness || 5) >= 50}
            className="h-7 w-7 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Zoom:</span>
          <Button
            size="sm"
            variant="outline"
            onClick={onZoomOut}
            disabled={!hasImage || zoom <= 0.}
            className="h-7 w-7 p-0"
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <div className="flex items-center justify-center min-w-[3rem]">
            <span className="text-xs font-mono">{Math.round(zoom * 100)}%</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onZoomIn}
            disabled={!hasImage || zoom >= 4}
            className="h-7 w-7 p-0"
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onResetZoom}
            disabled={!hasImage}
            className="text-xs px-2 h-7"
          >
            Fit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DrawingTools;