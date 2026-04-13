import { useEffect, useRef } from 'react';
import { debounce } from '../utils/debounce';
import useEditorStore from '../stores/useEditorStore';

export default function useAutoSave() {
  const saveFile = useEditorStore((s) => s.saveFile);
  const openTabs = useEditorStore((s) => s.openTabs);
  const debouncedSaveRef = useRef(null);

  useEffect(() => {
    debouncedSaveRef.current = debounce((path) => {
      saveFile(path);
    }, 1500);

    return () => {
      if (debouncedSaveRef.current) debouncedSaveRef.current.cancel();
    };
  }, [saveFile]);

  // Return the debounced save function so components can trigger it
  return (path) => {
    if (debouncedSaveRef.current) debouncedSaveRef.current(path);
  };
}
