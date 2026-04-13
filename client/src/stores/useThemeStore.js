import { create } from 'zustand';

const useThemeStore = create((set) => ({
  theme: localStorage.getItem('dsa-playground-theme') || 'dark',
  
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dsa-playground-theme', theme);
    // Briefly add transition class for smooth switch
    document.body.classList.add('theme-transition');
    setTimeout(() => document.body.classList.remove('theme-transition'), 300);
    set({ theme });
  },
}));

export default useThemeStore;
