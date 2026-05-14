// useKeyboardShortcuts.js
import { useEffect, useRef, useState } from 'react';
import useEditorStore from '../stores/useEditorStore';
import useConsoleStore from '../stores/useConsoleStore';
import useToastStore from '../stores/useToastStore';

export const DEFAULT_SHORTCUTS = {
  save: 's',
  run: 'enter',
  search: 'p',
  close: 'w',
  format: 'f', // Ctrl + Shift + F
};

export default function useKeyboardShortcuts() {
  const saveActiveFile = useEditorStore((s) => s.saveActiveFile);
  const getActiveTabData = useEditorStore((s) => s.getActiveTabData);
  const closeTab = useEditorStore((s) => s.closeTab);
  const activeTab = useEditorStore((s) => s.activeTab);
  const setShowFileSearch = useEditorStore((s) => s.setShowFileSearch);
  const runCode = useConsoleStore((s) => s.runCode);
  const addToast = useToastStore((s) => s.addToast);

  // Use refs to avoid stale closures
  const refs = useRef({});
  refs.current = { saveActiveFile, getActiveTabData, closeTab, activeTab, setShowFileSearch, runCode, addToast };

  useEffect(() => {
    const handler = async (e) => {
      // Don't intercept events when user is typing in a plain input field
      const tag = e.target.tagName;
      const isMonaco = e.target.classList.contains('inputarea');
      
      if (!e.ctrlKey && !e.metaKey) return; 

      if ((tag === 'INPUT' || tag === 'SELECT' || (tag === 'TEXTAREA' && !isMonaco))) {
        return;
      }

      const key = e.key.toLowerCase();
      const customShortcuts = JSON.parse(localStorage.getItem('dsa-shortcuts') || '{}');
      const getShortcut = (action, defaultKey) => (customShortcuts[action] || defaultKey).toLowerCase();

      const kSave = getShortcut('save', DEFAULT_SHORTCUTS.save);
      const kRun = getShortcut('run', DEFAULT_SHORTCUTS.run);
      const kSearch = getShortcut('search', DEFAULT_SHORTCUTS.search);
      const kClose = getShortcut('close', DEFAULT_SHORTCUTS.close);
      const kFormat = getShortcut('format', DEFAULT_SHORTCUTS.format);

      const { saveActiveFile, getActiveTabData, closeTab, activeTab, setShowFileSearch, runCode, addToast } = refs.current;

      // Format (Ctrl+Shift+F or custom key requiring shift)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && key === kFormat) {
        e.preventDefault();
        window.dispatchEvent(new Event('editor:format'));
        return; // Prevent triggering other single key shortcuts
      }

      // Run code (Ctrl+Enter)
      if ((e.ctrlKey || e.metaKey) && key === kRun) {
        e.preventDefault();
        const tab = getActiveTabData();
        if (tab) {
          runCode(tab.content);
        }
      }

      // Save
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && key === kSave) {
        e.preventDefault();
        const saved = await saveActiveFile();
        if (saved) addToast('File saved', 'success');
      }

      // File search
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && key === kSearch) {
        e.preventDefault();
        setShowFileSearch(true);
      }

      // Close tab
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && key === kClose) {
        e.preventDefault();
        if (activeTab) closeTab(activeTab);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
