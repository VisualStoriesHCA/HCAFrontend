import { useState, useEffect } from "react";
import { StoryHead } from "@/lib/api";
import { DefaultService } from "@/lib/api";
import SessionItem from "./SessionItem";
import LoadingSpinner from "./LoadingSpinner";
import { useUserContext } from "@/App";
import { Button } from "@/components/ui/button";

interface SessionSidebarProps {
  activeStory: StoryHead | null;
  stories: StoryHead[];
  loading: boolean;
  onSessionSelect: (session: StoryHead) => void;
  onDeleteStory?: (story: StoryHead) => void;
  onCreateStory?: () => void;
  className?: string;
}

const SessionSidebar = ({ activeStory, stories, loading, onSessionSelect, onCreateStory, onDeleteStory, className }: SessionSidebarProps) => {
  const { userInformation } = useUserContext();

  return (
    <div className={`bg-white border-r h-full overflow-y-auto ${className}`}>
      <div className="p-4 border-b">
        <Button
          onClick={onCreateStory}
          className="w-full text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
        >
          Create new Story
        </Button>
        <h2 className="font-semibold mt-3">Previous Sessions</h2>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="divide-y">
          {stories.map((story) => (
            <SessionItem
              key={story.storyId}
              story={story}
              onDelete={onDeleteStory ? () => onDeleteStory(story) : undefined}
              isActive={activeStory?.storyId === story.storyId}
              onClick={onSessionSelect}
            />
          ))}
          
          {stories.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No previous sessions found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionSidebar;
