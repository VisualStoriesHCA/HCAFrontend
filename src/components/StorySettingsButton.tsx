import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";

import { ImageModelResponse, DrawingStyleResponse, ColorBlindOptionResponse } from '@/lib/api';

interface StorySettingsButtonProps {
  disabled: boolean;
  imageModel: number;
  drawingStyle: number;
  colorBlindMode: number;
  regenerateImage: boolean;
  onImageModelChange: (value: number) => void;
  onDrawingStyleChange: (value: number) => void;
  onColorBlindModeChange: (value: number) => void;
  onRegenerateImageChange: (value: boolean) => void;
  availableImageModels: ImageModelResponse[];
  availableDrawingStyles: DrawingStyleResponse[];
  colorBlindOptions: ColorBlindOptionResponse[];
}

export default function StorySettingsButton({
  disabled,
  imageModel,
  drawingStyle,
  colorBlindMode,
  regenerateImage,
  onImageModelChange,
  onDrawingStyleChange,
  onColorBlindModeChange,
  onRegenerateImageChange,
  availableImageModels,
  availableDrawingStyles,
  colorBlindOptions,
}: StorySettingsButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          size="sm"
          className="h-8"
        >
          <Settings className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        
        <div className="p-2 space-y-3">
          {/* Image Model Selection */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Image Model</label>
            <Select
              value={imageModel.toString()}
              onValueChange={(value) => onImageModelChange(parseInt(value))}
            >
              <SelectTrigger className="text-left">
                <SelectValue className="text-left truncate-none">
                  {availableImageModels.find(model => model.imageModelId === imageModel)?.name || "Select Model"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableImageModels.map((model) => (
                  <SelectItem 
                    key={model.imageModelId} 
                    value={model.imageModelId.toString()}
                    disabled={model.disabled}
                    className={model.disabled ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    <div>
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {model.description}
                        {model.disabled && " (Currently unavailable)"}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Drawing Style Selection */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Drawing Style</label>
            <Select
              value={drawingStyle.toString()}
              onValueChange={(value) => onDrawingStyleChange(parseInt(value))}
            >
              <SelectTrigger className="text-left">
                <SelectValue className="text-left truncate-none">
                  {availableDrawingStyles.find(style => style.drawingStyleId === drawingStyle)?.name || "Select Style"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableDrawingStyles.map((style) => (
                  <SelectItem 
                    key={style.drawingStyleId} 
                    value={style.drawingStyleId.toString()}
                    disabled={style.disabled}
                    className={style.disabled ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    <div>
                      <div className="font-medium">{style.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {style.description}
                        {style.disabled && " (Currently unavailable)"}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color Blind Mode Selection */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Color Accessibility</label>
            <Select
              value={colorBlindMode.toString()}
              onValueChange={(value) => onColorBlindModeChange(parseInt(value))}
            >
              <SelectTrigger className="text-left">
                <SelectValue className="text-left truncate-none">
                  {colorBlindOptions.find(option => option.colorBlindOptionId === colorBlindMode)?.name || "Select Option"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {colorBlindOptions.map((option) => (
                  <SelectItem key={option.colorBlindOptionId} value={option.colorBlindOptionId.toString()}>
                    <div>
                      <div className="font-medium">{option.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Regenerate Image Toggle */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Regenerate Image</label>
                <div className="text-xs text-muted-foreground">
                  Always create new images (If disbaled the user's sketch will remain unchanged)
                </div>
              </div>
              <Switch
                checked={regenerateImage}
                onCheckedChange={onRegenerateImageChange}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}