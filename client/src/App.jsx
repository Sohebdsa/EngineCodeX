import { useState, useRef, useCallback, useEffect } from 'react';
import Navbar from './components/Layout/Navbar';
import FileTree from './components/FileManager/FileTree';
import FileSearch from './components/FileManager/FileSearch';
import TabBar from './components/Editor/TabBar';
import Breadcrumb from './components/Editor/Breadcrumb';
import CodeEditor from './components/Editor/CodeEditor';
import Console from './components/Console/Console';
import Toast from './components/UI/Toast';
import AIPanel from './components/AI/AIPanel';
import QuizPanel from './components/Quiz/QuizPanel';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import useEditorStore from './stores/useEditorStore';
import useAIStore from './stores/useAIStore';
import useQuizStore from './stores/useQuizStore';

export default function App() {
  useKeyboardShortcuts();

  const restoreSession = useEditorStore((s) => s.restoreSession);
  const hasUnsavedChanges = useEditorStore((s) => s.hasUnsavedChanges);
  const aiIsOpen = useAIStore((s) => s.isOpen);
  const quizIsOpen = useQuizStore((s) => s.isOpen);

  // ─── Sidebar resize ──────────────────────────────────────────
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const sidebarRef = useRef(null);

  // ─── Console resize ──────────────────────────────────────────
  const [consoleHeight, setConsoleHeight] = useState(220);
  const [isResizingConsole, setIsResizingConsole] = useState(false);
  const consoleContainerRef = useRef(null);

  // ─── Sidebar collapse ────────────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Restore session on mount
  const restoreDone = useRef(false);
  useEffect(() => {
    if (!restoreDone.current) {
      restoreDone.current = true;
      restoreSession();
    }
  }, [restoreSession]);

  // Warn on unsaved changes when closing browser
  useEffect(() => {
    const handler = (e) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  // ─── Mouse resize handlers ───────────────────────────────────
  const handleSidebarMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizingSidebar(true);
  }, []);

  const handleConsoleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizingConsole(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingSidebar) {
        const newWidth = Math.max(180, Math.min(500, e.clientX));
        setSidebarWidth(newWidth);
      }
      if (isResizingConsole && consoleContainerRef.current) {
        const containerRect = consoleContainerRef.current.getBoundingClientRect();
        const newHeight = Math.max(100, Math.min(500, containerRect.bottom - e.clientY));
        setConsoleHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      setIsResizingConsole(false);
    };

    if (isResizingSidebar || isResizingConsole) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isResizingSidebar ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingSidebar, isResizingConsole]);

  return (
    <div className="h-screen flex flex-col bg-bg text-text overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {!sidebarCollapsed && (
          <>
            <div
              ref={sidebarRef}
              className="bg-surface border-r border-border overflow-hidden shrink-0"
              style={{ width: sidebarWidth }}
            >
              <FileTree />
            </div>

            {/* Sidebar Resize Handle */}
            <div
              className={`resize-handle-h ${isResizingSidebar ? 'active' : ''}`}
              onMouseDown={handleSidebarMouseDown}
            />
          </>
        )}

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute left-0 bottom-3 z-20 p-1.5 bg-surface border border-border 
                     rounded-r-lg text-text-muted hover:text-text hover:bg-surface-2 transition-all"
          style={{ left: sidebarCollapsed ? 0 : sidebarWidth + 4 }}
          title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path
              d={sidebarCollapsed ? 'M4 2L8 6L4 10' : 'M8 2L4 6L8 10'}
              stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Editor + Console */}
        <div className="flex flex-col flex-1 overflow-hidden" ref={consoleContainerRef}>
          {/* Tabs */}
          <TabBar />

          {/* Breadcrumb */}
          <Breadcrumb />

          {/* Editor */}
          <CodeEditor />

          {/* Console Resize Handle */}
          <div
            className={`resize-handle-v ${isResizingConsole ? 'active' : ''}`}
            onMouseDown={handleConsoleMouseDown}
          />

          {/* Console */}
          <div
            className="shrink-0 border-t border-border overflow-hidden"
            style={{ height: consoleHeight }}
          >
            <Console />
          </div>
        </div>

        {/* AI Panel */}
        {aiIsOpen && <AIPanel />}

        {/* Quiz Panel */}
        {quizIsOpen && <QuizPanel />}
      </div>

      {/* Overlays */}
      <FileSearch />
      <Toast />
    </div>
  );
}
