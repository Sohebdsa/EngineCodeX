import { useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import useEditorStore from '../../stores/useEditorStore';
import useThemeStore from '../../stores/useThemeStore';
import useAutoSave from '../../hooks/useAutoSave';
import { themes, defineMonacoThemes } from '../../themes/themes';
import QuizMain from '../Quiz/QuizMain';
import { QUIZ_TAB_ID } from '../../stores/useQuizStore';

export default function CodeEditor() {
  // ── ALL hooks must be called unconditionally at the top ──────────
  const activeTab    = useEditorStore((s) => s.activeTab);
  const openTabs     = useEditorStore((s) => s.openTabs);
  const updateContent = useEditorStore((s) => s.updateContent);
  const theme        = useThemeStore((s) => s.theme);
  const editorRef    = useRef(null);
  const monacoRef    = useRef(null);
  const autoSave     = useAutoSave();

  const handleMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    defineMonacoThemes(monaco);
    const monacoTheme = themes[theme]?.monacoTheme || 'vs-dark';
    monaco.editor.setTheme(monacoTheme);
    editor.focus();
  }, [theme]);

  const handleChange = useCallback((value) => {
    if (activeTab && value !== undefined) {
      updateContent(activeTab, value);
      autoSave(activeTab);
    }
  }, [activeTab, updateContent, autoSave]);

  // ── Sync Monaco theme when app theme changes ─────────────────────
  if (monacoRef.current) {
    const monacoTheme = themes[theme]?.monacoTheme || 'vs-dark';
    monacoRef.current.editor.setTheme(monacoTheme);
  }

  // ── Conditional renders AFTER all hooks ──────────────────────────

  // Quiz tab → render the quiz UI instead of Monaco
  if (activeTab === QUIZ_TAB_ID) {
    return <QuizMain />;
  }

  const tab = openTabs.find((t) => t.path === activeTab);

  if (!tab) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg text-text-muted gap-4">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-20">
          <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z"/>
        </svg>
        <div className="text-center">
          <p className="text-lg font-medium text-text/50">DSA Playground</p>
          <p className="text-sm mt-1 text-text-muted/60">Open a file from the sidebar to start coding</p>
        </div>
        <div className="flex flex-col gap-1.5 text-xs text-text-muted/50 mt-4">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono">Ctrl+P</kbd>
            <span>Search files</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono">Ctrl+S</kbd>
            <span>Save file</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono">Ctrl+Enter</kbd>
            <span>Run code</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <Editor
        key={tab.path}
        height="100%"
        language={tab.language}
        value={tab.content}
        onChange={handleChange}
        onMount={handleMount}
        theme={themes[theme]?.monacoTheme || 'vs-dark'}
        loading={
          <div className="flex items-center justify-center h-full bg-bg text-text-muted text-sm">
            Loading editor...
          </div>
        }
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          lineNumbers: 'on',
          minimap: { enabled: true, scale: 2, showSlider: 'mouseover' },
          scrollBeyondLastLine: false,
          roundedSelection: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 12, bottom: 12 },
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
          quickSuggestions: true,
          parameterHints: { enabled: true },
          formatOnPaste: true,
          renderWhitespace: 'selection',
          colorDecorators: true,
        }}
      />
    </div>
  );
}
