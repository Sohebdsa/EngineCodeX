import { useState, useRef, useEffect } from 'react';
import useFileStore from '../../stores/useFileStore';
import useEditorStore from '../../stores/useEditorStore';
import useToastStore from '../../stores/useToastStore';
import { getFileIcon } from '../../utils/fileIcons';

export default function FileTree() {
  const tree = useFileStore((s) => s.tree);
  const loading = useFileStore((s) => s.loading);
  const fetchTree = useFileStore((s) => s.fetchTree);
  const selectedPath = useFileStore((s) => s.selectedPath);
  const setSelectedPath = useFileStore((s) => s.setSelectedPath);
  const expandedFolders = useFileStore((s) => s.expandedFolders);
  const toggleFolder = useFileStore((s) => s.toggleFolder);
  const [creatingAt, setCreatingAt] = useState(null); // { parentPath, type }

  // Find a node in the tree by path
  const findNode = (nodes, targetPath) => {
    for (const node of nodes) {
      if (node.path === targetPath) return node;
      if (node.children) {
        const found = findNode(node.children, targetPath);
        if (found) return found;
      }
    }
    return null;
  };

  // Get the correct parent path for creating new files/folders
  const getCreateParentPath = () => {
    if (!selectedPath) return '';
    const node = findNode(tree, selectedPath);
    if (!node) return '';
    if (node.type === 'directory') return node.path;
    // For files, use the parent directory
    const parts = selectedPath.split('/');
    parts.pop();
    return parts.join('/');
  };

  const handleNewFile = () => {
    const parentPath = getCreateParentPath();
    // If creating inside a folder, expand it
    if (parentPath && !expandedFolders.includes(parentPath)) {
      toggleFolder(parentPath);
    }
    setCreatingAt({ parentPath, type: 'file' });
  };

  const handleNewFolder = () => {
    const parentPath = getCreateParentPath();
    if (parentPath && !expandedFolders.includes(parentPath)) {
      toggleFolder(parentPath);
    }
    setCreatingAt({ parentPath, type: 'directory' });
  };

  useEffect(() => {
    fetchTree();
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
          Explorer
        </span>
        <div className="flex gap-1">
          <button
            onClick={handleNewFile}
            className="p-1 rounded hover:bg-surface-2 text-text-muted hover:text-text transition-colors"
            title="New File"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </button>
          <button
            onClick={handleNewFolder}
            className="p-1 rounded hover:bg-surface-2 text-text-muted hover:text-text transition-colors"
            title="New Folder"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              <line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </button>
          <button
            onClick={fetchTree}
            className="p-1 rounded hover:bg-surface-2 text-text-muted hover:text-text transition-colors"
            title="Refresh"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23,4 23,10 17,10" />
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1 text-[13px]">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-text-muted text-xs">
            Loading...
          </div>
        ) : tree.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-text-muted text-xs gap-2">
            <span>No files yet</span>
          </div>
        ) : (
          <>
            {creatingAt?.parentPath === '' && (
              <InlineCreate
                parentPath=""
                type={creatingAt.type}
                onDone={() => setCreatingAt(null)}
                depth={0}
              />
            )}
            {tree.map((node) => (
              <FileNode
                key={node.path}
                node={node}
                depth={0}
                creatingAt={creatingAt}
                setCreatingAt={setCreatingAt}
                setSelectedPath={setSelectedPath}
                selectedPath={selectedPath}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function FileNode({ node, depth, creatingAt, setCreatingAt, setSelectedPath, selectedPath }) {
  const toggleFolder = useFileStore((s) => s.toggleFolder);
  const expandedFolders = useFileStore((s) => s.expandedFolders);
  const deleteNode = useFileStore((s) => s.deleteNode);
  const renameNode = useFileStore((s) => s.renameNode);
  const openFile = useEditorStore((s) => s.openFile);
  const activeTab = useEditorStore((s) => s.activeTab);
  const removeTabByPath = useEditorStore((s) => s.removeTabByPath);
  const updateTabPath = useEditorStore((s) => s.updateTabPath);
  const addToast = useToastStore((s) => s.addToast);

  const [contextMenu, setContextMenu] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameName, setRenameName] = useState(node.name);

  const isExpanded = expandedFolders.includes(node.path);
  const isActive = activeTab === node.path;
  const isDir = node.type === 'directory';

  const handleClick = () => {
    setSelectedPath(node.path);
    if (isDir) {
      toggleFolder(node.path);
    } else {
      openFile(node.path, node.name);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleDelete = async () => {
    setContextMenu(null);
    if (!window.confirm(`Delete "${node.name}"?`)) return;
    const result = await deleteNode(node.path);
    if (result.success) {
      removeTabByPath(node.path);
      addToast(`Deleted "${node.name}"`, 'info');
    } else {
      addToast(`Failed to delete: ${result.error}`, 'error');
    }
  };

  const handleRename = () => {
    setContextMenu(null);
    setIsRenaming(true);
    setRenameName(node.name);
  };

  const submitRename = async () => {
    setIsRenaming(false);
    if (renameName === node.name || !renameName.trim()) return;
    const result = await renameNode(node.path, renameName.trim());
    if (result.success) {
      updateTabPath(node.path, result.newPath, renameName.trim());
      addToast(`Renamed to "${renameName.trim()}"`, 'success');
    } else {
      addToast(`Failed to rename: ${result.error}`, 'error');
    }
  };

  return (
    <>
      <div
        className={`flex items-center gap-1 px-2 py-[3px] cursor-pointer group transition-colors
          ${isActive ? 'bg-accent/10 text-accent' : selectedPath === node.path ? 'bg-surface-2 text-text' : 'hover:bg-surface-2 text-text'}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {/* Expand arrow for folders */}
        {isDir && (
          <svg
            width="12" height="12" viewBox="0 0 12 12"
            className={`shrink-0 text-text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          >
            <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        )}
        {!isDir && <span className="w-3 shrink-0" />}

        {/* Icon */}
        <span className="shrink-0 flex items-center">
          {getFileIcon(node.name, isDir, isExpanded)}
        </span>

        {/* Name */}
        {isRenaming ? (
          <input
            autoFocus
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') submitRename();
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            onKeyUp={(e) => e.stopPropagation()}
            className="flex-1 bg-surface-2 border border-accent rounded px-1 py-0 text-xs text-text outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate-text text-[13px]">{node.name}</span>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isDir={isDir}
          onClose={() => setContextMenu(null)}
          onRename={handleRename}
          onDelete={handleDelete}
          onNewFile={() => {
            setContextMenu(null);
            if (isDir) {
              if (!isExpanded) toggleFolder(node.path);
              setCreatingAt({ parentPath: node.path, type: 'file' });
            }
          }}
          onNewFolder={() => {
            setContextMenu(null);
            if (isDir) {
              if (!isExpanded) toggleFolder(node.path);
              setCreatingAt({ parentPath: node.path, type: 'directory' });
            }
          }}
        />
      )}

      {/* Children */}
      {isDir && isExpanded && (
        <div>
          {creatingAt?.parentPath === node.path && (
            <InlineCreate
              parentPath={node.path}
              type={creatingAt.type}
              onDone={() => setCreatingAt(null)}
              depth={depth + 1}
            />
          )}
          {node.children?.map((child) => (
            <FileNode
              key={child.path}
              node={child}
              depth={depth + 1}
              creatingAt={creatingAt}
              setCreatingAt={setCreatingAt}
              setSelectedPath={setSelectedPath}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </>
  );
}

function InlineCreate({ parentPath, type, onDone, depth }) {
  const createNode = useFileStore((s) => s.createNode);
  const openFile = useEditorStore((s) => s.openFile);
  const addToast = useToastStore((s) => s.addToast);
  const [name, setName] = useState('');

  const submit = async () => {
    if (!name.trim()) {
      onDone();
      return;
    }
    const result = await createNode(parentPath, name.trim(), type);
    if (result.success) {
      addToast(`Created "${name.trim()}"`, 'success');
      if (type === 'file') {
        openFile(result.path, name.trim());
      }
    } else {
      addToast(`Failed: ${result.error}`, 'error');
    }
    onDone();
  };

  return (
    <div
      className="flex items-center gap-1 px-2 py-[3px]"
      style={{ paddingLeft: `${depth * 16 + 8 + 15}px` }}
    >
      <span className="shrink-0 flex items-center">
        {getFileIcon(name || (type === 'directory' ? '' : '.txt'), type === 'directory')}
      </span>
      <input
        autoFocus
        placeholder={type === 'directory' ? 'Folder name...' : 'File name...'}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={submit}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') onDone();
        }}
        onKeyUp={(e) => e.stopPropagation()}
        className="flex-1 bg-surface-2 border border-accent rounded px-1.5 py-0.5 text-xs text-text outline-none placeholder:text-text-muted/50"
      />
    </div>
  );
}

function ContextMenu({ x, y, isDir, onClose, onRename, onDelete, onNewFile, onNewFolder }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Adjust position if menu would overflow
  const style = { left: x, top: y };

  return (
    <div className="context-menu" style={style} ref={ref}>
      {isDir && (
        <>
          <div className="context-menu-item" onClick={onNewFile}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
            </svg>
            New File
          </div>
          <div className="context-menu-item" onClick={onNewFolder}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              <line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
            </svg>
            New Folder
          </div>
          <div className="context-menu-separator" />
        </>
      )}
      <div className="context-menu-item" onClick={onRename}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Rename
      </div>
      <div className="context-menu-separator" />
      <div className="context-menu-item danger" onClick={onDelete}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
        Delete
      </div>
    </div>
  );
}
