import { create } from 'zustand';
import { api } from '../utils/api';

const useAIStore = create((set, get) => ({
  isOpen: false,
  messages: [],
  isLoading: false,
  error: null,
  includeCode: true,
  apiKeys: JSON.parse(localStorage.getItem('dsa-api-keys') || '{}'),
  apiProviders: JSON.parse(localStorage.getItem('dsa-api-providers') || '{}'),
  apiUrls: JSON.parse(localStorage.getItem('dsa-api-urls') || '{}'),
  model: localStorage.getItem('dsa-gemini-model') || 'gemini-2.0-flash',

  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (isOpen) => set({ isOpen }),
  setIncludeCode: (includeCode) => set({ includeCode }),
  setApiConfig: (apiKeys, apiProviders, apiUrls) => {
    localStorage.setItem('dsa-api-keys', JSON.stringify(apiKeys));
    localStorage.setItem('dsa-api-providers', JSON.stringify(apiProviders));
    localStorage.setItem('dsa-api-urls', JSON.stringify(apiUrls));
    set({ apiKeys, apiProviders, apiUrls });
  },
  setModel: (model) => {
    localStorage.setItem('dsa-gemini-model', model);
    set({ model });
  },

  sendMessage: async (message, code, language) => {
    const state = get();
    if (state.isLoading || !message.trim()) return;

    // Add user message to history
    const userMsg = { role: 'user', content: message, timestamp: Date.now() };
    set((s) => ({
      messages: [...s.messages, userMsg],
      isLoading: true,
      error: null,
    }));

    try {
      // Build history (last 10 messages for context window)
      const history = get().messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const modelKeys = state.apiKeys[state.model] || [];
      // Even if no keys are configured, try once with an empty string so the backend can fall back to the .env key
      const keysToTry = modelKeys.length > 0 ? modelKeys : [''];

      let success = false;
      let lastError = null;
      let data = null;

      for (let i = 0; i < keysToTry.length; i++) {
        try {
          const body = {
            message,
            history: history.slice(0, -1),
            ...(state.includeCode && code ? { code, language } : {}),
            apiKey: keysToTry[i],
            model: state.model,
            provider: state.apiProviders[state.model] || 'google',
            baseUrl: state.apiUrls[state.model] || '',
          };

          data = await api.post('/api/ai/chat', body);
          success = true;
          break; // Success! Exit the retry loop
        } catch (err) {
          lastError = err;
          // Only retry if it's a 429 Too Many Requests (Quota Exceeded)
          if (err.status === 429 || (err.message && err.message.includes('429'))) {
            continue; // Move on to next key
          } else {
            break; // Stop retrying on other errors like 400 Bad Request
          }
        }
      }

      if (!success) {
        throw lastError || new Error('All configured keys for this model are exhausted. Please add new keys or switch models.');
      }

      const aiMsg = {
        role: 'assistant',
        content: data.response,
        timestamp: Date.now(),
      };

      set((s) => ({
        messages: [...s.messages, aiMsg],
        isLoading: false,
      }));
    } catch (err) {
      set({
        isLoading: false,
        error: err.message,
      });

      // Add error as AI message so user can see it
      const isQuotaError = err.status === 429 || (err.message && err.message.includes('429'));
      const errorMsg = {
        role: 'assistant',
        content: isQuotaError ? `❌ **Quota Exceeded:** You have run out of credits for the selected model. Go to settings (⚙️) to add different API keys or swap to another model.` : `❌ **Error:** ${err.message}`,
        timestamp: Date.now(),
        isError: true,
      };
      set((s) => ({
        messages: [...s.messages, errorMsg],
      }));
    }
  },

  clearChat: () => set({ messages: [], error: null }),
}));

export default useAIStore;
