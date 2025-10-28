import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Code,
  Quote,
  Highlighter,
  Type,
  ChevronDown,
  Palette
} from 'lucide-react';
import { cn } from '../../lib/utils';

const RichNotesEditor = ({ value, onChange, placeholder, className }) => {
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef(null);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
  });

  const updateActiveFormats = () => {
    const formats = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
    };
    setActiveFormats(formats);
  };

  const execCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    updateActiveFormats();
  };

  const handleInput = () => {
    const content = editorRef.current?.innerHTML || '';
    onChange(content);
    updateActiveFormats();
  };

  const handleKeyDown = (e) => {
    // Handle backspace for better list behavior
    if (e.key === 'Backspace') {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      
      // If at the start of a list item and it's empty, remove the list
      if (range.startOffset === 0 && range.endOffset === 0) {
        const listItem = range.startContainer.parentElement?.closest('li');
        if (listItem && listItem.textContent.trim() === '') {
          e.preventDefault();
          if (activeFormats.insertUnorderedList) {
            execCommand('insertUnorderedList');
          } else if (activeFormats.insertOrderedList) {
            execCommand('insertOrderedList');
          }
        }
      }
    }
    
    // Update active formats on arrow keys or selection changes
    setTimeout(updateActiveFormats, 10);
  };

  const handleClick = () => {
    updateActiveFormats();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const colors = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Black', value: '#000000' },
  ];

  return (
    <div className={cn("relative flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-1 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 flex-wrap">
        {/* Text Formatting */}
        <button
          onClick={() => execCommand('bold')}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            "p-1.5 rounded transition-all",
            activeFormats.bold 
              ? "bg-blue-500 text-white shadow-sm" 
              : "hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}
          title="Bold (Ctrl+B)"
          type="button"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => execCommand('italic')}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            "p-1.5 rounded transition-all",
            activeFormats.italic 
              ? "bg-blue-500 text-white shadow-sm" 
              : "hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}
          title="Italic (Ctrl+I)"
          type="button"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => execCommand('underline')}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            "p-1.5 rounded transition-all",
            activeFormats.underline 
              ? "bg-blue-500 text-white shadow-sm" 
              : "hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}
          title="Underline (Ctrl+U)"
          type="button"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => execCommand('strikeThrough')}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            "p-1.5 rounded transition-all",
            activeFormats.strikeThrough 
              ? "bg-blue-500 text-white shadow-sm" 
              : "hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}
          title="Strikethrough"
          type="button"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-0.5"></div>

        {/* Font Size Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowFontSize(!showFontSize)}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
            title="Font Size"
            type="button"
          >
            <Type className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
            <ChevronDown className="w-2.5 h-2.5 text-gray-700 dark:text-gray-300" />
          </button>
          {showFontSize && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 min-w-[140px]">
              {[
                { label: 'Small', value: '1' },
                { label: 'Normal', value: '3' },
                { label: 'Large', value: '5' },
                { label: 'Huge', value: '7' }
              ].map(size => (
                <button
                  key={size.value}
                  onClick={() => {
                    execCommand('fontSize', size.value);
                    setShowFontSize(false);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors font-medium"
                  type="button"
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Color */}
        <div className="relative">
          <button
            onClick={() => setShowColors(!showColors)}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
            title="Text Color"
            type="button"
          >
            <Palette className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
            <ChevronDown className="w-2.5 h-2.5 text-gray-700 dark:text-gray-300" />
          </button>
          {showColors && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 p-2 grid grid-cols-4 gap-1.5 min-w-[140px]">
              {colors.map(color => (
                <button
                  key={color.value}
                  onClick={() => {
                    execCommand('foreColor', color.value);
                    setShowColors(false);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  className="w-7 h-7 rounded-md border-2 border-gray-300 dark:border-gray-600 hover:scale-110 hover:shadow-lg transition-all"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  type="button"
                />
              ))}
            </div>
          )}
        </div>

        {/* Highlight */}
        <button
          onClick={() => execCommand('hiliteColor', '#fef08a')}
          onMouseDown={(e) => e.preventDefault()}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 transition-colors"
          title="Highlight"
          type="button"
        >
          <Highlighter className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
        </button>

        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-0.5"></div>

        {/* Lists */}
        <button
          onClick={() => execCommand('insertUnorderedList')}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            "p-1.5 rounded transition-all",
            activeFormats.insertUnorderedList 
              ? "bg-blue-500 text-white shadow-sm" 
              : "hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}
          title="Bullet List"
          type="button"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => execCommand('insertOrderedList')}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            "p-1.5 rounded transition-all",
            activeFormats.insertOrderedList 
              ? "bg-blue-500 text-white shadow-sm" 
              : "hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}
          title="Numbered List"
          type="button"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-0.5"></div>

        {/* Alignment */}
        <button
          onClick={() => execCommand('justifyLeft')}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            "p-1.5 rounded transition-all",
            activeFormats.justifyLeft 
              ? "bg-blue-500 text-white shadow-sm" 
              : "hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}
          title="Align Left"
          type="button"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => execCommand('justifyCenter')}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            "p-1.5 rounded transition-all",
            activeFormats.justifyCenter 
              ? "bg-blue-500 text-white shadow-sm" 
              : "hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}
          title="Align Center"
          type="button"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => execCommand('justifyRight')}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            "p-1.5 rounded transition-all",
            activeFormats.justifyRight 
              ? "bg-blue-500 text-white shadow-sm" 
              : "hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}
          title="Align Right"
          type="button"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-0.5"></div>

        {/* Other Features */}
        <button
          onClick={() => execCommand('formatBlock', 'blockquote')}
          onMouseDown={(e) => e.preventDefault()}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 transition-colors"
          title="Quote"
          type="button"
        >
          <Quote className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
        </button>
        <button
          onClick={() => execCommand('formatBlock', 'pre')}
          onMouseDown={(e) => e.preventDefault()}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 transition-colors"
          title="Code Block"
          type="button"
        >
          <Code className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
        </button>
        <button
          onClick={insertLink}
          onMouseDown={(e) => e.preventDefault()}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 transition-colors"
          title="Insert Link"
          type="button"
        >
          <Link className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onFocus={() => {
          setIsFocused(true);
          updateActiveFormats();
        }}
        onBlur={() => {
          setIsFocused(false);
          setTimeout(() => {
            setShowFontSize(false);
            setShowColors(false);
          }, 200);
        }}
        className={cn(
          "rich-notes-editor",
          "flex-1 px-4 py-3 overflow-y-auto",
          "bg-white dark:bg-gray-800",
          "text-gray-900 dark:text-gray-100",
          "focus:outline-none",
          "text-base leading-relaxed",
          "[&_b]:font-bold",
          "[&_strong]:font-bold",
          "[&_i]:italic",
          "[&_em]:italic",
          "[&_u]:underline",
          "[&_strike]:line-through",
          "[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2",
          "[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2",
          "[&_li]:my-1",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-2",
          "[&_pre]:bg-gray-100 [&_pre]:dark:bg-gray-900 [&_pre]:p-2 [&_pre]:rounded [&_pre]:font-mono [&_pre]:text-xs [&_pre]:my-2",
          "[&_a]:text-blue-600 [&_a]:dark:text-blue-400 [&_a]:underline"
        )}
        data-placeholder={placeholder || "Start typing..."}
        style={{
          minHeight: '400px'
        }}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }
        /* Text selection style inside the editor */
        .rich-notes-editor ::selection {
          background-color: #D0E3FF;
          color: #000;
        }
        /* Make italic and emphasis more visibly distinct */
        .rich-notes-editor i, .rich-notes-editor em {
          font-style: oblique 14deg;
          font-family: Georgia, Cambria, "Times New Roman", Times, serif;
        }
        .rich-notes-editor em { font-weight: 500; }
        /* Adjust colors subtly in light/dark for emphasis readability */
        .rich-notes-editor i, .rich-notes-editor em { color: inherit; }
        .dark .rich-notes-editor i, .dark .rich-notes-editor em { color: inherit; }
      `}</style>
    </div>
  );
};

export default RichNotesEditor;
