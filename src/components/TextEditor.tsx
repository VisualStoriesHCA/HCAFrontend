import DOMPurify from "dompurify";
import { useRef, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface TextEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onGenerateImage: () => void;
  generating: boolean;
  adjusting: boolean;
  className?: string;
}

const ALLOWED_TAGS = ["mark", "b", "i", "u", "p", "br"];

const TextEditor = ({
  content,
  onContentChange,
  generating,
  adjusting,
  className
}: TextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastContentRef = useRef<string>("");

  // Only update innerHTML if content prop changed externally
  useEffect(() => {
    const sanitized = DOMPurify.sanitize(content, { ALLOWED_TAGS });

    // Avoid unnecessary innerHTML update if content is unchanged
    if (editorRef.current && sanitized !== lastContentRef.current) {
      editorRef.current.innerHTML = sanitized;
      lastContentRef.current = sanitized;
    }
  }, [content]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const dirty = e.currentTarget.innerHTML;
    const clean = DOMPurify.sanitize(dirty, { ALLOWED_TAGS });

    lastContentRef.current = clean; // mark this change as internal
    onContentChange(clean);
  };

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
      <div
        ref={editorRef}
        contentEditable={!generating && !adjusting}
        onInput={handleInput}
        className="flex-1 p-4 w-full min-h-[200px] resize-none border focus:outline-none whitespace-pre-wrap overflow-auto bg-white rounded-md"
        placeholder="Start writing your story here..."
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

export default TextEditor;