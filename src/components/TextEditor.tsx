import LoadingSpinner from "./LoadingSpinner";

interface TextEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onGenerateImage: () => void;
  generating: boolean;
  adjusting: boolean;
  className?: string;
}

const TextEditor = ({
  content,
  onContentChange,
  generating,
  adjusting,
  className
}: TextEditorProps) => {
  return (
    <div className={`relative flex flex-col ${className}`}>
      {adjusting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10">
          <div className="flex items-center">
            <LoadingSpinner size="lg" className="text-white" />
            <span className="ml-3 text-white">Updating story...</span>
          </div>
        </div>
      )}
      <textarea
        className="flex-1 p-4 w-full resize-none focus:outline-none"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Start writing your story here..."
        disabled={generating || adjusting}
      />
    </div>
  );
};

export default TextEditor;