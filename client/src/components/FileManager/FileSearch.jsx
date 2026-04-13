import { useState, useRef, useEffect } from 'react';
import useFileStore from '../../stores/useFileStore';
import useEditorStore from '../../stores/useEditorStore';
import { getFileIcon } from '../../utils/fileIcons';

export default function FileSearch() {
  const showFileSearch = useEditorStore((s) => s.showFileSearch);
  const setShowFileSearch = useEditorStore((s) => s.setShowFileSearch);
  const openFile = useEditorStore((s) => s.openFile);
  const getAllFiles = useFileStore((s) => s.getAllFiles);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const allFiles = getAllFiles();
  const filtered = query
    ? allFiles.filter((f) => {
        const q = query.toLowerCase();
        return f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q);
      })
    : allFiles;

  useEffect(() => {
    if (showFileSearch) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showFileSearch]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!showFileSearch) return null;

  const handleSelect = (file) => {
    openFile(file.path, file.name);
    setShowFileSearch(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) handleSelect(filtered[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowFileSearch(false);
    }
  };

  // Highlight matching text
  const highlightMatch = (text, query) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-accent font-medium">{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div className="file-search-overlay" onClick={() => setShowFileSearch(false)}>
      <div className="file-search-modal" onClick={(e) => e.stopPropagation()}>
        {/* Search Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              handleKeyDown(e);
            }}
            onKeyUp={(e) => e.stopPropagation()}
            placeholder="Type to search files..."
            className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-muted/50"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 border border-border text-text-muted font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto max-h-72">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-text-muted text-sm">
              {query ? 'No files found' : 'No files in workspace'}
            </div>
          ) : (
            filtered.map((file, i) => (
              <div
                key={file.path}
                className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors
                  ${i === selectedIndex ? 'bg-accent/10 text-accent' : 'hover:bg-surface-2 text-text'}`}
                onClick={() => handleSelect(file)}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <span className="shrink-0 flex items-center">
                  {getFileIcon(file.name)}
                </span>
                <span className="text-sm font-medium truncate">
                  {highlightMatch(file.name, query)}
                </span>
                <span className="text-xs text-text-muted truncate ml-auto">
                  {highlightMatch(file.path, query)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
