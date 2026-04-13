import useEditorStore from '../../stores/useEditorStore';
import { getFileIcon } from '../../utils/fileIcons';

export default function TabBar() {
  const openTabs = useEditorStore((s) => s.openTabs);
  const activeTab = useEditorStore((s) => s.activeTab);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const closeTab = useEditorStore((s) => s.closeTab);

  if (openTabs.length === 0) return null;

  // if (isAlreadyOpen) {
  //   return { activeTab: file.path };
  // }

  return (
    <div className="flex items-center bg-surface border-b border-border overflow-x-auto shrink-0 no-select"
         style={{ scrollbarWidth: 'thin' }}>
      {openTabs.map((tab) => {
        const isActive = tab.path === activeTab;
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
              // Middle click to close
              if (e.button === 1) {
                e.preventDefault();
                closeTab(tab.path);
              }
            }}
          >
            
            {/* Active indicator */}
            {isActive && (
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent" />
            )}

            {/* File icon */}
            <span className="shrink-0 flex items-center">
              {getFileIcon(tab.name)}
            </span>

            {/* File name */}
            <span className="truncate max-w-[120px]">{tab.name}</span>

            {/* Dirty indicator */}
            {tab.isDirty && (
              <span className="w-2 h-2 rounded-full bg-accent shrink-0" title="Unsaved changes" />
            )}

            {/* Close button */}
            <button
              className={`shrink-0 w-5 h-5 rounded flex items-center justify-center
                         transition-colors ml-1
                         ${tab.isDirty && !isActive ? 'visible' : 'invisible group-hover:visible'}
                         hover:bg-surface-3 text-text-muted hover:text-text`}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.path);
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
