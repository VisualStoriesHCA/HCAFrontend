import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Palette, Eraser } from "lucide-react";

interface ColorPickerProps {
  currentColor: string;
  currentMode: "none" | "draw" | "erase";
  onColorChange: (color: string) => void;
  onModeChange: (mode: "draw" | "erase") => void;
  disabled?: boolean;
}

const ColorPicker = ({ 
  currentColor, 
  currentMode, 
  onColorChange, 
  onModeChange, 
  disabled = false 
}: ColorPickerProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hexInput, setHexInput] = useState(currentColor);
  const [brightness, setBrightness] = useState(1);
  const [baseHsv, setBaseHsv] = useState({ h: 0, s: 1, v: 1 }); // Track base HSV for brightness adjustments
  const colorWheelRef = useRef<HTMLCanvasElement>(null);
  const isInternalUpdate = useRef(false); // Track internal vs external color updates
  const [colorWheelSize] = useState(150);

  // Update hex input when currentColor changes
  useEffect(() => {
    setHexInput(currentColor);
  }, [currentColor]);

  // 10 basic colors for quick selection
  const basicColors = [
    "#000000", // Black
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#FFA500", // Orange
    "#800080", // Purple
    "#FFFFFF", // White
  ];

  // Convert RGB hex to HSV
  const hexToHsv = useCallback((hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    let s = max === 0 ? 0 : diff / max;
    let v = max;

    if (diff !== 0) {
      if (max === r) {
        h = ((g - b) / diff) % 6;
      } else if (max === g) {
        h = (b - r) / diff + 2;
      } else {
        h = (r - g) / diff + 4;
      }
      h *= 60;
      if (h < 0) h += 360;
    }

    return { h, s, v };
  }, []);

  // Convert HSV to RGB
  const hsvToRgb = useCallback((h: number, s: number, v: number) => {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }
    
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  }, []);

  // Convert HSV to hex
  const hsvToHex = useCallback((h: number, s: number, v: number) => {
    const [r, g, b] = hsvToRgb(h, s, v);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }, [hsvToRgb]);

  // Update base HSV when currentColor changes (but not when we're applying brightness changes)
  useEffect(() => {
    if (!isInternalUpdate.current) {
      const hsv = hexToHsv(currentColor);
      setBaseHsv(hsv);
      setBrightness(hsv.v);
    }
    isInternalUpdate.current = false; // Reset flag
  }, [currentColor, hexToHsv]);

  // Apply brightness changes to current color
  useEffect(() => {
    if (currentMode === "draw") {
      const newColor = hsvToHex(baseHsv.h, baseHsv.s, brightness);
      if (newColor !== currentColor) {
        isInternalUpdate.current = true; // Mark as internal update
        onColorChange(newColor);
      }
    }
  }, [brightness, baseHsv.h, baseHsv.s, currentMode, hsvToHex, onColorChange, currentColor]);

  // Draw color wheel using the current brightness value
  const drawColorWheel = useCallback(() => {
    const canvas = colorWheelRef.current;
    if (!canvas) {
      console.log('Canvas not available');
      return;
    }
    
    if (canvas.width !== colorWheelSize || canvas.height !== colorWheelSize) {
      canvas.width = colorWheelSize;
      canvas.height = colorWheelSize;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Canvas context not available');
      return;
    }

    console.log('Drawing color wheel...', { width: canvas.width, height: canvas.height, brightness });
    
    ctx.clearRect(0, 0, colorWheelSize, colorWheelSize);
    
    const centerX = colorWheelSize / 2;
    const centerY = colorWheelSize / 2;
    const radius = Math.min(centerX, centerY) - 5;
    
    try {
      const imageData = ctx.createImageData(colorWheelSize, colorWheelSize);
      const data = imageData.data;
      
      for (let y = 0; y < colorWheelSize; y++) {
        for (let x = 0; x < colorWheelSize; x++) {
          const dx = x - centerX;
          const dy = y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const index = (y * colorWheelSize + x) * 4;
          
          if (distance <= radius) {
            let hue = Math.atan2(dy, dx) * 180 / Math.PI;
            if (hue < 0) hue += 360;
            
            const saturation = Math.min(distance / radius, 1);
            const [r, g, b] = hsvToRgb(hue, saturation, brightness);
            
            data[index] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = 255;
          } else {
            data[index] = 255;
            data[index + 1] = 255;
            data[index + 2] = 255;
            data[index + 3] = 0;
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      
    } catch (error) {
      console.error('ImageData approach failed, using fallback:', error);
      
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      const segments = 12;
      for (let i = 0; i < segments; i++) {
        const hue = (i / segments) * 360;
        const [r, g, b] = hsvToRgb(hue, 1, brightness);
        const color = `rgb(${r}, ${g}, ${b})`;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(
          centerX, 
          centerY, 
          radius, 
          (i / segments) * 2 * Math.PI,
          ((i + 1) / segments) * 2 * Math.PI
        );
        ctx.closePath();
        ctx.fill();
      }
    }
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    console.log('Color wheel drawing completed');
  }, [colorWheelSize, hsvToRgb, brightness]);

  // Handle color wheel click
  const handleColorWheelClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = colorWheelRef.current;
    if (!canvas || disabled) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = colorWheelSize / 2;
    const centerY = colorWheelSize / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.min(centerX, centerY) - 2;
    
    if (distance <= radius) {
      let hue = Math.atan2(dy, dx) * 180 / Math.PI;
      if (hue < 0) hue += 360;
      
      const saturation = Math.min(distance / radius, 1);
      const [red, green, blue] = hsvToRgb(hue, saturation, brightness);
      const hex = `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
      
      console.log('Color wheel clicked - new color:', hex);
      
      // Handle mode change first if needed, then color change
      if (currentMode !== "draw") {
        onModeChange("draw");
      }
      
      // Update base HSV to the new color selection
      setBaseHsv({ h: hue, s: saturation, v: brightness });
      isInternalUpdate.current = true; // Mark as internal update
      onColorChange(hex);
    }
  }, [colorWheelSize, hsvToRgb, onColorChange, onModeChange, disabled, currentMode, brightness]);

  // Initialize color wheel with proper timing
  useEffect(() => {
    const timer = setTimeout(() => {
      const canvas = colorWheelRef.current;
      if (canvas) {
        canvas.width = colorWheelSize;
        canvas.height = colorWheelSize;
        console.log('Canvas initialized:', { width: canvas.width, height: canvas.height });
        drawColorWheel();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [drawColorWheel, colorWheelSize]);

  useEffect(() => {
    if (showAdvanced) {
      const timer = setTimeout(() => {
        const canvas = colorWheelRef.current;
        if (canvas) {
          canvas.width = colorWheelSize;
          canvas.height = colorWheelSize;
          drawColorWheel();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [showAdvanced, drawColorWheel, colorWheelSize]);

  useEffect(() => {
    if (showAdvanced) {
      drawColorWheel();
    }
  }, [brightness, drawColorWheel, showAdvanced]);

  // Handle color selection properly to avoid race condition
  const handleColorSelect = (color: string) => {
    console.log('Basic color selected:', color);
    
    // If mode needs to change, change it first, then change color
    if (currentMode !== "draw") {
      onModeChange("draw");
    }
    
    // Update base HSV to the new color selection
    const hsv = hexToHsv(color);
    setBaseHsv(hsv);
    setBrightness(hsv.v);
    isInternalUpdate.current = true; // Mark as internal update
    onColorChange(color);
  };

  const handleEraserSelect = () => {
    console.log('Eraser selected');
    onModeChange("erase");
  };

  const handleHexSubmit = () => {
    const hex = hexInput.trim();
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      console.log('Hex color applied:', hex);
      
      // Handle mode change first if needed, then color change
      if (currentMode !== "draw") {
        onModeChange("draw");
      }
      
      // Update base HSV to the new color selection
      const hsv = hexToHsv(hex);
      setBaseHsv(hsv);
      setBrightness(hsv.v);
      isInternalUpdate.current = true; // Mark as internal update
      onColorChange(hex);
      setShowAdvanced(false);
    } else {
      alert('Please enter a valid hex color (e.g., #FF0000)');
    }
  };

  const handleHexKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleHexSubmit();
    }
  };

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setBrightness(value);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Debug info */}
      <div className="text-xs text-gray-500">
        Current: {currentColor} | Mode: {currentMode} | HSV: {Math.round(baseHsv.h)}°, {Math.round(baseHsv.s * 100)}%, {Math.round(brightness * 100)}%
      </div>
      
      {/* Basic Colors Row with Eraser */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-gray-600 mr-2">Tools:</span>
        
        {/* Eraser button */}
        <button
          type="button"
          className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-all ${
            currentMode === "erase" 
              ? "border-gray-800 bg-gray-100 scale-110" 
              : "border-gray-300 hover:border-gray-500 bg-white"
          }`}
          onClick={handleEraserSelect}
          disabled={disabled}
          title="Eraser"
        >
          <Eraser className="h-4 w-4 text-gray-600" />
        </button>
        
        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        {/* Basic color swatches */}
        {basicColors.map((color) => (
          <button
            key={color}
            type="button"
            className={`w-6 h-6 rounded border-2 transition-all ${
              currentMode === "draw" && currentColor === color 
                ? "border-gray-800 scale-110 shadow-md" 
                : "border-gray-300 hover:border-gray-500"
            }`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorSelect(color)}
            disabled={disabled}
            title={`${color} ${currentMode === "draw" && currentColor === color ? '(selected)' : ''}`}
          />
        ))}
        
        {/* Advanced color picker toggle */}
        <Button
          type="button"
          size="sm"
          variant={showAdvanced ? "default" : "outline"}
          onClick={() => setShowAdvanced(!showAdvanced)}
          disabled={disabled}
          className="h-6 w-6 p-0 ml-1"
          title="Advanced color picker"
        >
          <Palette className="h-3 w-3" />
        </Button>
      </div>

      {/* Advanced Color Picker */}
      {showAdvanced && (
        <div className="flex items-start gap-4 p-3 bg-gray-100 rounded border">
          {/* Color Wheel */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Color Wheel</span>
            <canvas
              ref={colorWheelRef}
              width={colorWheelSize}
              height={colorWheelSize}
              onClick={handleColorWheelClick}
              className="cursor-crosshair border rounded shadow-sm bg-gray-100"
              style={{ width: `${colorWheelSize}px`, height: `${colorWheelSize}px` }}
            />
          </div>
          
          {/* Hex Input and Brightness */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Hex Code</span>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                onKeyPress={handleHexKeyPress}
                placeholder="#000000"
                className="w-24 h-8 text-xs font-mono"
                maxLength={7}
              />
              <Button
                type="button"
                size="sm"
                onClick={handleHexSubmit}
                className="h-8 px-3 text-xs"
              >
                Apply
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Current:</span>
              <div
                className="w-8 h-8 rounded border-2 border-gray-300"
                style={{ backgroundColor: currentColor }}
                title={`Current: ${currentColor}`}
              />
            </div>
            
            {/* Brightness Slider */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-xs font-medium text-gray-600">Brightness</span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={brightness}
                onChange={handleBrightnessChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #000000 0%, ${hsvToHex(baseHsv.h, baseHsv.s, 1)} 100%)`
                }}
              />
              <span className="text-xs text-gray-500">{Math.round(brightness * 100)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;