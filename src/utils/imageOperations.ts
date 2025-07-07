import { 
    NoChangeOperation, 
    SketchFromScratchOperation, 
    SketchOnImageOperation 
} from '@/lib/api';

export function determineImageOperation(
    hasUserDrawings: boolean, 
    hasBackgroundImage: boolean, 
    imageDataUrl: string, 
    imageId?: string
) {
    if (!hasUserDrawings && hasBackgroundImage) {
        return {
            type: NoChangeOperation.type.NOCHANGE,
            imageId: imageId || "1"
        };
    }
    
    if (hasUserDrawings && !hasBackgroundImage) {
        return {
            type: SketchFromScratchOperation.type.SKETCH_FROM_SCRATCH,
            canvasData: imageDataUrl
        };
    }
    
    if (hasUserDrawings && hasBackgroundImage) {
        return {
            type: SketchOnImageOperation.type.SKETCH_ON_IMAGE,
            imageId: imageId || "1",
            canvasData: imageDataUrl
        };
    }
    
    throw new Error("Invalid state: no drawings and no background image");
}

export function validateImageFile(file: File): string | null {
    if (!file.type.startsWith('image/')) {
        return "Please upload an image file";
    }

    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!supportedFormats.includes(file.type)) {
        return "Only PNG, JPEG, and JPG image formats are supported";
    }

    if (file.size > 10 * 1024 * 1024) {
        return "File size must be less than 10MB";
    }

    return null;
}
