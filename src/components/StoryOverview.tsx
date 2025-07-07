import TextEditor from "@/components/TextEditor";
import ImageCanvas from "@/components/ImageCanvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { DrawingMode } from "@/lib/types";
import { toast } from "sonner";
import {
    ItemsService,
    StoryDetailsResponse,
    StoryState
} from "@/lib/api";
import { useUserContext } from "@/App";
import { FileText, Image, PlusCircle, Upload, Volume2 } from "lucide-react";
import { useStoryPolling } from "@/hooks/useStoryPolling";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";
import { determineImageOperation, validateImageFile } from "@/utils/imageOperations";

interface LoadingStates {
    generatingImage: boolean;
    generatingAudio: boolean;
    adjustingStory: boolean;
    uploadingSketch: boolean;
    isPolling: boolean;
    pollingError: boolean;
}

export default function StoryOverview({ 
    storyId, 
    onStoryDelete 
}: { 
    storyId: string, 
    onStoryDelete?: (storyId: string) => void 
}) {
    const { userInformation } = useUserContext();
    const [story, setStory] = useState<StoryDetailsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingStates, setLoadingStates] = useState<LoadingStates>({
        generatingImage: false,
        generatingAudio: false,
        adjustingStory: false,
        uploadingSketch: false,
        isPolling: false,
        pollingError: false
    });
    
    const [drawingMode, setDrawingMode] = useState<DrawingMode>({
        mode: "none",
        color: ""
    });

    const currentStoryIdRef = useRef<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageCanvasRef = useRef<any>(null);

    const { startPolling, stopPolling } = useStoryPolling();
    const { executeOperation } = useAsyncOperation(currentStoryIdRef, storyId);

    // Helper functions
    const updateLoadingState = (key: keyof LoadingStates, value: boolean) => {
        setLoadingStates(prev => ({ ...prev, [key]: value }));
    };

    const resetAllLoadingStates = () => {
        setLoadingStates({
            generatingImage: false,
            generatingAudio: false,
            adjustingStory: false,
            uploadingSketch: false,
            isPolling: false,
            pollingError: false
        });
    };

    const clearCanvasDrawings = () => {
        setTimeout(() => {
            if (imageCanvasRef.current?.clearAllDrawings) {
                imageCanvasRef.current.clearAllDrawings();
            }
        }, 100);
    };

    const setStoryContent = (content: string) => {
        setStory(prevStory => {
            if (!prevStory) return null;
            return { ...prevStory, storyText: content };
        });
    };

    // Story fetching
    const fetchStory = async (isPollingCall = false) => {
        try {
            const data = await ItemsService.getStoryById(userInformation.userId, storyId);
            console.log("Received story data:", data);

            if (currentStoryIdRef.current === storyId) {
                setStory(data);
                if (!isPollingCall) {
                    setLoading(false);
                    clearCanvasDrawings();
                }
            }
            return data;
        } catch (error) {
            console.error("Failed to fetch story:", error);
            if (!isPollingCall && currentStoryIdRef.current === storyId) {
                toast.error("Failed to load story. Please try again.");
                setLoading(false);
            }
            throw error;
        }
    };

    // Polling handlers
    const handlePollingUpdate = (updatedStory: StoryDetailsResponse) => {
        if (currentStoryIdRef.current === storyId) {
            setStory(updatedStory);
            if (updatedStory.state === StoryState.COMPLETED) {
                updateLoadingState('isPolling', false);
            }
        }
    };

    const handlePollingTimeout = () => {
        resetAllLoadingStates();
        updateLoadingState('pollingError', true);
    };

    const startPollingIfNeeded = (storyData: StoryDetailsResponse) => {
        if (storyData.state === StoryState.PENDING && currentStoryIdRef.current === storyId) {
            updateLoadingState('isPolling', true);
            startPolling(
                storyId,
                userInformation.userId,
                currentStoryIdRef,
                handlePollingUpdate,
                handlePollingTimeout
            );
        }
    };

    // Main story initialization effect
    useEffect(() => {
        currentStoryIdRef.current = storyId;
        resetAllLoadingStates();
        setDrawingMode({ mode: "none", color: "" });
        stopPolling();

        if (!storyId) {
            setLoading(false);
            setStory(null);
            return;
        }

        setStory(null);
        setLoading(true);

        const initializeStory = async () => {
            try {
                const storyData = await fetchStory();
                if (storyData) {
                    startPollingIfNeeded(storyData);
                }
            } catch (error) {
                // Error handling is done in fetchStory
            }
        };

        initializeStory();
        return stopPolling;
    }, [userInformation.userId, storyId]);

    // Cleanup on unmount
    useEffect(() => stopPolling, []);

    // Action handlers
    const handleGenerateAudio = async () => {
        if (!story?.storyText.trim()) {
            toast.error("Please write a story first");
            return;
        }

        updateLoadingState('generatingAudio', true);

        await executeOperation({
            operation: () => ItemsService.generateAudio({
                userId: userInformation.userId,
                storyId: storyId,
                text: story.storyText
            }),
            onSuccess: (newStory) => {
                setStory(newStory);
                startPollingIfNeeded(newStory);
            },
            onError: () => {},
            errorMessage: "Failed to generate audio. Please try again.",
            loadingKey: "generate audio"
        }).finally(() => {
            if (currentStoryIdRef.current === storyId) {
                updateLoadingState('generatingAudio', false);
            }
        });
    };

    const handleGenerateImage = async () => {
        if (!story?.storyText.trim()) {
            toast.error("Please write a story first");
            return;
        }

        updateLoadingState('generatingImage', true);

        await executeOperation({
            operation: () => ItemsService.updateImagesByText({
                userId: userInformation.userId,
                storyId: storyId,
                updatedText: story.storyText
            }),
            onSuccess: (newStory) => {
                setStory(newStory);
                startPollingIfNeeded(newStory);
                clearCanvasDrawings();
            },
            onError: () => {},
            errorMessage: "Failed to generate image. Please try again.",
            loadingKey: "generate image"
        }).finally(() => {
            if (currentStoryIdRef.current === storyId) {
                updateLoadingState('generatingImage', false);
            }
        });
    };

    const handleGenerateStory = async (
        imageDataUrl: string, 
        hasUserDrawings: boolean, 
        hasBackgroundImage: boolean
    ) => {
        console.log("Updating story from image:", {
            imageDataUrl: imageDataUrl?.substring(0, 50) + "...",
            hasUserDrawings,
            hasBackgroundImage
        });

        try {
            const imageOperation = determineImageOperation(
                hasUserDrawings,
                hasBackgroundImage,
                imageDataUrl,
                story?.storyImages?.[0]?.imageId
            );

            updateLoadingState('adjustingStory', true);

            await executeOperation({
                operation: () => ItemsService.updateTextByImages({
                    userId: userInformation.userId,
                    storyId: storyId,
                    imageOperations: [imageOperation]
                }),
                onSuccess: (updatedStory) => {
                    setStory(updatedStory);
                    startPollingIfNeeded(updatedStory);
                    clearCanvasDrawings();
                },
                onError: () => {},
                errorMessage: "Failed to update story. Please try again.",
                loadingKey: "update story"
            }).finally(() => {
                if (currentStoryIdRef.current === storyId) {
                    updateLoadingState('adjustingStory', false);
                }
            });

        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    const handleUploadSketch = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const validationError = validateImageFile(file);
        if (validationError) {
            toast.error(validationError);
            return;
        }

        updateLoadingState('uploadingSketch', true);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const imageDataUrl = e.target?.result as string;

                await executeOperation({
                    operation: () => ItemsService.uploadImage({
                        userId: userInformation.userId,
                        storyId: storyId,
                        imageFile: imageDataUrl
                    }),
                    onSuccess: (data) => {
                        setStory(data);
                        startPollingIfNeeded(data);
                        clearCanvasDrawings();
                    },
                    onError: () => {},
                    successMessage: "Sketch uploaded successfully!",
                    errorMessage: "Failed to process uploaded sketch. Please try again.",
                    loadingKey: "upload sketch"
                }).finally(() => {
                    if (currentStoryIdRef.current === storyId) {
                        updateLoadingState('uploadingSketch', false);
                    }
                });
            };

            reader.onerror = () => {
                if (currentStoryIdRef.current === storyId) {
                    toast.error("Failed to read the uploaded file");
                    updateLoadingState('uploadingSketch', false);
                }
            };

            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Error uploading sketch:", error);
            if (currentStoryIdRef.current === storyId) {
                toast.error("Failed to upload sketch. Please try again.");
                updateLoadingState('uploadingSketch', false);
            }
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeleteStory = () => {
        updateLoadingState('isPolling', false);
        onStoryDelete?.(storyId);
        setStory(null);
        setLoading(false);
        currentStoryIdRef.current = "";
        stopPolling();
    };

    // Computed values
    const isStoryPending = story?.state === StoryState.PENDING;
    const isAnyOperationInProgress = Object.values(loadingStates).some(Boolean) && !loadingStates.pollingError;

    // Placeholder component
    const PlaceholderContent = () => (
        <div className="flex flex-1 overflow-hidden">
            <Card className="w-1/2 border-r rounded-none">
                <CardHeader className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold">Story Editor</h2>
                        <div className="flex gap-2">
                            <Button disabled variant="outline">
                                <Volume2 className="h-4 w-4 mr-2" />
                                Generate Audio
                            </Button>
                            <Button disabled variant="outline">Generate Image</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Story Selected</h3>
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
            <Card className="w-1/2 rounded-none">
                <CardHeader className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold">Image Canvas</h2>
                        <div className="flex gap-2">
                            <Button disabled variant="outline">Upload Sketch</Button>
                            <Button disabled variant="outline">Generate Story</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <Image className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Image Canvas</h3>
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

    if (!storyId) {
        return <PlaceholderContent />;
    }

    return (
        <div className="flex flex-1 overflow-hidden relative">
            {/* Left panel */}
            <div className="flex flex-col w-1/2 border-r">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-semibold">Story Editor</h2>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleGenerateAudio}
                            disabled={loadingStates.generatingAudio || !story?.storyText?.trim() || isAnyOperationInProgress}
                            variant="outline"
                        >
                            <Volume2 className="h-4 w-4 mr-2" />
                            {loadingStates.generatingAudio || isStoryPending ? "Generating..." : "Generate Audio"}
                        </Button>
                        <Button
                            onClick={handleGenerateImage}
                            disabled={loadingStates.generatingImage || !story?.storyText?.trim() || isAnyOperationInProgress}
                            variant="default"
                        >
                            {loadingStates.generatingImage || isStoryPending ? "Generating..." : "Generate Image"}
                        </Button>
                    </div>
                </div>
                <TextEditor
                    content={story?.storyText}
                    audioUrl={story?.audioUrl}
                    onContentChange={setStoryContent}
                    onGenerateImage={handleGenerateImage}
                    generating={loadingStates.generatingImage || isStoryPending}
                    adjusting={loadingStates.adjustingStory || isStoryPending}
                    className="flex-1"
                />
            </div>

            {/* Right panel */}
            <div className="flex flex-col w-1/2">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-semibold">Image Canvas</h2>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleUploadSketch}
                            disabled={isAnyOperationInProgress}
                            variant="outline"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            {loadingStates.uploadingSketch ? "Uploading..." : "Upload Sketch"}
                        </Button>
                        <Button
                            onClick={() => imageCanvasRef.current?.onGenerateStory()}
                            disabled={isAnyOperationInProgress}
                            variant="default"
                        >
                            {loadingStates.adjustingStory || isStoryPending || loadingStates.generatingImage ? "Generating..." : "Generate Story"}
                        </Button>
                    </div>
                </div>

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
                    loading={loadingStates.generatingImage || isStoryPending}
                    adjusting={loadingStates.adjustingStory}
                    className="flex-1"
                    onGenerateImage={handleGenerateImage}
                    generatingImage={loadingStates.generatingImage || isStoryPending}
                    storyContent={story?.storyText}
                />
            </div>

            {/* Error notification */}
            {loadingStates.pollingError && story && (
                <Card className="fixed bottom-4 right-4 w-[360px] shadow-lg border-red-200 bg-red-50 z-50">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="h-6 w-6 bg-red-500 rounded-full flex items-center justify-center mr-2">
                                    <span className="text-white text-xs font-bold">!</span>
                                </div>
                                <h3 className="font-medium text-red-800">Our pens might have broken...</h3>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateLoadingState('pollingError', false)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                            >
                                ×
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-sm text-red-700 mb-3">
                            This story seems to be stuck in an endless plot twist. Sometimes the best solution is to crumple it up and start with a fresh page.
                        </p>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleDeleteStory}
                                variant="default"
                                size="sm"
                                className="text-white bg-red-600 hover:bg-red-700"
                            >
                                Delete Story
                            </Button>
                            <Button
                                onClick={() => updateLoadingState('isPolling', false)}
                                variant="outline"
                                size="sm"
                                className="text-red-700 border-red-300 hover:bg-red-100"
                            >
                                Dismiss
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}