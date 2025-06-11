import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { DrawingMode } from "@/lib/types";
import DrawingTools from "./DrawingTools";
import LoadingSpinner from "./LoadingSpinner";

interface ImageCanvasProps {
  imageUrl: string | null;
  drawingMode: DrawingMode;
  setDrawingMode: (mode: DrawingMode) => void;
  onImageEdit: (dataUrl: string, hasUserDrawings: boolean, hasBackgroundImage: boolean) => void;
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
  console.log("Called ImageCanvas with props")
  console.dir({ imageUrl, drawingMode, loading, adjusting, className, generatingImage, storyContent });

  // Define how much larger the drawing canvas should be relative to the image
  const canvasImageProportionWidth = 1.5; // 50% larger width
  const canvasImageProportionHeight = 1.5; // 50% larger height

  // Main visible canvas (shows image + drawings)
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  // Hidden canvas (tracks only drawings for extraction)
  const drawingOnlyCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 600, height: 400 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Track if user has made any drawings
  const [hasUserDrawings, setHasUserDrawings] = useState(false);

  // Helper function to get contexts safely
  const getContexts = () => {
    const mainCanvas = mainCanvasRef.current;
    const drawingCanvas = drawingOnlyCanvasRef.current;

    if (!mainCanvas || !drawingCanvas) {
      console.warn("Canvas elements not available");
      return null;
    }

    const mainCtx = mainCanvas.getContext('2d');
    const drawingCtx = drawingCanvas.getContext('2d');

    if (!mainCtx || !drawingCtx) {
      console.warn("Canvas contexts not available");
      return null;
    }

    return { mainCtx, drawingCtx, mainCanvas, drawingCanvas };
  };

  // Enhanced redrawCanvas that works for both plain canvas and image canvas
  const redrawCanvas = () => {
    const contexts = getContexts();
    if (!contexts) return;

    const { mainCtx, drawingCanvas } = contexts;

    // Clear main canvas completely
    mainCtx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);

    // If there's a background image, draw it first
    if (backgroundImage) {
      mainCtx.drawImage(backgroundImage, imagePosition.x, imagePosition.y);
    } else {
      // For plain canvas, fill with background color
      mainCtx.fillStyle = "#f0f0f0";
      mainCtx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);
    }

    // Draw the drawings on top (this preserves transparency)
    mainCtx.drawImage(drawingCanvas, 0, 0);
  };

  // Clear all drawings method
  const clearAllDrawings = () => {
    console.log("Clearing all drawings");
    const contexts = getContexts();
    if (!contexts) return;

    const { mainCtx, drawingCtx } = contexts;

    // Clear the drawing-only canvas completely
    drawingCtx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);

    // Redraw the main canvas (background only)
    mainCtx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
    
    if (backgroundImage) {
      mainCtx.drawImage(backgroundImage, imagePosition.x, imagePosition.y);
    } else {
      mainCtx.fillStyle = "#f0f0f0";
      mainCtx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);
    }

    // Reset drawing state
    setHasUserDrawings(false);
    
    // Clear history and reset to clean state
    setHistory([]);
    setHistoryIndex(-1);
    
    // Save the clean state as the new initial state
    requestAnimationFrame(() => {
      saveCanvasState();
    });
  };

  // Initialize or reset canvas
  const initializeCanvas = (imageUrl?: string | null) => {
    console.log("Initializing canvas with image:", imageUrl);

    const contexts = getContexts();
    if (!contexts) return;

    const { mainCtx, drawingCtx, mainCanvas, drawingCanvas } = contexts;

    // Reset error state and drawing state
    setImageError(null);
    setHasUserDrawings(false);

    // Default canvas dimensions
    const defaultWidth = 600;
    const defaultHeight = 400;

    if (imageUrl && !generatingImage) {
      console.log("Loading image:", imageUrl);
      const image = new Image();
      image.crossOrigin = "anonymous";

      // Add cache-busting query parameter to force reload
      const cacheBuster = new Date().getTime();
      const urlWithCacheBuster = imageUrl.includes('?')
        ? `${imageUrl}&_t=${cacheBuster}`
        : `${imageUrl}?_t=${cacheBuster}`;

      image.onload = () => {
        console.log("Image loaded successfully, dimensions:", image.width, "x", image.height);

        // Verify contexts are still available
        const currentContexts = getContexts();
        if (!currentContexts) {
          console.error("Contexts lost during image load");
          return;
        }

        const { mainCtx: currentMainCtx, drawingCtx: currentDrawingCtx, mainCanvas: currentMainCanvas, drawingCanvas: currentDrawingCanvas } = currentContexts;

        // Calculate canvas dimensions (larger than image)
        const drawingWidth = Math.round(image.width * canvasImageProportionWidth);
        const drawingHeight = Math.round(image.height * canvasImageProportionHeight);

        // Calculate image position (centered in larger canvas)
        const imageX = Math.round((drawingWidth - image.width) / 2);
        const imageY = Math.round((drawingHeight - image.height) / 2);

        // Set up both canvases with same dimensions
        currentMainCanvas.width = drawingWidth;
        currentMainCanvas.height = drawingHeight;
        currentDrawingCanvas.width = drawingWidth;
        currentDrawingCanvas.height = drawingHeight;

        // EXPLICITLY clear both canvases completely
        currentMainCtx.clearRect(0, 0, drawingWidth, drawingHeight);
        currentDrawingCtx.clearRect(0, 0, drawingWidth, drawingHeight);

        // Set line styles
        [currentMainCtx, currentDrawingCtx].forEach(ctx => {
          ctx.lineWidth = drawingMode.thickness || 5;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.globalCompositeOperation = "source-over";
        });

        // Draw image on main canvas
        currentMainCtx.drawImage(image, imageX, imageY);

        // Update state
        setBackgroundImage(image);
        setCanvasDimensions({ width: drawingWidth, height: drawingHeight });
        setImagePosition({ x: imageX, y: imageY, width: image.width, height: image.height });

        // Clear and reset history for new image
        setHistory([]);
        setHistoryIndex(-1);
        setHasUserDrawings(false);

        // Save initial state to history
        requestAnimationFrame(() => {
          saveCanvasState();
        });
      };

      image.onerror = (error) => {
        console.error("Error loading image:", urlWithCacheBuster, error);
        setImageError("Failed to load image. Please try another one.");

        // Create a blank canvas with default dimensions
        const currentContexts = getContexts();
        if (currentContexts) {
          const { mainCtx: currentMainCtx, drawingCtx: currentDrawingCtx, mainCanvas: currentMainCanvas, drawingCanvas: currentDrawingCanvas } = currentContexts;

          const drawingWidth = Math.round(defaultWidth * canvasImageProportionWidth);
          const drawingHeight = Math.round(defaultHeight * canvasImageProportionHeight);

          currentMainCanvas.width = drawingWidth;
          currentMainCanvas.height = drawingHeight;
          currentDrawingCanvas.width = drawingWidth;
          currentDrawingCanvas.height = drawingHeight;

          // EXPLICITLY clear both canvases
          currentMainCtx.clearRect(0, 0, drawingWidth, drawingHeight);
          currentDrawingCtx.clearRect(0, 0, drawingWidth, drawingHeight);

          currentMainCtx.fillStyle = "#f0f0f0";
          currentMainCtx.fillRect(0, 0, drawingWidth, drawingHeight);
          currentMainCtx.fillStyle = "#666";
          currentMainCtx.font = "16px sans-serif";
          currentMainCtx.fillText("Image could not be loaded", 20, 30);

          setCanvasDimensions({ width: drawingWidth, height: drawingHeight });
          setBackgroundImage(null);
          setHasUserDrawings(false);

          // Clear and reset history
          setHistory([]);
          setHistoryIndex(-1);

          // Save initial state to history
          requestAnimationFrame(() => {
            saveCanvasState();
          });
        }
      };

      // Use the URL with cache buster
      image.src = urlWithCacheBuster;
    } else if (!generatingImage) {
      // Create empty canvas when no image
      console.log("Creating empty canvas");
      const drawingWidth = Math.round(defaultWidth * canvasImageProportionWidth);
      const drawingHeight = Math.round(defaultHeight * canvasImageProportionHeight);

      mainCanvas.width = drawingWidth;
      mainCanvas.height = drawingHeight;
      drawingCanvas.width = drawingWidth;
      drawingCanvas.height = drawingHeight;

      // EXPLICITLY clear both canvases completely
      mainCtx.clearRect(0, 0, drawingWidth, drawingHeight);
      drawingCtx.clearRect(0, 0, drawingWidth, drawingHeight);

      mainCtx.fillStyle = "#f0f0f0";
      mainCtx.fillRect(0, 0, drawingWidth, drawingHeight);

      // Set line styles
      [mainCtx, drawingCtx].forEach(ctx => {
        ctx.lineWidth = drawingMode.thickness || 5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalCompositeOperation = "source-over";
      });

      setCanvasDimensions({ width: drawingWidth, height: drawingHeight });
      setBackgroundImage(null);

      // Clear and reset history
      setHistory([]);
      setHistoryIndex(-1);
      setHasUserDrawings(false);

      // Save initial state to history
      requestAnimationFrame(() => {
        saveCanvasState();
      });
    }
  };

  // Initialize canvas when component mounts or when imageUrl changes
  useEffect(() => {
    console.log("Main initialization useEffect", { imageUrl, generatingImage });
    initializeCanvas(imageUrl);
  }, [imageUrl, generatingImage]);

  // Handle drawing mode changes
  useEffect(() => {
    const contexts = getContexts();
    if (contexts) {
      const { mainCtx, drawingCtx } = contexts;
      [mainCtx, drawingCtx].forEach(ctx => {
        ctx.lineWidth = drawingMode.thickness || 5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      });
    }
  }, [drawingMode]);

  // History management functions
  const saveCanvasState = () => {
    const contexts = getContexts();
    if (!contexts) return;

    const { drawingCtx } = contexts;
    const imageData = drawingCtx.getImageData(0, 0, canvasDimensions.width, canvasDimensions.height);

    // Remove any history after current index (when we make a new action after undoing)
    const newHistory = [...history.slice(0, historyIndex + 1), imageData];

    // Limit history to prevent memory issues (keep last 50 states)
    if (newHistory.length > 50) {
      newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } else {
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const contexts = getContexts();
      if (!contexts) return;

      const { drawingCtx } = contexts;
      const newIndex = historyIndex - 1;
      const imageData = history[newIndex];

      // Restore the canvas state
      drawingCtx.putImageData(imageData, 0, 0);
      setHistoryIndex(newIndex);

      // Check if we're back to the initial state (no drawings)
      // Index 0 is always the clean initial state
      setHasUserDrawings(newIndex > 0);

      // Redraw the main canvas
      redrawCanvas();
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const contexts = getContexts();
      if (!contexts) return;

      const { drawingCtx } = contexts;
      const newIndex = historyIndex + 1;
      const imageData = history[newIndex];

      // Restore the canvas state
      drawingCtx.putImageData(imageData, 0, 0);
      setHistoryIndex(newIndex);

      // Update hasUserDrawings based on whether we're at the initial state
      setHasUserDrawings(newIndex > 0);

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
    if (drawingMode.mode === "none") return;

    const contexts = getContexts();
    if (!contexts) return;

    const { mainCtx, drawingCtx, mainCanvas } = contexts;

    const rect = mainCanvas.getBoundingClientRect();
    const scaleX = mainCanvas.width / rect.width;
    const scaleY = mainCanvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Set up drawing styles
    if (drawingMode.mode === "erase") {
      // For erasing, only set up the drawing-only canvas to erase
      drawingCtx.beginPath();
      drawingCtx.moveTo(x, y);
      drawingCtx.lineWidth = drawingMode.thickness || 15;
      drawingCtx.lineCap = "round";
      drawingCtx.lineJoin = "round";
      drawingCtx.globalCompositeOperation = "destination-out";
    } else {
      // For normal drawing, set up both contexts
      [mainCtx, drawingCtx].forEach(ctx => {
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
    // Mark that user has started drawing
    setHasUserDrawings(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || drawingMode.mode === "none") return;

    const contexts = getContexts();
    if (!contexts) return;

    const { mainCtx, drawingCtx, mainCanvas } = contexts;

    const rect = mainCanvas.getBoundingClientRect();
    const scaleX = mainCanvas.width / rect.width;
    const scaleY = mainCanvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Draw on the drawing-only canvas first
    drawingCtx.lineTo(x, y);
    drawingCtx.stroke();

    // For erase mode, we need to redraw the entire main canvas to show the background through erased areas
    if (drawingMode.mode === "erase") {
      redrawCanvas();
    } else {
      // For normal drawing, just draw directly on the main canvas
      mainCtx.lineTo(x, y);
      mainCtx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);

      const contexts = getContexts();
      if (contexts) {
        const { drawingCtx } = contexts;
        // Reset composite operation back to normal
        drawingCtx.globalCompositeOperation = "source-over";

        // If we were erasing, do a final redraw to ensure everything is properly displayed
        if (drawingMode.mode === "erase") {
          redrawCanvas();
        }

        // Save the state AFTER completing the drawing action
        // This ensures undo will remove this complete drawing action
        requestAnimationFrame(() => {
          saveCanvasState();
        });
      }
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
        return "crosshair";
      default:
        return "default";
    }
  };

  // Helper function to generate dataURL with ONLY the drawings (no background)
  const onGenerateStory = () => {
    const contexts = getContexts();
    if (contexts) {
      const { drawingCanvas } = contexts;
      // This will only contain the user's drawings on a transparent background
      const dataUrl = drawingCanvas.toDataURL();
      const hasBackgroundImage = !!backgroundImage;
      onImageEdit(dataUrl, hasUserDrawings, hasBackgroundImage);
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    onGenerateStory,
    hasUserDrawings,
    hasBackgroundImage: !!backgroundImage,
    clearAllDrawings
  }));

  return (
    <div className={`flex flex-col h-full ${className} relative`}>
      {/* Loading overlay for generating images */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10">
          <div className="flex items-center">
            <LoadingSpinner size="lg" className="text-white" />
            <span className="ml-3 text-white">Generating image...</span>
          </div>
        </div>
      )}

      {/* Adjusting overlay */}
      {adjusting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10">
          <div className="flex items-center">
            <LoadingSpinner size="lg" className="text-white" />
            <span className="ml-3 text-white">Updating story...</span>
          </div>
        </div>
      )}

      {/* Canvas container */}
      <div className="flex-1 min-h-0 overflow-auto p-0">
        <div 
          className="relative"
          style={{
            // Calculate the visual size needed after scaling, plus padding for comfortable scrolling
            width: mainCanvasRef.current ? `${mainCanvasRef.current.width * zoom + 200}px` : 'auto',
            height: mainCanvasRef.current ? `${mainCanvasRef.current.height * zoom + 200}px` : 'auto',
            // Ensure minimum size for small images/low zoom
            minWidth: '100%',
            minHeight: '100%'
          }}
        >
          {/* Center the canvas within the padded container */}
          <div 
            className="absolute flex items-center justify-center"
            style={{
              top: '100px', // Half of the padding
              left: '100px', // Half of the padding  
              right: '100px',
              bottom: '100px'
            }}
          >
            <div className="relative inline-block">
              <canvas
                ref={mainCanvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{
                  cursor: getCursor(),
                  border: "1px solid #ddd",
                  display: "block",
                  transform: `scale(${zoom})`,
                  transformOrigin: "center"
                }}
              />
                           
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
            </div>
          </div>
        </div>
      </div>

      {/* Drawing Tools - sticky at bottom */}
      <div className="sticky bottom-0 bg-white border-t shadow-lg z-30">
        <DrawingTools
          currentMode={drawingMode}
          setMode={setDrawingMode}
          onAdjustStory={() => {
            const contexts = getContexts();
            if (contexts) {
              const { drawingCanvas } = contexts;
              // This sends ONLY the drawings, not the background image
              const dataUrl = drawingCanvas.toDataURL();
              const hasBackgroundImage = !!backgroundImage;
              onImageEdit(dataUrl, hasUserDrawings, hasBackgroundImage);
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
    </div>
  );
});

ImageCanvas.displayName = "ImageCanvas";

export default ImageCanvas;