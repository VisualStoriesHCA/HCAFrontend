import { DrawingMode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Minus, Plus, Undo, Redo } from "lucide-react";

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
  const toggleAddMode = () => {
    if (currentMode.mode === "add") {
      setMode({ mode: "none", color: "", thickness: currentMode.thickness || 5 });
    } else {
      setMode({ mode: "add", color: "#4CAF50", thickness: currentMode.thickness || 5 });
    }
  };
  
  const toggleRemoveMode = () => {
    if (currentMode.mode === "remove") {
      setMode({ mode: "none", color: "", thickness: currentMode.thickness || 5 });
    } else {
      setMode({ mode: "remove", color: "#F44336", thickness: currentMode.thickness || 5 });
    }
  };

  const toggleEraseMode = () => {
    if (currentMode.mode === "erase") {
      setMode({ mode: "none", color: "", thickness: currentMode.thickness || 5 });
    } else {
      setMode({ mode: "erase", color: "", thickness: currentMode.thickness || 15 });
    }
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
      {/* Drawing Mode Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex border rounded overflow-hidden">
            <Button
              type="button"
              variant={currentMode.mode === "add" ? "default" : "outline"}
              className={`rounded-none text-sm px-3 ${currentMode.mode === "add" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
              onClick={toggleAddMode}
              disabled={!hasImage}
            >
              Add
            </Button>
            <Button
              type="button"
              variant={currentMode.mode === "remove" ? "default" : "outline"}
              className={`rounded-none text-sm px-3 ${currentMode.mode === "remove" ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
              onClick={toggleRemoveMode}
              disabled={!hasImage}
            >
              Remove
            </Button>
            <Button
              type="button"
              variant={currentMode.mode === "erase" ? "default" : "outline"}
              className={`rounded-none text-sm px-3 ${currentMode.mode === "erase" ? "bg-gray-600 hover:bg-gray-700 text-white" : ""}`}
              onClick={toggleEraseMode}
              disabled={!hasImage}
            >
              Erase
            </Button>
          </div>
          
          {/* Undo/Redo Buttons */}
          <div className="flex border rounded overflow-hidden">
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
        
        {showGenerateButton && (
          <Button
            onClick={onAdjustStory}
            disabled={adjusting}
            variant="default"
          >
            {adjusting ? "Generating..." : "Generate Story"}
          </Button>
        )}
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
            disabled={!hasImage || zoom <= 0.25}
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
            disabled={!hasImage || zoom >= 3}
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
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DrawingTools;