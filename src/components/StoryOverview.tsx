import TextEditor from "@/components/TextEditor";
import ImageCanvas from "@/components/ImageCanvas";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {useEffect, useRef, useState} from "react";
import {DrawingMode} from "@/lib/types";
import {toast} from "sonner";
import {
    ItemsService,
    NoChangeOperation,
    SketchFromScratchOperation,
    SketchOnImageOperation,
    StoryDetailsResponse
} from "@/lib/api"
import {useUserContext} from "@/App";
import {FileText, Image, PlusCircle, Upload} from "lucide-react";

export default function StoryOverview({ storyId }: { storyId: string }) {
    const { userInformation, setUserInformation } = useUserContext();
    const [story, setStory] = useState<StoryDetailsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const setStoryContent = (content: string) => {
        setStory((prevStory) => {
            if (!prevStory) return null;
            return {
                ...prevStory,
                storyText: content
            };
        });
    }

    // Drawing state
    const [drawingMode, setDrawingMode] = useState<DrawingMode>({
        mode: "none",
        color: ""
    });

    // Loading states
    const [generatingImage, setGeneratingImage] = useState(false);
    const [adjustingStory, setAdjustingStory] = useState(false);
    const [uploadingSketch, setUploadingSketch] = useState(false);

    // File input ref for upload functionality
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Ref to access ImageCanvas methods
    const imageCanvasRef = useRef<any>(null);

    // Set sample story on component mount
    useEffect(() => {
        if (!storyId) {
            setLoading(false);
            return;
        }
        const fetchStory = async () => {
            try {
                const data = await ItemsService.getStory(userInformation.userId, storyId);
                console.log("Received story data:", data);
                setStory(data);
                setLoading(false);
                
                // Clear any existing drawings when story changes
                setTimeout(() => {
                    if (imageCanvasRef.current && imageCanvasRef.current.clearAllDrawings) {
                        imageCanvasRef.current.clearAllDrawings();
                    }
                }, 100);
                
            } catch (error) {
                console.error("Failed to fetch story:", error);
                toast.error("Failed to load story. Please try again.");
                setLoading(false);
            }
        }
        fetchStory();
    }, [userInformation.userId, storyId]);

    const handleGenerateImage = async () => {
        if (!story?.storyText.trim()) {
            toast.error("Please write a story first");
            return;
        }
        setGeneratingImage(true);
        try {
            const newStory = await ItemsService.updateImagesByText({
                userId: userInformation.userId,
                storyId: storyId,
                updatedText: story.storyText
            })
            console.log("Generated image data:", newStory);
            console.log("Received information from image generation:", newStory);
            setStory(newStory);
            
            // Clear any existing drawings after successful image generation
            setTimeout(() => {
                if (imageCanvasRef.current && imageCanvasRef.current.clearAllDrawings) {
                    imageCanvasRef.current.clearAllDrawings();
                }
            }, 100);
            
        } catch (error) {
            console.error("Failed to generate image:", error);
            toast.error("Failed to generate image. Please try again.");
        } finally {
            setGeneratingImage(false);
        }
    };

    // Handle updating story from edited image
    const handleGenerateStory = async (imageDataUrl: string, hasUserDrawings: boolean, hasBackgroundImage: boolean) => {
        console.log("Updating story from image:", { 
            imageDataUrl: imageDataUrl?.substring(0, 50) + "...", 
            hasUserDrawings, 
            hasBackgroundImage 
        });

        // Determine the operation type based on the conditions
        let imageOperation;

        if (!hasUserDrawings && hasBackgroundImage) {
            console.log("User has not drawn and there is a background image");
            imageOperation = {
                type: NoChangeOperation.type.NOCHANGE,
                imageId: story?.storyImages?.[0]?.imageId || "1"
            };
        } else if (hasUserDrawings && !hasBackgroundImage) {
            console.log("User has drawn on the canvas and there is no background image");
            imageOperation = {
                type: SketchFromScratchOperation.type.SKETCH_FROM_SCRATCH,
                canvasData: imageDataUrl
            };
        } else if (hasUserDrawings && hasBackgroundImage) {
            console.log("User has drawn on the canvas and there is a background image");
            imageOperation = {
                type: SketchOnImageOperation.type.SKETCH_ON_IMAGE,
                imageId: story?.storyImages?.[0]?.imageId || "1",
                canvasData: imageDataUrl
            };
        } else {
            // (!hasUserDrawings && !hasBackgroundImage) - this case shouldn't happen in normal usage
            console.warn("Invalid state: no drawings and no background image");
            toast.error("No changes to process.");
            return;
        }

        setAdjustingStory(true);
        console.log("Sending an updateTextByImages request with operation with parameters:", {
            userId: userInformation.userId,
            storyId: storyId,
            imageOperations: [imageOperation]
        });
        try {
            const updatedStory = await ItemsService.updateTextByImages({
                userId: userInformation.userId,
                storyId: storyId,
                imageOperations: [imageOperation]
            });
            setStory(updatedStory);
            
            // Clear drawings after successful story generation
            setTimeout(() => {
                if (imageCanvasRef.current && imageCanvasRef.current.clearAllDrawings) {
                    imageCanvasRef.current.clearAllDrawings();
                }
            }, 100);
            
        } catch (error) {
            console.error("Failed to update story from image:", error);
            toast.error("Failed to update story. Please try again.");
        } finally {
            setAdjustingStory(false);
        }
    };

    // Handle sketch upload
    const handleUploadSketch = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Please upload an image file");
            return;
        }

        // Validate specific image formats
        const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!supportedFormats.includes(file.type)) {
            toast.error("Only PNG, JPEG, and JPG image formats are supported");
            return;
        }

        // Validate file size (e.g., max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB");
            return;
        }

        setUploadingSketch(true);
        try {
            // Convert file to data URL
            const reader = new FileReader();
            reader.onload = async (e) => {
                const imageDataUrl = e.target?.result as string;
                console.log(imageDataUrl);
                
                try {
                    // Process the uploaded sketch similar to how drawings are processed
                    const data = await ItemsService.uploadImage({
                        "userId": userInformation.userId,
                        "storyId": storyId, 
                        "imageFile": imageDataUrl
                    });

                    setStory(data);
                    toast.success("Sketch uploaded successfully!");
                    
                    // Clear any existing drawings after successful upload
                    setTimeout(() => {
                        if (imageCanvasRef.current && imageCanvasRef.current.clearAllDrawings) {
                            imageCanvasRef.current.clearAllDrawings();
                        }
                    }, 100);
                    
                } catch (error: any) {
                    console.error("Failed to process uploaded sketch:", error);
                    // Show more specific error message if available from backend
                    if (error.body?.detail) {
                        toast.error(error.body.detail);
                    } else {
                        toast.error("Failed to process uploaded sketch. Please try again.");
                    }
                }
            };
            
            reader.onerror = () => {
                toast.error("Failed to read the uploaded file");
            };
            
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Error uploading sketch:", error);
            toast.error("Failed to upload sketch. Please try again.");
        } finally {
            setUploadingSketch(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Placeholder component for when no story is selected
    const PlaceholderContent = () => (
        <div className="flex flex-1 overflow-hidden">
            {/* Left panel placeholder */}
            <Card className="w-1/2 border-r rounded-none">
                <CardHeader className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold">Story Editor</h2>
                        <Button disabled variant="outline">
                            Generate Image
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Story Selected
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Select an existing story from the sidebar or create a new one to start writing and editing your content.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                            <PlusCircle className="h-4 w-4" />
                            <span>Create or select a story to continue</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Right panel placeholder */}
            <Card className="w-1/2 rounded-none">
                <CardHeader className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold">Image Canvas</h2>
                        <div className="flex gap-2">
                            <Button disabled variant="outline">
                                Upload Sketch
                            </Button>
                            <Button disabled variant="outline">
                                Generate Story
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <Image className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Image Canvas
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Your generated images and drawing tools will appear here once you select or create a story.
                        </p>
                        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">Image preview area</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading story...</p>
            </div>
        );
    }

    // Show placeholder when no storyId is provided
    if (!storyId) {
        return <PlaceholderContent />;
    }

    return (
        <div className="flex flex-1 overflow-hidden">
            {/* Left panel - 50% of remaining width */}
            <div className="flex flex-col w-1/2 border-r">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-semibold">Story Editor</h2>
                    <Button
                        onClick={handleGenerateImage}
                        disabled={generatingImage || !story?.storyText?.trim()}
                        variant="default"
                    >
                        {generatingImage ? "Generating..." : "Generate Image"}
                    </Button>
                </div>

                <TextEditor
                    content={story?.storyText}
                    onContentChange={setStoryContent}
                    onGenerateImage={handleGenerateImage}
                    generating={generatingImage}
                    adjusting={adjustingStory}
                    className="flex-1"
                />
            </div>

            {/* Right panel - 50% of remaining width */}
            <div className="flex flex-col w-1/2">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-semibold">Image Canvas</h2>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleUploadSketch}
                            disabled={uploadingSketch || adjustingStory}
                            variant="outline"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingSketch ? "Uploading..." : "Upload Sketch"}
                        </Button>
                        <Button
                            onClick={() => {
                                // Trigger the ImageCanvas to generate story from drawings
                                if (imageCanvasRef.current) {
                                    imageCanvasRef.current.onGenerateStory();
                                }
                            }}
                            disabled={adjustingStory}
                            variant="default"
                        >
                            {adjustingStory ? "Generating..." : "Generate Story"}
                        </Button>
                    </div>
                </div>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />

                <ImageCanvas
                    ref={imageCanvasRef}
                    imageUrl={story?.storyImages?.[0]?.url || ""}
                    drawingMode={drawingMode}
                    setDrawingMode={setDrawingMode}
                    onImageEdit={handleGenerateStory}
                    loading={generatingImage}
                    adjusting={adjustingStory}
                    className="flex-1"
                    onGenerateImage={handleGenerateImage}
                    generatingImage={generatingImage}
                    storyContent={story?.storyText}
                />
            </div>
        </div>
    );
}