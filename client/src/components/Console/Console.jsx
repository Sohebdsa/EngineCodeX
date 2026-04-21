import { useRef, useState } from 'react';
import useConsoleStore from '../../stores/useConsoleStore';
import useEditorStore from '../../stores/useEditorStore';
import useToastStore from '../../stores/useToastStore';

export default function Console() {
  const output = useConsoleStore((s) => s.output);
  const error = useConsoleStore((s) => s.error);
  const executionTime = useConsoleStore((s) => s.executionTime);
  const isRunning = useConsoleStore((s) => s.isRunning);
  const input = useConsoleStore((s) => s.input);
  const setInput = useConsoleStore((s) => s.setInput);
  const runCode = useConsoleStore((s) => s.runCode);
  const stopCode = useConsoleStore((s) => s.stopCode);
  const clearConsole = useConsoleStore((s) => s.clearConsole);
  const getActiveTabData = useEditorStore((s) => s.getActiveTabData);
  const addToast = useToastStore((s) => s.addToast);

  const [activeSection, setActiveSection] = useState('output'); // 'output' | 'input'
  const outputRef = useRef(null);

  const handleRun = () => {
    const tab = getActiveTabData();
    if (!tab) {
      addToast('No file open to run', 'warning');
      return;
    }
    if (tab.language !== 'javascript') {
      addToast('Only JavaScript can be executed in the browser', 'warning');
      return;
    }
    runCode(tab.content);
  };

  const hasOutput = output || error;

  return (
    <div className="flex flex-col h-full bg-surface overflow-hidden">
      {/* Console Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border shrink-0 no-select">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSection('output')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors
              ${activeSection === 'output' ? 'bg-surface-2 text-text' : 'text-text-muted hover:text-text'}`}
          >
            Output
            {error && <span className="inline-block w-1.5 h-1.5 rounded-full bg-error ml-1.5" />}
          </button>
          <button
            onClick={() => setActiveSection('input')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors
              ${activeSection === 'input' ? 'bg-surface-2 text-text' : 'text-text-muted hover:text-text'}`}
          >
            Input
          </button>
        </div>

        <div className="flex items-center gap-2">
          {executionTime && (
            <span className="text-[11px] text-text-muted font-mono px-2 py-0.5 rounded bg-surface-2">
              {executionTime}ms
            </span>
          )}
          <button
            onClick={clearConsole}
            className="p-1 rounded text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
            title="Clear console"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6"/>
            </svg>
          </button>
          {isRunning ? (
            <button
              onClick={stopCode}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all bg-error/90 text-white hover:bg-error"
              title="Stop Execution"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" ry="2" />
              </svg>
              Stop
            </button>
          ) : (
            <button
              onClick={handleRun}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all bg-success/90 text-white hover:bg-success"
              title="Run (Ctrl+Enter)"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              Run
            </button>
          )}
        </div>
      </div>

      {/* Console Body */}
      <div className="flex-1 overflow-hidden">
        {activeSection === 'output' ? (
          <div ref={outputRef} className="h-full overflow-y-auto p-3 font-mono text-[13px] leading-relaxed">
            {isRunning ? (
              <div className="flex items-center gap-2 text-text-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" className="animate-spin-slow">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="31.4" strokeLinecap="round"/>
                </svg>
                <span className="text-xs">Executing code...</span>
              </div>
            ) : !hasOutput ? (
              <div className="text-text-muted/50 text-xs">
                Run your code to see output here (Ctrl+Enter)
              </div>
            ) : (
              <>
                {output && (
                  <pre className="text-text whitespace-pre-wrap break-words">{output}</pre>
                )}
                {error && (
                  <pre className="text-error whitespace-pre-wrap break-words mt-2">
                    <span className="inline-flex items-center gap-1 bg-error/10 px-2 py-0.5 rounded text-xs font-semibold mb-1">
                      ✕ Error
                    </span>
                    {'\n'}{error}
                  </pre>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="h-full p-3 flex flex-col gap-2">
            <label className="text-xs text-text-muted font-medium">
              Custom Input (stdin)
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your test case input here..."
              className="flex-1 bg-bg border border-border rounded-lg p-3 font-mono text-sm 
                         text-text resize-none outline-none focus:border-accent/50 transition-colors
                         placeholder:text-text-muted/40"
            />
          </div>
        )}
      </div>
    </div>
  );
}
