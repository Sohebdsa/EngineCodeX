import { create } from 'zustand';

const useConsoleStore = create((set, get) => ({
  output: '',
  error: '',
  executionTime: null,
  isRunning: false,
  input: '',
  history: [],
  activeWorker: null,
  workerTimeout: null,

  setInput: (input) => set({ input }),

  clearConsole: () => set({ output: '', error: '', executionTime: null, history: [] }),

  stopCode: () => {
    const { activeWorker, workerTimeout, error } = get();
    if (activeWorker) {
      activeWorker.terminate();
      clearTimeout(workerTimeout);
      set({ 
        isRunning: false, 
        activeWorker: null, 
        workerTimeout: null,
        error: error + (error ? '\n' : '') + '🛑 Execution manually stopped.' 
      });
    }
  },

  runCode: async (code) => {
    // Stop any existing run
    get().stopCode();
    
    set({ isRunning: true, output: '', error: '', executionTime: null });

    const workerCode = `
      self.onmessage = async function(e) {
        const { code, input } = e.data;
        const startTime = performance.now();

        const sendLog = (text) => self.postMessage({ type: 'log', text });
        const sendError = (text) => self.postMessage({ type: 'error', text });

        const _console = {
          log: function() {
            const args = Array.prototype.slice.call(arguments);
            sendLog(args.map(function(a) {
              if (a === null) return 'null';
              if (a === undefined) return 'undefined';
              if (typeof a === 'object') {
                try { return JSON.stringify(a, null, 2); }
                catch(err) { return String(a); }
              }
              return String(a);
            }).join(' '));
          },
          error: function() {
            const args = Array.prototype.slice.call(arguments);
            sendError(args.map(function(a) { return String(a); }).join(' '));
          },
          warn: function() {
            const args = Array.prototype.slice.call(arguments);
            sendLog('⚠ ' + args.map(function(a) { return String(a); }).join(' '));
          },
          info: function() {
            const args = Array.prototype.slice.call(arguments);
            sendLog('ℹ ' + args.map(function(a) { return String(a); }).join(' '));
          },
          table: function(data) {
            try { sendLog(JSON.stringify(data, null, 2)); }
            catch(err) { sendLog(String(data)); }
          },
          dir: function(obj) {
            try { sendLog(JSON.stringify(obj, null, 2)); }
            catch(err) { sendLog(String(obj)); }
          },
          time: function() {},
          timeEnd: function() {},
          clear: function() { self.postMessage({ type: 'clear' }); },
        };

        const inputLines = (input || '').split('\\n');
        let lineIndex = 0;
        const readline = function() { return inputLines[lineIndex++] || ''; };

        try {
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          const fn = new AsyncFunction('console', 'readline', 'input', code);
          await fn(_console, readline, input);
          const executionTime = (performance.now() - startTime).toFixed(2);
          self.postMessage({ type: 'done', executionTime });
        } catch (err) {
          sendError(err.toString());
          if (err.stack) {
            const match = err.stack.match(/<anonymous>:(\\d+):(\\d+)/);
            if (match) {
              sendError('  at line ' + (parseInt(match[1]) - 2) + ', column ' + match[2]);
            }
          }
          const executionTime = (performance.now() - startTime).toFixed(2);
          self.postMessage({ type: 'done', executionTime });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    // 15 second timeout for background tasks
    const timeout = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      set((s) => ({
        error: s.error + (s.error ? '\n' : '') + '⏱ Execution timed out (15 second limit).',
        isRunning: false,
        activeWorker: null,
      }));
    }, 15000);

    set({ activeWorker: worker, workerTimeout: timeout });

    worker.onmessage = (e) => {
      const data = e.data;
      if (data.type === 'log') {
        set((s) => ({ output: s.output + (s.output ? '\n' : '') + data.text }));
      } else if (data.type === 'error') {
        set((s) => ({ error: s.error + (s.error ? '\n' : '') + data.text }));
      } else if (data.type === 'clear') {
        set({ output: '', error: '' });
      } else if (data.type === 'done') {
        set((s) => ({
          executionTime: data.executionTime,
          history: [
            ...s.history,
            {
              timestamp: Date.now(),
              output: s.output,
              error: s.error,
              executionTime: data.executionTime,
            },
          ],
        }));
        set({ isRunning: false });
      }
    };

    worker.onerror = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      set((s) => ({
        error: s.error + (s.error ? '\n' : '') + `Worker error: ${e.message}`,
        isRunning: false,
        activeWorker: null,
      }));
    };

    worker.postMessage({ code, input: get().input });
  },
}));

export default useConsoleStore;
