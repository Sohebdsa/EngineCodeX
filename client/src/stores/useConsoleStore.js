import { create } from 'zustand';

const useConsoleStore = create((set, get) => ({
  output: '',
  error: '',
  executionTime: null,
  isRunning: false,
  input: '',
  history: [],

  setInput: (input) => set({ input }),

  clearConsole: () => set({ output: '', error: '', executionTime: null, history: [] }),

  runCode: async (code) => {
    if (get().isRunning) return;
    
    set({ isRunning: true, output: '', error: '', executionTime: null });

    try {
      const result = await executeInWorker(code, get().input);
      set({
        output: result.output,
        error: result.error,
        executionTime: result.executionTime,
        isRunning: false,
        history: [
          ...get().history,
          {
            timestamp: Date.now(),
            output: result.output,
            error: result.error,
            executionTime: result.executionTime,
          },
        ],
      });
    } catch (err) {
      set({
        error: `Execution failed: ${err.message}`,
        isRunning: false,
      });
    }
  },
}));

// ─── Execute JavaScript in a Web Worker (sandboxed) ─────────────
function executeInWorker(code, input) {
  return new Promise((resolve) => {
    const workerCode = `
      self.onmessage = function(e) {
        const { code, input } = e.data;
        const logs = [];
        const errors = [];
        const startTime = performance.now();

        // Custom console that captures output
        const _console = {
          log: function() {
            const args = Array.prototype.slice.call(arguments);
            logs.push(args.map(function(a) {
              if (a === null) return 'null';
              if (a === undefined) return 'undefined';
              if (typeof a === 'object') {
                try { return JSON.stringify(a, null, 2); }
                catch(e) { return String(a); }
              }
              return String(a);
            }).join(' '));
          },
          error: function() {
            const args = Array.prototype.slice.call(arguments);
            errors.push(args.map(function(a) { return String(a); }).join(' '));
          },
          warn: function() {
            const args = Array.prototype.slice.call(arguments);
            logs.push('⚠ ' + args.map(function(a) { return String(a); }).join(' '));
          },
          info: function() {
            const args = Array.prototype.slice.call(arguments);
            logs.push('ℹ ' + args.map(function(a) { return String(a); }).join(' '));
          },
          table: function(data) {
            try { logs.push(JSON.stringify(data, null, 2)); }
            catch(e) { logs.push(String(data)); }
          },
          dir: function(obj) {
            try { logs.push(JSON.stringify(obj, null, 2)); }
            catch(e) { logs.push(String(obj)); }
          },
          time: function() {},
          timeEnd: function() {},
          clear: function() { logs.length = 0; },
        };

        // Input helpers
        const inputLines = (input || '').split('\\n');
        let lineIndex = 0;
        const readline = function() { return inputLines[lineIndex++] || ''; };

        try {
          const fn = new Function('console', 'readline', 'input', code);
          fn(_console, readline, input);
        } catch (err) {
          errors.push(err.toString());
          // Try to extract line info
          if (err.stack) {
            const match = err.stack.match(/<anonymous>:(\\d+):(\\d+)/);
            if (match) {
              errors.push('  at line ' + (parseInt(match[1]) - 2) + ', column ' + match[2]);
            }
          }
        }

        const executionTime = (performance.now() - startTime).toFixed(2);

        self.postMessage({
          output: logs.join('\\n'),
          error: errors.join('\\n'),
          executionTime: executionTime
        });
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    // 5 second timeout
    const timeout = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({
        output: '',
        error: '⏱ Execution timed out (5 second limit). Check for infinite loops.',
        executionTime: '5000',
      });
    }, 5000);

    worker.onmessage = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve(e.data);
    };

    worker.onerror = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({
        output: '',
        error: `Worker error: ${e.message}`,
        executionTime: '0',
      });
    };

    worker.postMessage({ code, input });
  });
}

export default useConsoleStore;
