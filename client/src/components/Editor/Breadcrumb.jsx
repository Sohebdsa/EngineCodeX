import useEditorStore from '../../stores/useEditorStore';
import useFileStore from '../../stores/useFileStore';
import { getFileIcon, getLanguageFromFile } from '../../utils/fileIcons';

export default function Breadcrumb() {
  const activeTab = useEditorStore((s) => s.activeTab);
  const openTabs = useEditorStore((s) => s.openTabs);
  const toggleFolder = useFileStore((s) => s.toggleFolder);
  const expandedFolders = useFileStore((s) => s.expandedFolders);

  const tab = openTabs.find((t) => t.path === activeTab);
  if (!tab) return null;

  const segments = tab.path.split('/');
  const fileName = segments[segments.length - 1];
  const folderSegments = segments.slice(0, -1);

  const handleFolderClick = (index) => {
    const path = folderSegments.slice(0, index + 1).join('/');
    if (!expandedFolders.includes(path)) {
      toggleFolder(path);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-1 bg-bg border-b border-border text-[12px] shrink-0 no-select">
      <div className="flex items-center gap-1 min-w-0">
        {folderSegments.map((segment, i) => (
          <span key={i} className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => handleFolderClick(i)}
              className="text-text-muted hover:text-accent transition-colors"
            >
              {segment}
            </button>
            <svg width="10" height="10" viewBox="0 0 10 10" className="text-text-muted/50">
              <path d="M3 2L7 5L3 8" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            </svg>
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-text">
          <span className="shrink-0 flex items-center">{getFileIcon(fileName)}</span>
          <span className="font-medium">{fileName}</span>
        </span>
      </div>
      <span className="text-text-muted text-[11px] shrink-0 ml-4">
        {getLanguageFromFile(fileName)}
      </span>
    </div>
  );
}
