import { useEffect, useRef } from 'react';
import useEditorStore from '../stores/useEditorStore';
import useConsoleStore from '../stores/useConsoleStore';
import useToastStore from '../stores/useToastStore';

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
      // We allow Monaco editor's textarea (which has class 'inputarea') to be intercepted for Custom overrides like Ctrl+S
      const tag = e.target.tagName;
      const isMonaco = e.target.classList.contains('inputarea');
      
      if (!e.ctrlKey && !e.metaKey) return; // We only care about global hotkeys here

      if ((tag === 'INPUT' || tag === 'SELECT' || (tag === 'TEXTAREA' && !isMonaco))) {
        return;
      }

      const key = e.key.toLowerCase();


      const { saveActiveFile, getActiveTabData, closeTab, activeTab, setShowFileSearch, runCode, addToast } = refs.current;

      // Ctrl+S → Save
      if ((e.ctrlKey || e.metaKey) && key === 's') {
        e.preventDefault();
        const saved = await saveActiveFile();
        if (saved) addToast('File saved', 'success');
      }

      // Ctrl+Enter → Run code
      if ((e.ctrlKey || e.metaKey) && key === 'enter') {
        e.preventDefault();
        const tab = getActiveTabData();
        if (tab) {
          runCode(tab.content);
        }
      }

      // Ctrl+P → File search
      if ((e.ctrlKey || e.metaKey) && key === 'p') {
        e.preventDefault();
        setShowFileSearch(true);
      }

      // Ctrl+W → Close tab
      if ((e.ctrlKey || e.metaKey) && key === 'w') {
        e.preventDefault();
        if (activeTab) closeTab(activeTab);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
