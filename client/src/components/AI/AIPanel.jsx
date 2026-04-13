import { useState, useRef, useEffect } from 'react';
import useAIStore from '../../stores/useAIStore';
import useEditorStore from '../../stores/useEditorStore';

export default function AIPanel() {
  const isOpen = useAIStore((s) => s.isOpen);
  const messages = useAIStore((s) => s.messages);
  const isLoading = useAIStore((s) => s.isLoading);
  const includeCode = useAIStore((s) => s.includeCode);
  const setIncludeCode = useAIStore((s) => s.setIncludeCode);
  const sendMessage = useAIStore((s) => s.sendMessage);
  const clearChat = useAIStore((s) => s.clearChat);
  const setOpen = useAIStore((s) => s.setOpen);

  const getActiveTabData = useEditorStore((s) => s.getActiveTabData);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const tab = getActiveTabData();
    sendMessage(input.trim(), tab?.content, tab?.language);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    { label: '💡 Explain', prompt: 'Explain this code step by step' },
    { label: '🐛 Debug', prompt: 'Find bugs or issues in this code' },
    { label: '⚡ Optimize', prompt: 'Suggest optimizations for this code' },
    { label: '📊 Complexity', prompt: 'What is the time and space complexity of this code?' },
    { label: '🧪 Test Cases', prompt: 'Generate edge case test inputs for this code' },
    { label: '🔄 Refactor', prompt: 'Refactor this code for better readability' },
  ];

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border overflow-hidden"
         style={{ width: 380 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-text">AI Assistant</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent font-medium">
            Gemini
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="p-1.5 rounded-md text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
            title="Clear chat"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6"/>
            </svg>
          </button>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
            title="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="p-4">
            {/* Welcome */}
            <div className="text-center py-6">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 
                            flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" 
                        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-text mb-1">DSA AI Assistant</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Ask questions about your code, get explanations,<br/>
                debug issues, or learn DSA concepts.
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-1.5">
              <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider px-1 mb-2">
                Quick Actions
              </p>
              {quickPrompts.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => {
                    const tab = getActiveTabData();
                    sendMessage(qp.prompt, tab?.content, tab?.language);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-text-muted 
                           hover:text-text hover:bg-surface-2 border border-border
                           hover:border-accent/30 transition-all"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 
                              flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                </div>
                <div className="bg-surface-2 rounded-lg px-3 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-3 shrink-0">
        {/* Code context toggle */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setIncludeCode(!includeCode)}
            className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md transition-all
              ${includeCode
                ? 'bg-accent/15 text-accent border border-accent/30'
                : 'text-text-muted hover:text-text border border-border hover:border-accent/20'
              }`}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/>
            </svg>
            {includeCode ? 'Code attached' : 'Attach code'}
          </button>
          <span className="text-[10px] text-text-muted">
            Shift+Enter for new line
          </span>
        </div>

        {/* Input box */}
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              handleKeyDown(e);
            }}
            onKeyUp={(e) => e.stopPropagation()}
            placeholder="Ask about your code..."
            rows={1}
            className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text
                       resize-none outline-none focus:border-accent/50 transition-colors
                       placeholder:text-text-muted/40"
            style={{ maxHeight: '100px', minHeight: '36px' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`self-end shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all
              ${input.trim() && !isLoading
                ? 'bg-accent text-white hover:bg-accent-hover shadow-sm'
                : 'bg-surface-2 text-text-muted cursor-not-allowed'
              }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Message Bubble Component ───────────────────────────────────
function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {isUser ? (
        <div className="w-6 h-6 rounded-md bg-surface-3 flex items-center justify-center shrink-0 mt-0.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-text-muted">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      ) : (
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 
                      flex items-center justify-center shrink-0 mt-0.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
      )}

      {/* Message Content */}
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed
          ${isUser
            ? 'bg-accent/15 text-text'
            : message.isError
              ? 'bg-error/10 text-error'
              : 'bg-surface-2 text-text'
          }`}
      >
        <MarkdownContent content={message.content} />
      </div>
    </div>
  );
}

// ─── Simple Markdown Renderer ───────────────────────────────────
function MarkdownContent({ content }) {
  if (!content) return null;

  // Parse markdown into blocks
  const blocks = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```
      blocks.push({ type: 'code', lang, content: codeLines.join('\n') });
      continue;
    }

    // Regular text line
    blocks.push({ type: 'text', content: line });
    i++;
  }

  return (
    <div className="space-y-1.5">
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return (
            <div key={idx} className="relative group">
              {block.lang && (
                <div className="text-[10px] text-text-muted bg-surface-3 px-2 py-0.5 rounded-t-md font-mono">
                  {block.lang}
                </div>
              )}
              <pre className={`bg-bg border border-border ${block.lang ? 'rounded-b-md' : 'rounded-md'} 
                             p-2 overflow-x-auto text-xs font-mono text-text`}>
                <code>{block.content}</code>
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(block.content)}
                className="absolute top-1 right-1 p-1 rounded bg-surface-3/80 text-text-muted 
                         hover:text-text opacity-0 group-hover:opacity-100 transition-opacity"
                title="Copy"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              </button>
            </div>
          );
        }

        // Text line with inline formatting
        if (!block.content.trim()) return <div key={idx} className="h-1" />;

        return (
          <p key={idx} className="leading-relaxed">
            <InlineMarkdown text={block.content} />
          </p>
        );
      })}
    </div>
  );
}

// ─── Inline Markdown (bold, italic, inline code) ────────────────
function InlineMarkdown({ text }) {
  // Simple regex-based inline markdown
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Inline code
    let match = remaining.match(/^`([^`]+)`/);
    if (match) {
      parts.push(
        <code key={key++} className="bg-surface-3 px-1 py-0.5 rounded text-xs font-mono text-accent">
          {match[1]}
        </code>
      );
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Bold
    match = remaining.match(/^\*\*([^*]+)\*\*/);
    if (match) {
      parts.push(<strong key={key++} className="font-semibold">{match[1]}</strong>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Italic
    match = remaining.match(/^\*([^*]+)\*/);
    if (match) {
      parts.push(<em key={key++}>{match[1]}</em>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Heading markers (just bold them)
    match = remaining.match(/^(#{1,3})\s+(.+)/);
    if (match) {
      parts.push(<strong key={key++} className="font-semibold text-text">{match[2]}</strong>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // List items
    match = remaining.match(/^[-•]\s+(.+)/);
    if (match) {
      parts.push(<span key={key++}>• {match[1]}</span>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Numbered list
    match = remaining.match(/^(\d+)\.\s+(.+)/);
    if (match) {
      parts.push(<span key={key++}>{match[1]}. {match[2]}</span>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Regular character
    parts.push(remaining[0]);
    remaining = remaining.slice(1);
  }

  return <>{parts}</>;
}
