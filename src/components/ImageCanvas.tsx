import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { DrawingMode } from "@/lib/types";
import DrawingTools from "./DrawingTools";
import LoadingSpinner from "./LoadingSpinner";

interface ImageCanvasProps {
  imageUrl: string | null;
  drawingMode: DrawingMode;
  setDrawingMode: (mode: DrawingMode) => void;
  onImageEdit: (dataUrl: string) => void;
  loading: boolean;
  adjusting: boolean;
  className?: string;
  onGenerateImage: () => void;
  generatingImage: boolean;
  storyContent: string;
}

const ImageCanvas = forwardRef<any, ImageCanvasProps>(({ 
  imageUrl, 
  drawingMode, 
  setDrawingMode, 
  onImageEdit,
  loading,
  adjusting,
  className,
  onGenerateImage,
  generatingImage,
  storyContent
}, ref) => {
  // Define how much larger the drawing canvas should be relative to the image
  const canvasImageProportionWidth = 1.5; // 50% larger width
  const canvasImageProportionHeight = 1.5; // 50% larger height
  
  // Main visible canvas (shows image + drawings)
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  // Hidden canvas (tracks only drawings for extraction)
  const drawingOnlyCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [mainContext, setMainContext] = useState<CanvasRenderingContext2D | null>(null);
  const [drawingOnlyContext, setDrawingOnlyContext] = useState<CanvasRenderingContext2D | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 600, height: 400 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Use the uploaded image as the default background
  const uploadedImageUrl = "/lovable-uploads/cdaad9ac-9773-44cd-82d5-297525d46f6c.png";
  
  // Setup canvas contexts when component mounts
  useEffect(() => {
    if (mainCanvasRef.current && drawingOnlyCanvasRef.current) {
      const mainCtx = mainCanvasRef.current.getContext('2d');
      const drawingCtx = drawingOnlyCanvasRef.current.getContext('2d');
      
      if (mainCtx && drawingCtx) {
        setMainContext(mainCtx);
        setDrawingOnlyContext(drawingCtx);
        
        // Set default line styles for both contexts
        [mainCtx, drawingCtx].forEach(ctx => {
          ctx.lineWidth = drawingMode.thickness || 5;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
        });
      }
    }
  }, []);

  // Load and setup image when imageUrl changes
  useEffect(() => {
    if (mainCanvasRef.current && drawingOnlyCanvasRef.current && mainContext && drawingOnlyContext) {
      setImageError(null);
      
      // Default canvas dimensions
      const defaultWidth = 600;
      const defaultHeight = 400;
      
      // Use uploaded image or generated image
      const sourceImageUrl = imageUrl || uploadedImageUrl;
      
      if (sourceImageUrl) {
        const image = new Image();
        image.crossOrigin = "anonymous";
        
        image.onload = () => {
          if (mainCanvasRef.current && drawingOnlyCanvasRef.current) {
            // Calculate canvas dimensions (larger than image)
            const drawingWidth = Math.round(image.width * canvasImageProportionWidth);
            const drawingHeight = Math.round(image.height * canvasImageProportionHeight);
            
            // Calculate image position (centered in larger canvas)
            const imageX = Math.round((drawingWidth - image.width) / 2);
            const imageY = Math.round((drawingHeight - image.height) / 2);
            
            // Set up both canvases with same dimensions
            mainCanvasRef.current.width = drawingWidth;
            mainCanvasRef.current.height = drawingHeight;
            drawingOnlyCanvasRef.current.width = drawingWidth;
            drawingOnlyCanvasRef.current.height = drawingHeight;
            
            // Clear both canvases
            mainContext.clearRect(0, 0, drawingWidth, drawingHeight);
            drawingOnlyContext.clearRect(0, 0, drawingWidth, drawingHeight);
            
            // Draw image on main canvas only
            mainContext.drawImage(image, imageX, imageY);
            
            // Update state
            setBackgroundImage(image);
            setCanvasDimensions({ width: drawingWidth, height: drawingHeight });
            setImagePosition({ x: imageX, y: imageY, width: image.width, height: image.height });
            
            // Save initial state to history
            setTimeout(() => saveCanvasState(), 100);
          }
        };
        
        image.onerror = () => {
          console.error("Error loading image:", sourceImageUrl);
          setImageError("Failed to load image. Please try another one.");
          
          // Create a blank canvas with default dimensions
          if (mainCanvasRef.current && drawingOnlyCanvasRef.current) {
            const drawingWidth = Math.round(defaultWidth * canvasImageProportionWidth);
            const drawingHeight = Math.round(defaultHeight * canvasImageProportionHeight);
            
            mainCanvasRef.current.width = drawingWidth;
            mainCanvasRef.current.height = drawingHeight;
            drawingOnlyCanvasRef.current.width = drawingWidth;
            drawingOnlyCanvasRef.current.height = drawingHeight;
            
            mainContext.clearRect(0, 0, drawingWidth, drawingHeight);
            mainContext.fillStyle = "#f0f0f0";
            mainContext.fillRect(0, 0, drawingWidth, drawingHeight);
            mainContext.fillStyle = "#666";
            mainContext.font = "16px sans-serif";
            mainContext.fillText("Image could not be loaded", 20, 30);
            
            drawingOnlyContext.clearRect(0, 0, drawingWidth, drawingHeight);
            
            setCanvasDimensions({ width: drawingWidth, height: drawingHeight });
            
            // Save initial state to history
            setTimeout(() => saveCanvasState(), 100);
          }
        };
        
        image.src = sourceImageUrl;
      } else {
        // Create empty canvas when no image
        const drawingWidth = Math.round(defaultWidth * canvasImageProportionWidth);
        const drawingHeight = Math.round(defaultHeight * canvasImageProportionHeight);
        
        mainCanvasRef.current.width = drawingWidth;
        mainCanvasRef.current.height = drawingHeight;
        drawingOnlyCanvasRef.current.width = drawingWidth;
        drawingOnlyCanvasRef.current.height = drawingHeight;
        
        mainContext.fillStyle = "#f0f0f0";
        mainContext.fillRect(0, 0, drawingWidth, drawingHeight);
        drawingOnlyContext.clearRect(0, 0, drawingWidth, drawingHeight);
        
        setCanvasDimensions({ width: drawingWidth, height: drawingHeight });
        
        // Save initial state to history
        setTimeout(() => saveCanvasState(), 100);
      }
    }
  }, [imageUrl, mainContext, drawingOnlyContext]);

  // Redraw the entire canvas (background + all drawings)
  const redrawCanvas = () => {
    if (mainCanvasRef.current && drawingOnlyCanvasRef.current && mainContext && backgroundImage) {
      // Clear main canvas with transparent background
      mainContext.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
      
      // Redraw background image
      mainContext.drawImage(backgroundImage, imagePosition.x, imagePosition.y);
      
      // Draw the drawings on top (this preserves transparency)
      mainContext.drawImage(drawingOnlyCanvasRef.current, 0, 0);
    }
  };

  // History management functions
  const saveCanvasState = () => {
    if (drawingOnlyCanvasRef.current && drawingOnlyContext) {
      const imageData = drawingOnlyContext.getImageData(0, 0, canvasDimensions.width, canvasDimensions.height);
      
      // Remove any history after current index (when we make a new action after undoing)
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      
      // Limit history to prevent memory issues (keep last 50 states)
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        setHistoryIndex(prev => prev + 1);
      }
      
      setHistory(newHistory);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0 && drawingOnlyCanvasRef.current && drawingOnlyContext) {
      const newIndex = historyIndex - 1;
      const imageData = history[newIndex];
      
      // Restore the canvas state
      drawingOnlyContext.putImageData(imageData, 0, 0);
      setHistoryIndex(newIndex);
      
      // Redraw the main canvas
      redrawCanvas();
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && drawingOnlyCanvasRef.current && drawingOnlyContext) {
      const newIndex = historyIndex + 1;
      const imageData = history[newIndex];
      
      // Restore the canvas state
      drawingOnlyContext.putImageData(imageData, 0, 0);
      setHistoryIndex(newIndex);
      
      // Redraw the main canvas
      redrawCanvas();
    }
  };

  // Zoom control functions
  const handleZoomIn = () => {
    setZoom(prev => Math.min(3, prev + 0.25));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.25, prev - 0.25));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawingMode.mode === "none" || !mainCanvasRef.current || !mainContext || !drawingOnlyContext) return;
    
    const rect = mainCanvasRef.current.getBoundingClientRect();
    const scaleX = mainCanvasRef.current.width / rect.width;
    const scaleY = mainCanvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Set up drawing styles
    if (drawingMode.mode === "erase") {
      // For erasing, only set up the drawing-only canvas to erase
      drawingOnlyContext.beginPath();
      drawingOnlyContext.moveTo(x, y);
      drawingOnlyContext.lineWidth = drawingMode.thickness || 15;
      drawingOnlyContext.lineCap = "round";
      drawingOnlyContext.lineJoin = "round";
      drawingOnlyContext.globalCompositeOperation = "destination-out";
      
      // Don't set up main context for erasing since we'll redraw it entirely
    } else {
      // For normal drawing, set up both contexts
      [mainContext, drawingOnlyContext].forEach(ctx => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = drawingMode.thickness || 5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = drawingMode.color;
      });
    }
    
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || drawingMode.mode === "none" || !mainCanvasRef.current || !mainContext || !drawingOnlyContext) return;
    
    const rect = mainCanvasRef.current.getBoundingClientRect();
    const scaleX = mainCanvasRef.current.width / rect.width;
    const scaleY = mainCanvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Draw on the drawing-only canvas first
    drawingOnlyContext.lineTo(x, y);
    drawingOnlyContext.stroke();
    
    // For erase mode, we need to redraw the entire main canvas to show the background through erased areas
    if (drawingMode.mode === "erase") {
      redrawCanvas();
    } else {
      // For normal drawing, just draw directly on the main canvas
      mainContext.lineTo(x, y);
      mainContext.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      
      // Reset composite operation back to normal
      if (drawingOnlyContext) {
        drawingOnlyContext.globalCompositeOperation = "source-over";
      }
      
      // If we were erasing, do a final redraw to ensure everything is properly displayed
      if (drawingMode.mode === "erase") {
        redrawCanvas();
      }
      
      // Save the current state to history after drawing is complete
      setTimeout(() => saveCanvasState(), 10);
    }
  };

  // Set cursor based on drawing mode
  const getCursor = () => {
    switch (drawingMode.mode) {
      case "add":
        return "crosshair";
      case "remove":
        return "crosshair";
      case "erase":
        return "crosshair"; // Changed from "grab" to "crosshair" for consistency
      default:
        return "default";
    }
  };

  // Helper function to generate dataURL with ONLY the drawings (no background)
  const onGenerateStory = () => {
    if (drawingOnlyCanvasRef.current) {
      // This will only contain the user's drawings on a transparent background
      const dataUrl = drawingOnlyCanvasRef.current.toDataURL();
      onImageEdit(dataUrl);
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    onGenerateStory
  }));

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" />
            <span className="ml-3">Generating image...</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
              <div className="relative inline-block">
                {/* Main visible canvas */}
                <canvas
                  ref={mainCanvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  style={{ 
                    cursor: getCursor(),
                    maxWidth: "100%",
                    maxHeight: "100%",
                    border: "1px solid #ddd",
                    display: "block",
                    transform: `scale(${zoom})`,
                    transformOrigin: "center center"
                  }}
                />
                
                {/* Hidden canvas for tracking drawings only */}
                <canvas
                  ref={drawingOnlyCanvasRef}
                  style={{ 
                    display: "none"
                  }}
                />
                
                {imageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-80 text-red-600 p-4 text-center">
                    {imageError}
                  </div>
                )}
                {adjusting && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <LoadingSpinner size="lg" className="text-white" />
                  </div>
                )}
              </div>
            </div>
            
            <DrawingTools
              currentMode={drawingMode}
              setMode={setDrawingMode}
              onAdjustStory={() => {
                if (drawingOnlyCanvasRef.current) {
                  // This sends ONLY the drawings, not the background image
                  const dataUrl = drawingOnlyCanvasRef.current.toDataURL();
                  onImageEdit(dataUrl);
                }
              }}
              adjusting={adjusting}
              hasImage={true}
              showGenerateButton={false}
              zoom={zoom}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetZoom={handleResetZoom}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
            />
          </div>
        )}
      </div>
    </div>
  );
});

ImageCanvas.displayName = "ImageCanvas";

export default ImageCanvas;