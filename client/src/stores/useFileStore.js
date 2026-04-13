import { create } from 'zustand';
import { api } from '../utils/api';

const useFileStore = create((set, get) => ({
  tree: [],
  loading: false,
  expandedFolders: JSON.parse(localStorage.getItem('dsa-expanded-folders') || '["DSA"]'),
  selectedPath: '', // Track the currently selected node path

  setSelectedPath: (path) => set({ selectedPath: path }),

  fetchTree: async () => {
    set({ loading: true });
    try {
      const data = await api.get('/api/files/tree');
      set({ tree: data.tree, loading: false });
    } catch (err) {
      console.error('Failed to fetch file tree:', err);
      set({ loading: false });
    }
  },

  toggleFolder: (path) => {
    set((state) => {
      const expanded = state.expandedFolders.includes(path)
        ? state.expandedFolders.filter((f) => f !== path)
        : [...state.expandedFolders, path];
      localStorage.setItem('dsa-expanded-folders', JSON.stringify(expanded));
      return { expandedFolders: expanded };
    });
  },

  createNode: async (parentPath, name, type) => {
    const path = parentPath ? `${parentPath}/${name}` : name;
    try {
      await api.post('/api/files/create', { path, type });
      await get().fetchTree();
      return { success: true, path };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  deleteNode: async (path) => {
    try {
      await api.del('/api/files/delete', { path });
      await get().fetchTree();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  renameNode: async (oldPath, newName) => {
    const parts = oldPath.split('/');
    parts[parts.length - 1] = newName;
    const newPath = parts.join('/');
    try {
      await api.post('/api/files/rename', { oldPath, newPath });
      await get().fetchTree();
      return { success: true, newPath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getAllFiles: () => {
    const files = [];
    function walk(nodes) {
      for (const node of nodes) {
        if (node.type === 'file') files.push(node);
        if (node.children) walk(node.children);
      }
    }
    walk(get().tree);
    return files;
  },
}));

export default useFileStore;
