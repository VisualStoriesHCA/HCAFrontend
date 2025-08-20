import { StoryBasicInfoResponse } from "@/lib/api";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useRef } from "react";

interface SessionItemProps {
  story: StoryBasicInfoResponse;
  isActive: boolean;
  onClick: (story: StoryBasicInfoResponse) => void;
  onDelete: (story: StoryBasicInfoResponse) => void;
}

const SessionItem = ({ story, isActive, onClick, onDelete }: SessionItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault();
    setAlertDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setAlertDialogOpen(false);
    setIsDeleting(true);
    onDelete(story);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isDeleting || alertDialogOpen) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Double-check that we have a valid story
    if (!story || !story.storyId) {
      console.error("SessionItem: Attempted to click on invalid story:", story);
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    console.warn("SessionItem: Card clicked for story:", story.storyId);
    onClick(story);
  };

  const handleMouseEnter = () => {
    if (!isDeleting && !alertDialogOpen) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isDeleting && !alertDialogOpen) {
      setIsHovered(false);
    }
  };

  // Don't render if story is invalid or being deleted
  if (!story || !story.storyId || isDeleting) {
    return null;
  }

  return (
    <Card
      ref={cardRef}
      className={`relative p-3 border-b cursor-pointer hover:bg-gray-100 transition-colors ${
        isActive ? "bg-gray-200" : ""
      } ${isDeleting || alertDialogOpen ? "opacity-50 pointer-events-none" : ""}`}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-3">
        {story.coverImage && (
          <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
            <img 
              src={story.coverImage} 
              alt={story.storyName} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="overflow-hidden flex-1">
          <h3 className="font-medium text-sm truncate">{story.storyName}</h3>
          <p className="text-xs text-gray-500 truncate">
            {new Date(story.lastEdited).toLocaleDateString()}
          </p>
        </div>
      </div>

      {isHovered && !isDeleting && (
        <div className="absolute top-2 right-2">
          <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                onClick={handleDeleteClick}
              >
                <X className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Story</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{story.storyName}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setAlertDialogOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDelete}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </Card>
  );
};

export default SessionItem;