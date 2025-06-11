import LoadingSpinner from "./LoadingSpinner"; // Assuming you have this component already

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
              <LoadingSpinner size="lg"/>
            </div>
        )}
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
