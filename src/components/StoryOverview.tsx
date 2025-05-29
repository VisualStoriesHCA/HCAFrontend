import TextEditor from "@/components/TextEditor";
import ImageCanvas from "@/components/ImageCanvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { DrawingMode, SidebarState } from "@/lib/types";
import { toast } from "sonner";
import { StoryDetailsResponse, ItemsService, NoChangeOperation } from "@/lib/api"
import { useUserContext } from "@/App";
import { FileText, Image, PlusCircle } from "lucide-react";

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

    // Set sample story on component mount
    useEffect(() => {
        if (!storyId) {
            setLoading(false);
            return;
        }

        const sampleStoryObject: StoryDetailsResponse = {
            storyId: storyId,
            storyName: "Sample Story",
            storyText: "A person draws on a whiteboard, explaining how communication leads to community. The diagram shows several stick figures with arrows pointing to a global representation, illustrating how information sharing connects people worldwide.",
            storyImages: [{
                imageId: "1",
                url: "https://picsum.photos/200",
                alt: "Sample image of a person drawing on a whiteboard"
            }]
        }
        setStory(sampleStoryObject);
        setLoading(false);
    }, [userInformation.userId, storyId]);

    // Handle generating image from text
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
            setStory(newStory);
        } catch (error) {
            console.error("Failed to generate image:", error);
            toast.error("Failed to generate image. Please try again.");
        } finally {
            setGeneratingImage(false);
        }
    };

    // Handle updating story from edited image
    const handleGenerateStory = async (imageDataUrl: string) => {
        if (drawingMode.mode === "none" && !imageDataUrl) return;

        console.log("Updating story from image:", imageDataUrl);

        setAdjustingStory(true);
        try {
            const updatedStory = await ItemsService.updateTextByImages({
                userId: userInformation.userId, 
                storyId: storyId, 
                imageOperations: [
                {
                    type: NoChangeOperation.type.NOCHANGE,
                    imageId: story?.storyImages?.[0]?.imageId || "1",
                }]
            })
            setStory(updatedStory);
        } catch (error) {
            console.error("Failed to update story from image:", error);
            toast.error("Failed to update story. Please try again.");
        } finally {
            setAdjustingStory(false);
        }
    };

    // Ref to access ImageCanvas methods
    const imageCanvasRef = useRef<any>(null);

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
                        <Button disabled variant="outline">
                            Generate Story
                        </Button>
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
                    className="flex-1"
                />
            </div>

            {/* Right panel - 50% of remaining width */}
            <div className="flex flex-col w-1/2">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-semibold">Image Canvas</h2>
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