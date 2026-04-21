import useEditorStore from '../../stores/useEditorStore';
import useQuizStore from '../../stores/useQuizStore';
import { getFileIcon } from '../../utils/fileIcons';
import { QUIZ_TAB_ID } from '../../stores/useQuizStore';

export default function TabBar() {
  const openTabs = useEditorStore((s) => s.openTabs);
  const activeTab = useEditorStore((s) => s.activeTab);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const closeTab = useEditorStore((s) => s.closeTab);
  const resetSession = useQuizStore((s) => s.resetSession);

  if (openTabs.length === 0) return null;

  const handleClose = (tab) => {
    if (tab.isQuiz) {
      // Closing the quiz tab resets the whole session
      resetSession();
    } else {
      closeTab(tab.path);
    }
  };

  return (
    <div
      className="flex items-center bg-surface border-b border-border overflow-x-auto shrink-0 no-select"
      style={{ scrollbarWidth: 'thin' }}
    >
      {openTabs.map((tab) => {
        const isActive = tab.path === activeTab;
        const isQuiz = tab.isQuiz === true;

        return (
          <div
            key={tab.path}
            className={`group flex items-center gap-1.5 px-3 py-2 text-[13px] cursor-pointer
                        border-r border-border shrink-0 transition-colors relative
              ${isActive
                ? 'bg-bg text-text'
                : 'bg-surface text-text-muted hover:text-text hover:bg-surface-2'
              }`}
            onClick={() => setActiveTab(tab.path)}
            onMouseDown={(e) => {
              if (e.button === 1) {
                e.preventDefault();
                handleClose(tab);
              }
            }}
          >
            {/* Active indicator — green for quiz, accent for files */}
            {isActive && (
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: isQuiz ? 'linear-gradient(90deg,#10b981,#0d9488)' : 'var(--color-accent)' }}
              />
            )}

            {/* Icon */}
            <span className="shrink-0 flex items-center">
              {isQuiz ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke={isActive ? '#10b981' : 'currentColor'} strokeWidth="2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              ) : (
                getFileIcon(tab.name)
              )}
            </span>

            {/* Tab name */}
            <span
              className={`truncate max-w-[140px] ${isQuiz && isActive ? 'text-emerald-400 font-medium' : ''}`}
            >
              {tab.name}
            </span>

            {/* Dirty indicator (not for quiz tabs) */}
            {!isQuiz && tab.isDirty && (
              <span className="w-2 h-2 rounded-full bg-accent shrink-0" title="Unsaved changes" />
            )}

            {/* Close button */}
            <button
              className={`shrink-0 w-5 h-5 rounded flex items-center justify-center
                         transition-colors ml-1 invisible group-hover:visible
                         hover:bg-surface-3 text-text-muted hover:text-text`}
              onClick={(e) => {
                e.stopPropagation();
                handleClose(tab);
              }}
              title={isQuiz ? 'End quiz' : 'Close tab'}
            >
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
