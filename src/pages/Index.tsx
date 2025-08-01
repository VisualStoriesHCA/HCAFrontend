
import { useState, useEffect } from "react";
import { DrawingMode, SidebarState } from "@/lib/types";
import { UserStoriesResponse, StoryBasicInfoResponse } from "@/lib/api";
import SessionSidebar from "@/components/SessionSidebar";
import Navbar from "@/components/Navbar";
import StoryOverview from "@/components/StoryOverview";
import { useUserContext } from "@/App";
import { ItemsService } from "@/lib/api";

// Create type of a single story (UserStoriesResponse is an array of stories)


const Index = () => {
  const { userInformation, setUserInformation } = useUserContext();
  const [activeStory, setActiveStory] = useState<StoryBasicInfoResponse | null>(null);
  const [sidebarIsVisible, setIsSidebarVisible] = useState<SidebarState>({
    visible: true,
  });
  const [stories, setStories] = useState<StoryBasicInfoResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await ItemsService.getUserStories(userInformation.userId);
        setStories(data.stories);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarVisible(prevState => ({
      ...prevState,
      visible: !prevState.visible,
    }));
  };

  const handleCreateNewStory = async () => {
    const data = await ItemsService.createNewStory({ "userId": userInformation.userId, "storyName": "New Story" });
    setStories(prevStories => [data, ...prevStories]);
    setActiveStory(data);
  }

  const _handleDeleteStory = async (story: StoryBasicInfoResponse) => {
    handleDeleteStory(story.storyId);
  }

  const handleDeleteStory = async (storyId: string) => {
     // Call API to delete story
    try {
      const data = await ItemsService.deleteStory({ "userId": userInformation.userId, "storyId": storyId });
    }
    catch (error) {
      console.error("Failed to delete story:", error);
      return; // Exit if deletion fails
    }
    setStories(prevStories => prevStories.filter(s => s.storyId !== storyId));
    if (activeStory?.storyId === storyId) {
      setActiveStory(null);
    }
  }


  if (!userInformation || !userInformation.userId) {
    // Redicect to /login page is userId is not set
    window.location.href = "/login";
    return null; // Prevent rendering the rest of the component
  }


  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Navbar onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - conditionally shown based on sidebarState */}
        {sidebarIsVisible.visible && (
          <SessionSidebar
            activeStory={activeStory}
            stories={stories}
            loading={loading}
            onDeleteStory={_handleDeleteStory}
            onCreateStory={() => handleCreateNewStory()} // Reset active story when creating a new one
            onSessionSelect={setActiveStory}
            className="w-1/5"
          />
        )}
        <StoryOverview storyId={activeStory?.storyId} onStoryDelete={handleDeleteStory} />

      </div>
    </div>
  );
};

export default Index;
