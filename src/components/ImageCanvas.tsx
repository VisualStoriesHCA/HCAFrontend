import { useRef, useState, useEffect, forwardRef, useImperativeHandle, useReducer, useCallback } from "react";
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

// Canvas state management with reducer
interface CanvasState {
  dimensions: { width: number; height: number };
  imagePosition: { x: number; y: number; width: number; height: number };
  backgroundImage: HTMLImageElement | null;
  hasUserDrawings: boolean;
  history: ImageData[];
  historyIndex: number;
  zoom: number;
  baseZoom: number; // The zoom level that fits the image to screen
  panOffset: { x: number; y: number };
  imageError: string | null;
  containerSize: { width: number; height: number };
}

type CanvasAction =
  | { type: 'SET_DIMENSIONS'; payload: { width: number; height: number } }
  | { type: 'SET_IMAGE_POSITION'; payload: { x: number; y: number; width: number; height: number } }
  | { type: 'SET_BACKGROUND_IMAGE'; payload: HTMLImageElement | null }
  | { type: 'SET_USER_DRAWINGS'; payload: boolean }
  | { type: 'SET_HISTORY'; payload: { history: ImageData[]; index: number } }
  | { type: 'ADD_TO_HISTORY'; payload: ImageData }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_BASE_ZOOM'; payload: number }
  | { type: 'SET_PAN_OFFSET'; payload: { x: number; y: number } }
  | { type: 'SET_IMAGE_ERROR'; payload: string | null }
  | { type: 'SET_CONTAINER_SIZE'; payload: { width: number; height: number } }
  | { type: 'RESET_STATE' };

const initialCanvasState: CanvasState = {
  dimensions: { width: 600, height: 400 },
  imagePosition: { x: 0, y: 0, width: 0, height: 0 },
  backgroundImage: null,
  hasUserDrawings: false,
  history: [],
  historyIndex: -1,
  zoom: 1,
  baseZoom: 1,
  panOffset: { x: 0, y: 0 },
  imageError: null,
  containerSize: { width: 800, height: 600 },
};

function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case 'SET_DIMENSIONS':
      return { ...state, dimensions: action.payload };
    case 'SET_IMAGE_POSITION':
      return { ...state, imagePosition: action.payload };
    case 'SET_BACKGROUND_IMAGE':
      return { ...state, backgroundImage: action.payload };
    case 'SET_USER_DRAWINGS':
      return { ...state, hasUserDrawings: action.payload };
    case 'SET_HISTORY':
      return { 
        ...state, 
        history: action.payload.history, 
        historyIndex: action.payload.index 
      };
    case 'ADD_TO_HISTORY':
      const newHistory = [...state.history.slice(0, state.historyIndex + 1), action.payload];
      const limitedHistory = newHistory.length > 50 ? newHistory.slice(-50) : newHistory;
      return {
        ...state,
        history: limitedHistory,
        historyIndex: limitedHistory.length - 1,
      };
    case 'UNDO':
      if (state.historyIndex > 0) {
        return {
          ...state,
          historyIndex: state.historyIndex - 1,
          hasUserDrawings: state.historyIndex - 1 > 0
        };
      }
      return state;
    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state,
          historyIndex: state.historyIndex + 1,
          hasUserDrawings: state.historyIndex + 1 > 0
        };
      }
      return state;
    case 'CLEAR_HISTORY':
      return { ...state, history: [], historyIndex: -1, hasUserDrawings: false };
    case 'SET_ZOOM':
      return { ...state, zoom: action.payload };
    case 'SET_BASE_ZOOM':
      return { ...state, baseZoom: action.payload };
    case 'SET_PAN_OFFSET':
      return { ...state, panOffset: action.payload };
    case 'SET_CONTAINER_SIZE':
      return { ...state, containerSize: action.payload };
    case 'SET_IMAGE_ERROR':
      return { ...state, imageError: action.payload };
    case 'RESET_STATE':
      return { ...initialCanvasState };
    default:
      return state;
  }
}

// Custom hook for canvas operations
function useCanvasOperations(canvasRef: React.RefObject<HTMLCanvasElement>, state: CanvasState) {
  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    return { canvas, ctx };
  }, [canvasRef]);

  const clearCanvas = useCallback(() => {
    const contexts = getContext();
    if (!contexts) return;
    
    const { ctx } = contexts;
    ctx.clearRect(0, 0, state.dimensions.width, state.dimensions.height);
  }, [getContext, state.dimensions]);

  const redrawCanvas = useCallback(() => {
    const contexts = getContext();
    if (!contexts) return;
    
    const { ctx } = contexts;
    
    // Clear canvas
    clearCanvas();
    
    // Draw background
    if (state.backgroundImage) {
      ctx.drawImage(
        state.backgroundImage, 
        state.imagePosition.x, 
        state.imagePosition.y,
        state.imagePosition.width,
        state.imagePosition.height
      );
    } else {
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, state.dimensions.width, state.dimensions.height);
    }
  }, [getContext, clearCanvas, state.backgroundImage, state.imagePosition, state.dimensions]);

  return {
    getContext,
    clearCanvas,
    redrawCanvas,
  };
}

// Custom hook for drawing operations
function useDrawing(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  state: CanvasState,
  dispatch: React.Dispatch<CanvasAction>,
  drawingMode: DrawingMode
) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{x: number, y: number} | null>(null);
  const { getContext, redrawCanvas } = useCanvasOperations(canvasRef, state);

  const saveToHistory = useCallback(() => {
    const contexts = getContext();
    if (!contexts) return;
    
    const { ctx } = contexts;
    const imageData = ctx.getImageData(0, 0, state.dimensions.width, state.dimensions.height);
    dispatch({ type: 'ADD_TO_HISTORY', payload: imageData });
  }, [getContext, state.dimensions, dispatch]);

  // Create a function to get background-only canvas data for erasing
  const getBackgroundImageData = useCallback(() => {
    const contexts = getContext();
    if (!contexts) return null;
    
    const { canvas, ctx } = contexts;
    
    // Create a temporary canvas to draw just the background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) return null;
    
    // Draw background
    if (state.backgroundImage) {
      tempCtx.drawImage(
        state.backgroundImage, 
        state.imagePosition.x, 
        state.imagePosition.y,
        state.imagePosition.width,
        state.imagePosition.height
      );
    } else {
      tempCtx.fillStyle = "#f0f0f0";
      tempCtx.fillRect(0, 0, state.dimensions.width, state.dimensions.height);
    }
    
    return tempCtx.getImageData(0, 0, canvas.width, canvas.height);
  }, [getContext, state.backgroundImage, state.imagePosition, state.dimensions]);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawingMode.mode === "none") return;

    const contexts = getContext();
    if (!contexts) return;

    const { canvas, ctx } = contexts;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setLastPoint({ x, y });

    // Setup drawing context
    ctx.lineWidth = drawingMode.thickness || 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (drawingMode.mode === "erase") {
      // For eraser, we'll handle it differently in the draw function
      ctx.globalCompositeOperation = "source-over";
    } else {
      ctx.globalCompositeOperation = "source-over";
      // CRITICAL FIX: Set the stroke color here
      ctx.strokeStyle = drawingMode.color || "#000000";
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      console.log('Starting to draw with color:', drawingMode.color || "#000000");
    }

    setIsDrawing(true);
    dispatch({ type: 'SET_USER_DRAWINGS', payload: true });
  }, [drawingMode, getContext, dispatch]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || drawingMode.mode === "none" || !lastPoint) return;

    const contexts = getContext();
    if (!contexts) return;

    const { canvas, ctx } = contexts;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (drawingMode.mode === "erase") {
      // For erasing, we restore background pixels along the path
      const backgroundImageData = getBackgroundImageData();
      if (backgroundImageData) {
        const thickness = drawingMode.thickness || 15;
        const radius = thickness / 2;
        
        // Draw a line between last point and current point
        const dx = x - lastPoint.x;
        const dy = y - lastPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(1, Math.floor(distance));
        
        for (let i = 0; i <= steps; i++) {
          const t = steps > 0 ? i / steps : 0;
          const px = lastPoint.x + dx * t;
          const py = lastPoint.y + dy * t;
          
          // Copy background pixels in a circle around this point
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              if (dx * dx + dy * dy <= radius * radius) {
                const srcX = Math.round(px + dx);
                const srcY = Math.round(py + dy);
                
                if (srcX >= 0 && srcX < canvas.width && srcY >= 0 && srcY < canvas.height) {
                  const srcIndex = (srcY * canvas.width + srcX) * 4;
                  const imageData = ctx.getImageData(srcX, srcY, 1, 1);
                  imageData.data[0] = backgroundImageData.data[srcIndex];     // R
                  imageData.data[1] = backgroundImageData.data[srcIndex + 1]; // G
                  imageData.data[2] = backgroundImageData.data[srcIndex + 2]; // B
                  imageData.data[3] = backgroundImageData.data[srcIndex + 3]; // A
                  ctx.putImageData(imageData, srcX, srcY);
                }
              }
            }
          }
        }
      }
    } else {
      // Normal drawing
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    setLastPoint({ x, y });
  }, [isDrawing, drawingMode, getContext, lastPoint, getBackgroundImageData]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    const contexts = getContext();
    if (contexts) {
      const { ctx } = contexts;
      // Always reset to source-over after any drawing operation
      ctx.globalCompositeOperation = "source-over";
    }

    setIsDrawing(false);
    setLastPoint(null);
    
    // Save to history after drawing is complete
    setTimeout(() => saveToHistory(), 0);
  }, [isDrawing, getContext, saveToHistory]);

  return {
    isDrawing,
    startDrawing,
    draw,
    stopDrawing,
    saveToHistory,
  };
}

// Custom hook for image loading with proper fitting
function useImageLoader(
  dispatch: React.Dispatch<CanvasAction>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  state: CanvasState
) {
  const loadImage = useCallback((imageUrl: string | null) => {
    dispatch({ type: 'SET_IMAGE_ERROR', payload: null });

    if (!imageUrl) {
      // Create empty canvas
      const defaultWidth = Math.min(800, state.containerSize.width - 100);
      const defaultHeight = Math.min(600, state.containerSize.height - 200);

      dispatch({ type: 'SET_DIMENSIONS', payload: { width: defaultWidth, height: defaultHeight } });
      dispatch({ type: 'SET_BACKGROUND_IMAGE', payload: null });
      dispatch({ type: 'SET_BASE_ZOOM', payload: 1 });
      dispatch({ type: 'SET_ZOOM', payload: 1 });
      dispatch({ type: 'CLEAR_HISTORY' });

      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      // Calculate how to fit the image to the available container size
      const availableWidth = state.containerSize.width - 100; // Account for padding
      const availableHeight = state.containerSize.height - 200; // Account for tools and padding
      
      // Calculate scale to fit image within available space
      const scaleX = availableWidth / image.width;
      const scaleY = availableHeight / image.height;
      const fitScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond original size
      
      // Calculate fitted dimensions
      const fittedWidth = image.width * fitScale;
      const fittedHeight = image.height * fitScale;
      
      // Canvas size is larger to allow for drawing around the image
      const canvasWidth = Math.max(fittedWidth * 1.5, fittedWidth + 200);
      const canvasHeight = Math.max(fittedHeight * 1.5, fittedHeight + 200);
      
      // Center the image on the canvas
      const imageX = (canvasWidth - fittedWidth) / 2;
      const imageY = (canvasHeight - fittedHeight) / 2;

      // Update canvas dimensions
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
      }

      dispatch({ type: 'SET_DIMENSIONS', payload: { width: canvasWidth, height: canvasHeight } });
      dispatch({ type: 'SET_IMAGE_POSITION', payload: { 
        x: imageX, 
        y: imageY, 
        width: fittedWidth, 
        height: fittedHeight 
      } });
      dispatch({ type: 'SET_BACKGROUND_IMAGE', payload: image });
      dispatch({ type: 'SET_BASE_ZOOM', payload: fitScale });
      dispatch({ type: 'SET_ZOOM', payload: 1 }); // 1 = 100% of fitted size
      dispatch({ type: 'SET_PAN_OFFSET', payload: { x: 0, y: 0 } });
      dispatch({ type: 'CLEAR_HISTORY' });
    };

    image.onerror = () => {
      dispatch({ type: 'SET_IMAGE_ERROR', payload: "Failed to load image. Please try another one." });
      
      // Fallback to empty canvas
      const defaultWidth = Math.min(800, state.containerSize.width - 100);
      const defaultHeight = Math.min(600, state.containerSize.height - 200);

      dispatch({ type: 'SET_DIMENSIONS', payload: { width: defaultWidth, height: defaultHeight } });
      dispatch({ type: 'SET_BACKGROUND_IMAGE', payload: null });
      dispatch({ type: 'SET_BASE_ZOOM', payload: 1 });
      dispatch({ type: 'SET_ZOOM', payload: 1 });
      dispatch({ type: 'CLEAR_HISTORY' });
    };

    // Add cache busting
    const cacheBuster = new Date().getTime();
    const urlWithCacheBuster = imageUrl.includes('?')
      ? `${imageUrl}&_t=${cacheBuster}`
      : `${imageUrl}?_t=${cacheBuster}`;

    image.src = urlWithCacheBuster;
  }, [dispatch, canvasRef, state.containerSize]);

  return { loadImage };
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(canvasReducer, initialCanvasState);
  
  const { redrawCanvas } = useCanvasOperations(canvasRef, state);
  const { loadImage } = useImageLoader(dispatch, canvasRef, state);
  const { startDrawing, draw, stopDrawing, saveToHistory } = useDrawing(
    canvasRef, 
    state, 
    dispatch, 
    drawingMode
  );

  // Monitor container size changes
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        dispatch({ 
          type: 'SET_CONTAINER_SIZE', 
          payload: { width: width || 800, height: height || 600 } 
        });
      }
    };

    updateContainerSize();
    
    const resizeObserver = new ResizeObserver(updateContainerSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Initialize canvas when image URL changes
  useEffect(() => {
    if (!generatingImage) {
      loadImage(imageUrl);
    }
  }, [imageUrl, generatingImage, loadImage, state.containerSize]);

  // CRITICAL FIX: Update canvas context when drawing mode changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = drawingMode.thickness || 5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        // CRITICAL FIX: Set the stroke color here
        ctx.strokeStyle = drawingMode.color || "#000000";
        
        console.log('Canvas context updated with new drawing mode:', {
          color: drawingMode.color,
          thickness: drawingMode.thickness,
          mode: drawingMode.mode
        });
      }
    }
  }, [drawingMode]);

  // Redraw canvas when background image or dimensions change
  useEffect(() => {
    redrawCanvas();
    
    // Save initial state to history if this is a fresh canvas
    if (state.history.length === 0) {
      setTimeout(() => saveToHistory(), 0);
    }
  }, [state.backgroundImage, state.dimensions, redrawCanvas, saveToHistory, state.history.length]);

  // Restore canvas state when history changes (undo/redo)
  useEffect(() => {
    if (state.history.length > 0 && state.historyIndex >= 0) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const imageData = state.history[state.historyIndex];
          ctx.putImageData(imageData, 0, 0);
        }
      }
    }
  }, [state.historyIndex]);

  // History operations
  const handleUndo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const handleRedo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  // Clear all drawings
  const clearAllDrawings = useCallback(() => {
    redrawCanvas();
    dispatch({ type: 'CLEAR_HISTORY' });
    dispatch({ type: 'SET_USER_DRAWINGS', payload: false });
    setTimeout(() => saveToHistory(), 0);
  }, [redrawCanvas, saveToHistory]);

  // Zoom controls with proper centering
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(4, state.zoom + 0.25);
    dispatch({ type: 'SET_ZOOM', payload: newZoom });
  }, [state.zoom]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(0.5, state.zoom - 0.25);
    dispatch({ type: 'SET_ZOOM', payload: newZoom });
  }, [state.zoom]);

  const handleResetZoom = useCallback(() => {
    dispatch({ type: 'SET_ZOOM', payload: 1 });
    dispatch({ type: 'SET_PAN_OFFSET', payload: { x: 0, y: 0 } });
  }, []);

  // Generate story callback
  const onGenerateStory = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      onImageEdit(dataUrl, state.hasUserDrawings, !!state.backgroundImage);
    }
  }, [onImageEdit, state.hasUserDrawings, state.backgroundImage]);

  // Cursor style
  const getCursor = () => {
    switch (drawingMode.mode) {
      case "draw":
        return "crosshair";
      case "erase":
        return "grab";
      default:
        return "default";
    }
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    onGenerateStory,
    hasUserDrawings: state.hasUserDrawings,
    hasBackgroundImage: !!state.backgroundImage,
    clearAllDrawings
  }));

  return (
    <div ref={containerRef} className={`flex flex-col h-full ${className} relative`}>
      {/* Loading overlays */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10">
          <div className="flex items-center">
            <LoadingSpinner size="lg" className="text-white" />
            <span className="ml-3 text-white">Generating image...</span>
          </div>
        </div>
      )}

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
            width: `${state.dimensions.width * state.zoom + 200}px`,
            height: `${state.dimensions.height * state.zoom + 200}px`,
            minWidth: '100%',
            minHeight: '100%'
          }}
        >
          <div 
            className="absolute flex items-center justify-center"
            style={{
              top: '100px',
              left: '100px',  
              right: '100px',
              bottom: '100px'
            }}
          >
            <div className="relative inline-block">
              <canvas
                ref={canvasRef}
                width={state.dimensions.width}
                height={state.dimensions.height}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{
                  cursor: getCursor(),
                  border: "1px solid #ddd",
                  display: "block",
                  transform: `scale(${state.zoom})`,
                  transformOrigin: "center",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                }}
              />
                           
              {state.imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-80 text-red-600 p-4 text-center">
                  {state.imageError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drawing Tools */}
      <div className="sticky bottom-0 bg-white border-t shadow-lg z-30">
        <DrawingTools
          currentMode={drawingMode}
          setMode={setDrawingMode}
          onAdjustStory={onGenerateStory}
          adjusting={adjusting}
          hasImage={true}
          showGenerateButton={false}
          zoom={state.zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={state.historyIndex > 0}
          canRedo={state.historyIndex < state.history.length - 1}
        />
      </div>
    </div>
  );
});

ImageCanvas.displayName = "ImageCanvas";

export default ImageCanvas;