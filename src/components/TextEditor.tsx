
import { Session } from "@/lib/types";

interface TextEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onGenerateImage: () => void;
  generating: boolean;
  className?: string;
}

const TextEditor = ({ 
  content, 
  onContentChange, 
  generating,
  className 
}: TextEditorProps) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <textarea
        className="flex-1 p-4 w-full resize-none focus:outline-none"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Start writing your story here..."
        disabled={generating}
      />
    </div>
  );
};

export default TextEditor;
