import { create } from 'zustand';
import { api } from '../utils/api';

const SESSION_KEY = 'dsa-playground-session';

const useEditorStore = create((set, get) => ({
  openTabs: [],
  activeTab: null,
  showFileSearch: false,

  openFile: async (path, name) => {
    const state = get();
    // If already open, just switch to it
    const existing = state.openTabs.find((t) => t.path === path);
    if (existing) {
      set({ activeTab: path });
      get()._saveSession();
      return;
    }

    try {
      const data = await api.post('/api/files/read', { path });
      const ext = name.split('.').pop();
      const langMap = { js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', py: 'python', cpp: 'cpp', c: 'c', java: 'java', json: 'json', md: 'markdown', txt: 'plaintext' };
      const tab = {
        path,
        name,
        content: data.content,
        savedContent: data.content,
        language: langMap[ext] || 'plaintext',
        isDirty: false,
      };
      set((s) => ({
        openTabs: [...s.openTabs, tab],
        activeTab: path,
      }));
      get()._saveSession();
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  },

  closeTab: (path) => {
    const state = get();
    const tab = state.openTabs.find((t) => t.path === path);
    if (tab?.isDirty) {
      if (!window.confirm(`"${tab.name}" has unsaved changes. Close anyway?`)) return;
    }
    const newTabs = state.openTabs.filter((t) => t.path !== path);
    let newActive = state.activeTab;
    if (state.activeTab === path) {
      const idx = state.openTabs.findIndex((t) => t.path === path);
      newActive = newTabs[Math.min(idx, newTabs.length - 1)]?.path || null;
    }
    set({ openTabs: newTabs, activeTab: newActive });
    get()._saveSession();
  },

  setActiveTab: (path) => {
    set({ activeTab: path });
    get()._saveSession();
  },

  updateContent: (path, content) => {
    set((state) => ({
      openTabs: state.openTabs.map((t) =>
        t.path === path
          ? { ...t, content, isDirty: content !== t.savedContent }
          : t
      ),
    }));
  },

  saveFile: async (path) => {
    const tab = get().openTabs.find((t) => t.path === path);
    if (!tab) return false;
    try {
      await api.post('/api/files/write', { path, content: tab.content });
      set((state) => ({
        openTabs: state.openTabs.map((t) =>
          t.path === path ? { ...t, savedContent: t.content, isDirty: false } : t
        ),
      }));
      return true;
    } catch (err) {
      console.error('Failed to save file:', err);
      return false;
    }
  },

  saveActiveFile: async () => {
    const { activeTab } = get();
    if (activeTab) return get().saveFile(activeTab);
    return false;
  },

  getActiveTabData: () => {
    const state = get();
    return state.openTabs.find((t) => t.path === state.activeTab) || null;
  },

  setShowFileSearch: (show) => set({ showFileSearch: show }),

  // Update tab path when files are renamed
  updateTabPath: (oldPath, newPath, newName) => {
    set((state) => ({
      openTabs: state.openTabs.map((t) =>
        t.path === oldPath ? { ...t, path: newPath, name: newName } : t
      ),
      activeTab: state.activeTab === oldPath ? newPath : state.activeTab,
    }));
    get()._saveSession();
  },

  // Remove tab if its file was deleted
  removeTabByPath: (path) => {
    set((state) => {
      const newTabs = state.openTabs.filter((t) => !t.path.startsWith(path));
      let newActive = state.activeTab;
      if (state.activeTab?.startsWith(path)) {
        newActive = newTabs[0]?.path || null;
      }
      return { openTabs: newTabs, activeTab: newActive };
    });
    get()._saveSession();
  },

  // Session restore
  _saveSession: () => {
    const state = get();
    const session = {
      openTabs: state.openTabs.map((t) => ({ path: t.path, name: t.name })),
      activeTab: state.activeTab,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  restoreSession: async () => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const session = JSON.parse(raw);
      if (!session?.openTabs?.length) return;

      // Dedupe tabs by path to prevent duplicates
      const uniqueTabs = Array.from(new Map(session.openTabs.map(tab => [tab.path, tab])).values());

      for (const tab of uniqueTabs) {
        try {
          await get().openFile(tab.path, tab.name);
        } catch (err) {
          console.warn(`Failed to restore tab ${tab.path}:`, err);
        }
      }
      if (session.activeTab) {
        set({ activeTab: session.activeTab });
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
    }
  },

  // Check for unsaved changes (for beforeunload)
  hasUnsavedChanges: () => {
    return get().openTabs.some((t) => t.isDirty);
  },
}));

export default useEditorStore;
