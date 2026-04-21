import { useState, useRef, useEffect } from 'react';
import ThemeSwitcher from '../UI/ThemeSwitcher';
import useConsoleStore from '../../stores/useConsoleStore';
import useEditorStore from '../../stores/useEditorStore';
import useToastStore from '../../stores/useToastStore';
import useAIStore from '../../stores/useAIStore';
import useQuizStore from '../../stores/useQuizStore';

export default function Navbar() {
  const runCode = useConsoleStore((s) => s.runCode);
  const stopCode = useConsoleStore((s) => s.stopCode);
  const isRunning = useConsoleStore((s) => s.isRunning);
  const getActiveTabData = useEditorStore((s) => s.getActiveTabData);
  const setShowFileSearch = useEditorStore((s) => s.setShowFileSearch);
  const saveActiveFile = useEditorStore((s) => s.saveActiveFile);
  const addToast = useToastStore((s) => s.addToast);
  const toggleAI = useAIStore((s) => s.togglePanel);
  const aiIsOpen = useAIStore((s) => s.isOpen);
  const quizIsOpen = useQuizStore((s) => s.isOpen);
  const openQuizTab = useQuizStore((s) => s._openQuizTab);
  const setQuizOpen = useQuizStore((s) => s.setOpen);

  const handlePractice = () => {
    openQuizTab();
    setQuizOpen(true);
  };
  const apiKeys = useAIStore((s) => s.apiKeys) || {};
  const apiProviders = useAIStore((s) => s.apiProviders) || {};
  const apiUrls = useAIStore((s) => s.apiUrls) || {};
  const setApiConfig = useAIStore((s) => s.setApiConfig);
  const aiModel = useAIStore((s) => s.model);
  const setAiModel = useAIStore((s) => s.setModel);

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('ai'); // 'ai' | 'shortcuts'
  const [modelInput, setModelInput] = useState('');
  const [localKeys, setLocalKeys] = useState({});
  const [localProviders, setLocalProviders] = useState({});
  const [localUrls, setLocalUrls] = useState({});
  const [showKey, setShowKey] = useState(false);
  const [shortcuts, setShortcuts] = useState({});
  const modalRef = useRef(null);

  // Initialize input when modal opens
  useEffect(() => {
    if (showApiKeyModal) {
      const activeModel = modelInput || aiModel || 'gemini-2.0-flash';
      if (!modelInput) setModelInput(activeModel);

      const initKeys = {};
      const initProviders = {};
      const initUrls = {};
      for (const m in apiKeys) {
        if (apiKeys[m] && apiKeys[m].length > 0) initKeys[m] = [...apiKeys[m]];
      }
      for (const m in apiProviders) initProviders[m] = apiProviders[m];
      for (const m in apiUrls) initUrls[m] = apiUrls[m];

      setLocalKeys(initKeys);
      setLocalProviders(initProviders);
      setLocalUrls(initUrls);
      setShowKey(false);
      setShortcuts(JSON.parse(localStorage.getItem('dsa-shortcuts') || '{"save":"s","run":"enter","search":"p","close":"w","format":"f"}'));
    }
  }, [showApiKeyModal]);

  // Close modal on click outside
  useEffect(() => {
    if (!showApiKeyModal) return;
    function handleClick(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowApiKeyModal(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showApiKeyModal]);

  const handleRun = () => {
    const tab = getActiveTabData();
    if (!tab) {
      addToast('No file open to run', 'warning');
      return;
    }
    if (tab.language !== 'javascript') {
      addToast('Only JavaScript files can be executed in the browser', 'warning');
      return;
    }
    runCode(tab.content);
  };

  const handleSave = async () => {
    const saved = await saveActiveFile();
    if (saved) addToast('File saved', 'success');
  };

  const handleSaveApiKey = () => {
    const finalKeys = { ...apiKeys };
    const finalProviders = { ...apiProviders };
    const finalUrls = { ...apiUrls };
    let savedCount = 0;

    for (const m in localKeys) {
      const valid = localKeys[m] ? localKeys[m].map(k => k.trim()).filter(k => k) : [];
      if (valid.length > 0) {
        finalKeys[m] = valid;
        if (localProviders[m]) finalProviders[m] = localProviders[m];
        if (localUrls[m]) finalUrls[m] = localUrls[m].trim();
        if (m === modelInput) savedCount = valid.length;
      } else {
        delete finalKeys[m];
      }
    }

    setApiConfig(finalKeys, finalProviders, finalUrls);
    setAiModel(modelInput);
    setShowApiKeyModal(false);

    if (savedCount > 0) {
      addToast(`Saved config for ${modelInput}`, 'success');
    } else {
      addToast(`Ready. Make sure to provide keys before using AI.`, 'info');
    }
  };

  const handleSaveShortcuts = () => {
    localStorage.setItem('dsa-shortcuts', JSON.stringify(shortcuts));
    addToast('Shortcuts saved', 'success');
    setShowApiKeyModal(false);
  };

  return (
    <nav className="drag-region h-11 flex items-center justify-between px-4 bg-surface border-b border-border no-select shrink-0">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">

          <div className="w-8 h-8 flex items-center justify-center relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-slate-700 dark:text-slate-300">
              {/* Mechanical V8 Engine Block Profile */}
              <g stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
                {/* Main V-Block */}
                <path d="M5 8L9.5 20h5L19 8h-4l-3 6-3-6z" fill="currentColor" fillOpacity="0.1" />

                {/* Left Valve Cover */}
                <path d="M3 6l4-3 2.5 3-4 3z" fill="currentColor" />
                {/* Right Valve Cover */}
                <path d="M21 6l-4-3-2.5 3 4 3z" fill="currentColor" />

                {/* Crankshaft Pulley Hub */}
                <circle cx="12" cy="18" r="2.5" fill="currentColor" fillOpacity="0.8" />
              </g>
            </svg>
          </div>


          <span className="font-bold text-[15px] text-slate-800 dark:text-slate-200 tracking-tight">
            EngineX
          </span>
        </div>
      </div>

      {/* Center: Actions */}
      <div className="no-drag flex items-center gap-2">
        {/* Search */}
        <button
          onClick={() => setShowFileSearch(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-border
                     text-xs text-text-muted hover:text-text hover:border-accent/30 transition-all w-52"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="flex-1 text-left">Search files...</span>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 border border-border font-mono">Ctrl+P</kbd>
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border
                     text-xs text-text-muted hover:text-text hover:bg-surface-2 transition-all"
          title="Save (Ctrl+S)"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <polyline points="17,21 17,13 7,13 7,21" /><polyline points="7,3 7,8 15,8" />
          </svg>
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Run / Stop */}
        {isRunning ? (
          <button
            onClick={stopCode}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all bg-error/90 text-white hover:bg-error shadow-sm shadow-error/20 hover:shadow-error/40"
            title="Stop Execution"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" ry="2" />
            </svg>
            <span>Stop</span>
          </button>
        ) : (
          <button
            onClick={handleRun}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all bg-success/90 text-white hover:bg-success shadow-sm shadow-success/20 hover:shadow-success/40"
            title="Run (Ctrl+Enter)"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            <span>Run</span>
            <kbd className="text-[10px] px-1 py-0.5 rounded bg-white/20 font-mono ml-1">⌃↵</kbd>
          </button>
        )}
      </div>

      {/* Right: Settings + AI + Theme */}
      <div className="no-drag flex items-center gap-2">
        {/* AI Config Settings */}
        <div className="relative">
          <button
            onClick={() => setShowApiKeyModal(!showApiKeyModal)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              border ${(apiKeys[aiModel] && apiKeys[aiModel].length > 0)
                ? 'border-success/30 text-success/80 hover:text-success hover:bg-success/5'
                : 'border-warning/30 text-warning/80 hover:text-warning hover:bg-warning/5'
              }`}
            title={(apiKeys[aiModel] && apiKeys[aiModel].length > 0) ? 'API Keys configured' : 'Configure Models & Keys'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
            </svg>
            <span className="hidden sm:inline">Settings</span>
            {(apiKeys[aiModel] && apiKeys[aiModel].length > 0) ? (
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
            )}
          </button>

          {/* API Key Dropdown */}
          {showApiKeyModal && (
            <div
              ref={modalRef}
              className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
              style={{ animation: 'fadeIn 0.15s ease-out' }}
            >
              <div className="px-4 py-3 border-b border-border bg-surface-2/50 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                  Settings
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => setActiveSettingsTab('ai')} className={`text-xs px-2 py-1 rounded ${activeSettingsTab === 'ai' ? 'bg-accent/20 text-accent font-medium' : 'text-text-muted hover:text-text'}`}>AI</button>
                  <button onClick={() => setActiveSettingsTab('shortcuts')} className={`text-xs px-2 py-1 rounded ${activeSettingsTab === 'shortcuts' ? 'bg-accent/20 text-accent font-medium' : 'text-text-muted hover:text-text'}`}>Shortcuts</button>
                </div>
              </div>

              {activeSettingsTab === 'ai' ? (
              <div className="p-4 space-y-3">
                <div className="relative space-y-3">
                  <div>
                    <label className="text-xs text-text-muted font-medium mb-1 block">Active AI Model</label>
                    <select
                      value={modelInput}
                      onChange={(e) => setModelInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all font-mono text-xs cursor-pointer"
                    >
                      <optgroup label="Gemini">
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                      </optgroup>
                      <optgroup label="Gemma (Open Models)">
                        <option value="gemma-4-31b-it">Gemma 4 31B IT</option>
                        <option value="gemma-2-2b-it">Gemma 2 2B IT</option>
                        <option value="gemma-2-9b-it">Gemma 2 9B IT</option>
                        <option value="gemma-2-27b-it">Gemma 2 27B IT</option>
                      </optgroup>
                      <optgroup label="Other Models">
                        <option value="minimax/minimax-m2.5:free">MiniMax M2.5 Free</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-text-muted font-medium mb-1 block">API Provider</label>
                    <select
                      value={localProviders[modelInput] || 'google'}
                      onChange={(e) => setLocalProviders({ ...localProviders, [modelInput]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-xs text-text outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 cursor-pointer transition-all"
                    >
                      <option value="google">Google AI Studio</option>
                      <option value="custom">Custom (OPENROUTER)</option>
                    </select>
                  </div>

                  {(localProviders[modelInput] === 'custom') && (
                    <div>
                      <label className="text-xs text-text-muted font-medium mb-1 block">Endpoint URL</label>
                      <input
                        type="text"
                        placeholder="https://openrouter.ai/api/v1/chat/completions"
                        value={localUrls[modelInput] || ''}
                        onChange={(e) => setLocalUrls({ ...localUrls, [modelInput]: e.target.value })}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') handleSaveApiKey();
                          if (e.key === 'Escape') setShowApiKeyModal(false);
                        }}
                        onKeyUp={(e) => e.stopPropagation()}
                        className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all font-mono text-[11px]"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-text-muted font-medium mb-1.5 block">Fallback API Keys</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {(localKeys[modelInput] || ['']).map((k, idx) => (
                      <div key={idx} className="relative flex gap-1">
                        <div className="relative flex-1">
                          <input
                            type={showKey ? 'text' : 'password'}
                            placeholder={`API Key ${idx + 1}...`}
                            value={k}
                            onChange={(e) => {
                              const mk = [...(localKeys[modelInput] || [''])];
                              mk[idx] = e.target.value;
                              setLocalKeys({ ...localKeys, [modelInput]: mk });
                            }}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === 'Enter') handleSaveApiKey();
                              if (e.key === 'Escape') setShowApiKeyModal(false);
                            }}
                            onKeyUp={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm text-text outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all font-mono text-[11px]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const mk = [...(localKeys[modelInput] || [''])];
                            if (mk.length > 1) {
                              mk.splice(idx, 1);
                              setLocalKeys({ ...localKeys, [modelInput]: mk });
                            } else {
                              setLocalKeys({ ...localKeys, [modelInput]: [''] });
                            }
                          }}
                          className="shrink-0 p-1.5 text-text-muted hover:text-error transition-colors"
                          title="Remove key"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6l-1 14H6L5 6m4-3h6l1 1H8l1-1z" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <button type="button" onClick={() => {
                      const mk = [...(localKeys[modelInput] || [''])];
                      mk.push('');
                      setLocalKeys({ ...localKeys, [modelInput]: mk });
                    }} className="text-[11px] text-accent flex items-center gap-1 hover:underline">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      Add another key
                    </button>
                    <button type="button" onClick={() => setShowKey(!showKey)} className="text-[11px] text-text-muted hover:text-text">
                      {showKey ? 'Hide keys' : 'Show keys'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSaveApiKey}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-accent/90 text-white text-xs font-medium
                               hover:bg-accent transition-colors"
                  >
                    Save Settings
                  </button>
                  {(apiKeys[modelInput] && apiKeys[modelInput].length > 0) && (
                    <button
                      onClick={() => {
                        const updatedKeys = { ...apiKeys };
                        const updatedProviders = { ...apiProviders };
                        const updatedUrls = { ...apiUrls };
                        delete updatedKeys[modelInput];
                        delete updatedProviders[modelInput];
                        delete updatedUrls[modelInput];
                        setApiConfig(updatedKeys, updatedProviders, updatedUrls);
                        setLocalKeys({ ...localKeys, [modelInput]: [''] });
                        setShowApiKeyModal(false);
                        addToast(`Cleared config for ${modelInput}`, 'info');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-error/30 text-error/80 text-xs font-medium
                                 hover:bg-error/5 hover:text-error transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              ) : (
                <div className="p-4 space-y-3">
                  <div className="space-y-2">
                    {[
                      { id: 'save', label: 'Save File (Ctrl + ?)' },
                      { id: 'run', label: 'Run Code (Ctrl + ?)' },
                      { id: 'search', label: 'Search Files (Ctrl + ?)' },
                      { id: 'close', label: 'Close Tab (Ctrl + ?)' },
                      { id: 'format', label: 'Format Code (Ctrl + Shift + ?)' }
                    ].map(item => (
                      <div key={item.id} className="flex justify-between items-center gap-2">
                        <label className="text-xs text-text-muted font-medium">{item.label}</label>
                        <input
                          type="text"
                          maxLength={5}
                          value={shortcuts[item.id] || ''}
                          onChange={(e) => setShortcuts({ ...shortcuts, [item.id]: e.target.value.toLowerCase() })}
                          className="w-16 px-2 py-1 rounded bg-bg border border-border text-center font-mono text-xs outline-none focus:border-accent"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex mt-4">
                    <button
                      onClick={handleSaveShortcuts}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-accent/90 text-white text-xs font-medium hover:bg-accent transition-colors"
                    >
                      Save Shortcuts
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Practice / Quiz Button */}
        <button
          onClick={handlePractice}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
            border ${quizIsOpen
              ? 'bg-gradient-to-r from-emerald-500/20 to-teal-600/20 border-emerald-500/40 text-emerald-400'
              : 'border-border text-text-muted hover:text-text hover:bg-surface-2'
            }`}
          title="Interview Practice"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
          <span className="hidden sm:inline">Practice</span>
        </button>

        {/* AI Button */}
        <button
          onClick={toggleAI}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
            border ${aiIsOpen
              ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-purple-500/40 text-purple-400'
              : 'border-border text-text-muted hover:text-text hover:bg-surface-2'
            }`}
          title="AI Assistant"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          <span className="hidden sm:inline">AI</span>
        </button>
        <ThemeSwitcher />
      </div>
    </nav>
  );
}
