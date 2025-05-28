
import { useState, useEffect } from "react";
import { DrawingMode, SidebarState } from "@/lib/types";
import { StoryHead } from "@/lib/api";
import SessionSidebar from "@/components/SessionSidebar";
import Navbar from "@/components/Navbar";
import StoryOverview from "@/components/StoryOverview";
import { useUserContext } from "@/App";
import { DefaultService } from "@/lib/api"; 


const Index = () => {
  const { userInformation, setUserInformation } = useUserContext();
  const [activeStory, setActiveStory] = useState<StoryHead | null>(null);
  const [sidebarIsVisible, setIsSidebarVisible] = useState<SidebarState>({
    visible: true,
  });
  const [stories, setStories] = useState<StoryHead[]>([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchSessions = async () => {
      try {
        //const data = await DefaultService.getGetUserStories(userId);
        /* temporary hardcoded data */
        const data: StoryHead[] = [
          {
            storyId: "1",
            storyName: "Session 1",
            lastEdited: "2023-10-01T12:00:00Z",
            coverImage: "https://picsum.photos/200",
          },
          {
            storyId: "2",
            storyName: "Session 2",
            lastEdited: "2023-10-02T12:00:00Z",
            coverImage: "https://picsum.photos/200",
          },
          {
            storyId: "3",
            storyName: "Session 3",
            lastEdited: "2023-10-03T12:00:00Z",
            coverImage: "https://picsum.photos/200",
          }]
        setStories(data);
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
    //const data = await DefaultService.postCreateNewStory({userId: userId, storyName: undefined});
    const data: StoryHead = {
      storyId: String(Date.now()), // Use timestamp as unique ID
      storyName: "New Story",
      lastEdited: new Date().toISOString(),
      coverImage: null, // No cover image initially
    };
    // Insert data into stories array at index 0
    setStories(prevStories => [data, ...prevStories]);
    setActiveStory(data);
  }

  const handleDeleteStory = async (story: StoryHead) => {
    // Call API to delete story
    try{
      //const data = await DefaultService.deleteDeleteStory(userInformation.userId, story.storyId);
    }
    catch (error) {
      console.error("Failed to delete story:", error);
      return; // Exit if deletion fails
    }
    // Update local state to remove the story
    setStories(prevStories => prevStories.filter(s => s.storyId !== story.storyId));
    // Reset active story if it was the one deleted
    if (activeStory?.storyId === story.storyId) {
      if( stories.length > 1) {
        // Set active story to the first one in the list if available
        setActiveStory(stories[0]);
      }
      else {
        // If no stories left, reset active story to null
        setActiveStory(null);
      }
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
            onDeleteStory={handleDeleteStory}
            onCreateStory={() => handleCreateNewStory()} // Reset active story when creating a new one
            onSessionSelect={setActiveStory}
            className="w-1/5"
          />
        )}
        <StoryOverview storyId={activeStory?.storyId}/>
       
      </div>
    </div>
  );
};

export default Index;
