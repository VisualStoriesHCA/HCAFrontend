import { StoryHead } from "@/lib/api";
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
import { useState } from "react";

interface SessionItemProps {
  story: StoryHead;
  isActive: boolean;
  onClick: (story: StoryHead) => void;
  onDelete: (story: StoryHead) => void;
}

const SessionItem = ({ story, isActive, onClick, onDelete }: SessionItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the onClick for the card
  };

  const handleConfirmDelete = () => {
    onDelete(story);
  };

  return (
    <Card
      className={`relative p-3 border-b cursor-pointer hover:bg-gray-100 transition-colors ${
        isActive ? "bg-gray-200" : ""
      }`}
      onClick={() => onClick(story)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

      {isHovered && (
        <div className="absolute top-2 right-2">
          <AlertDialog>
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
                <AlertDialogCancel>Cancel</AlertDialogCancel>
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