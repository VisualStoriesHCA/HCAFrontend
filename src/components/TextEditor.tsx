import DOMPurify from "dompurify";
import { useRef, useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import AudioPlayer from "./AudioPlayer";

interface TextEditorProps {
  content: string;
  audioUrl?: string;
  onContentChange: (content: string) => void;
  onGenerateImage: () => void;
  generating: boolean;
  adjusting: boolean;
  className?: string;
}

const ALLOWED_TAGS = ["mark", "b", "i", "u", "p", "br"];
const ALLOWED_TAGS_NO_MARK = ["b", "i", "u", "p", "br"];

const removeMarkTags = (html: string): string => {
  return html.replace(/<\/?mark>/g, '');
};

const TextEditor = ({
  content,
  audioUrl,
  onContentChange,
  generating,
  adjusting,
  className
}: TextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastContentRef = useRef<string>("");
  const [userHasEdited, setUserHasEdited] = useState(false);
  
  // Only update innerHTML if content prop changed externally
  useEffect(() => {
    const sanitized = DOMPurify.sanitize(content, { ALLOWED_TAGS });
    // Avoid unnecessary innerHTML update if content is unchanged
    if (editorRef.current && sanitized !== lastContentRef.current) {
      editorRef.current.innerHTML = sanitized;
      lastContentRef.current = sanitized;
      setUserHasEdited(false); // Reset editing state when new content arrives
    }
  }, [content]);

  const getTextOffset = (container: Node, node: Node, offset: number): number => {
    let textOffset = 0;
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let currentNode;
    while (currentNode = walker.nextNode()) {
      if (currentNode === node) {
        return textOffset + offset;
      }
      textOffset += currentNode.textContent?.length || 0;
    }
    return textOffset;
  };

  const setTextOffset = (container: Node, offset: number): void => {
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let currentOffset = 0;
    let currentNode;
    
    while (currentNode = walker.nextNode()) {
      const nodeLength = currentNode.textContent?.length || 0;
      
      if (currentOffset + nodeLength >= offset) {
        const range = document.createRange();
        const selection = window.getSelection();
        
        range.setStart(currentNode, offset - currentOffset);
        range.collapse(true);
        
        selection?.removeAllRanges();
        selection?.addRange(range);
        return;
      }
      
      currentOffset += nodeLength;
    }
    
    // If we reach here, place cursor at the end
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(container);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const handleMouseUp = () => {
    if (!userHasEdited && editorRef.current) {
      // Use setTimeout to ensure the selection is fully established after the click
      setTimeout(() => {
        if (!editorRef.current) return;
        
        setUserHasEdited(true);
        
        // Save cursor position based on text content (ignoring HTML tags)
        const selection = window.getSelection();
        let textOffset = 0;
        
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          textOffset = getTextOffset(editorRef.current, range.startContainer, range.startOffset);
        }
        
        // Get current content and remove mark tags
        const currentContent = editorRef.current.innerHTML;
        const cleanContent = removeMarkTags(currentContent);
        const sanitized = DOMPurify.sanitize(cleanContent, { ALLOWED_TAGS: ALLOWED_TAGS_NO_MARK });
        
        // Update content if it actually changed (i.e., if there were mark tags to remove)
        if (sanitized !== currentContent) {
          editorRef.current.innerHTML = sanitized;
          lastContentRef.current = sanitized;
          onContentChange(sanitized);
          
          // Use requestAnimationFrame to ensure DOM is updated before setting cursor
          requestAnimationFrame(() => {
            if (editorRef.current) {
              setTextOffset(editorRef.current, textOffset);
            }
          });
        }
      }, 0);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const dirty = e.currentTarget.innerHTML;
    // Always sanitize without mark tags once user has started editing
    const clean = DOMPurify.sanitize(dirty, { 
      ALLOWED_TAGS: userHasEdited ? ALLOWED_TAGS_NO_MARK : ALLOWED_TAGS 
    });
    lastContentRef.current = clean;
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
        onMouseUp={handleMouseUp}
        className="flex-1 p-4 w-full min-h-[200px] resize-none border focus:outline-none whitespace-pre-wrap overflow-auto bg-white rounded-md"
        placeholder="Start writing your story here..."
        suppressContentEditableWarning={true}
      />
      
      {/* Audio Player - only show if audioUrl exists */}
      {audioUrl && (
        <div className="sticky bottom-0 bg-white border-t shadow-lg z-30">
          <div className="p-3 bg-gray-50">
            <AudioPlayer audioUrl={audioUrl} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TextEditor;