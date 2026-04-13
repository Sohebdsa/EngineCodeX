import React from 'react';

const icons = {
  js: (
    <svg viewBox="0 0 32 32" width="16" height="16">
      <rect width="32" height="32" rx="4" fill="#F7DF1E"/>
      <path d="M9 26.2l2.4-1.4c.5.8 1 1.5 2 1.5 1 0 1.6-.4 1.6-2V15h3v9.4c0 3.3-1.9 4.8-4.7 4.8-2.5 0-4-1.3-4.7-2.9m11.2-.4l2.4-1.4c.6 1 1.4 1.8 2.8 1.8 1.2 0 2-.6 2-1.4 0-1-.8-1.4-2.1-2l-.7-.3c-2.1-.9-3.5-2-3.5-4.4 0-2.2 1.7-3.8 4.3-3.8 1.9 0 3.2.6 4.2 2.3l-2.3 1.5c-.5-.9-1-1.3-1.9-1.3-.9 0-1.4.5-1.4 1.2 0 .8.5 1.2 1.7 1.7l.7.3c2.5 1.1 3.9 2.1 3.9 4.5 0 2.6-2 4-4.7 4-2.6 0-4.3-1.3-5.1-2.9" fill="#323330"/>
    </svg>
  ),
  jsx: (
    <svg viewBox="0 0 32 32" width="16" height="16">
      <rect width="32" height="32" rx="4" fill="#61DAFB"/>
      <circle cx="16" cy="16" r="3" fill="#282C34"/>
      <ellipse cx="16" cy="16" rx="12" ry="4.5" fill="none" stroke="#282C34" strokeWidth="1.5"/>
      <ellipse cx="16" cy="16" rx="12" ry="4.5" fill="none" stroke="#282C34" strokeWidth="1.5" transform="rotate(60 16 16)"/>
      <ellipse cx="16" cy="16" rx="12" ry="4.5" fill="none" stroke="#282C34" strokeWidth="1.5" transform="rotate(120 16 16)"/>
    </svg>
  ),
  ts: (
    <svg viewBox="0 0 32 32" width="16" height="16">
      <rect width="32" height="32" rx="4" fill="#3178C6"/>
      <path d="M7 16h5v-2h13v2h-5v12h-3V16z" fill="white"/>
    </svg>
  ),
  py: (
    <svg viewBox="0 0 32 32" width="16" height="16">
      <path d="M15.9 2C9.4 2 10 4.7 10 4.7v3h6v1H6.4S2 8.2 2 15.8c0 7.6 3.8 7.3 3.8 7.3H8v-3.5s-.2-3.8 3.7-3.8h6.4s3.6.1 3.6-3.5V5.7S22.4 2 15.9 2zm-3.6 2.2c.7 0 1.2.5 1.2 1.2s-.5 1.2-1.2 1.2-1.2-.5-1.2-1.2.6-1.2 1.2-1.2z" fill="#3776AB"/>
      <path d="M16.1 30c6.5 0 5.9-2.7 5.9-2.7v-3h-6v-1h9.6s4.4.5 4.4-7.1c0-7.6-3.8-7.3-3.8-7.3H24v3.5s.2 3.8-3.7 3.8h-6.4s-3.6-.1-3.6 3.5v6.6s-.5 3.7 5.8 3.7zm3.6-2.2c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2 1.2.5 1.2 1.2-.6 1.2-1.2 1.2z" fill="#FFD43B"/>
    </svg>
  ),
  cpp: (
    <svg viewBox="0 0 32 32" width="16" height="16">
      <circle cx="16" cy="16" r="14" fill="#00599C"/>
      <text x="16" y="22" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white" fontFamily="sans-serif">C++</text>
    </svg>
  ),
  c: (
    <svg viewBox="0 0 32 32" width="16" height="16">
      <circle cx="16" cy="16" r="14" fill="#A8B9CC"/>
      <text x="16" y="22" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white" fontFamily="sans-serif">C</text>
    </svg>
  ),
  java: (
    <svg viewBox="0 0 32 32" width="16" height="16">
      <rect width="32" height="32" rx="4" fill="#F89820"/>
      <text x="16" y="22" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white" fontFamily="serif">J</text>
    </svg>
  ),
  json: (
    <svg viewBox="0 0 32 32" width="16" height="16">
      <rect width="32" height="32" rx="4" fill="#5B5B5B"/>
      <text x="16" y="21" textAnchor="middle" fontSize="10" fontWeight="600" fill="#FFC107" fontFamily="monospace">{`{}`}</text>
    </svg>
  ),
  md: (
    <svg viewBox="0 0 32 32" width="16" height="16">
      <rect width="32" height="32" rx="4" fill="#083FA1"/>
      <text x="16" y="22" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white" fontFamily="sans-serif">M↓</text>
    </svg>
  ),
  txt: (
    <svg viewBox="0 0 32 32" width="16" height="16">
      <rect width="32" height="32" rx="4" fill="#6B7280"/>
      <path d="M8 8h16v2H8zm0 4h16v2H8zm0 4h12v2H8zm0 4h14v2H8z" fill="white" opacity="0.7"/>
    </svg>
  ),
  default: (
    <svg viewBox="0 0 32 32" width="16" height="16">
      <path d="M6 2h14l6 6v20a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#6B7280"/>
      <path d="M20 2v6h6" fill="#9CA3AF"/>
      <path d="M10 16h12M10 20h12M10 24h8" stroke="white" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  ),
  folder: (
    <svg viewBox="0 0 32 32" width="16" height="16">
      <path d="M4 6h10l2 3h12a2 2 0 012 2v15a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" fill="var(--color-accent, #58A6FF)" opacity="0.85"/>
    </svg>
  ),
  folderOpen: (
    <svg viewBox="0 0 32 32" width="16" height="16">
      <path d="M4 6h10l2 3h12a2 2 0 012 2v2H14l-2-3H4V8a2 2 0 010-2z" fill="var(--color-accent, #58A6FF)" opacity="0.7"/>
      <path d="M2 13h26l-3 15H5z" fill="var(--color-accent, #58A6FF)" opacity="0.85"/>
    </svg>
  ),
};

const extMap = {
  js: 'js', jsx: 'jsx', mjs: 'js',
  ts: 'ts', tsx: 'ts',
  py: 'py', python: 'py',
  cpp: 'cpp', cc: 'cpp', cxx: 'cpp', h: 'cpp', hpp: 'cpp',
  c: 'c',
  java: 'java',
  json: 'json',
  md: 'md', markdown: 'md',
  txt: 'txt', text: 'txt',
};

export function getFileIcon(fileName, isDirectory = false, isOpen = false) {
  if (isDirectory) {
    return isOpen ? icons.folderOpen : icons.folder;
  }

  const ext = fileName.split('.').pop()?.toLowerCase();
  const iconKey = extMap[ext] || 'default';
  return icons[iconKey] || icons.default;
}

export function getLanguageFromFile(fileName) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const langMap = {
    js: 'JavaScript', jsx: 'JavaScript (JSX)', mjs: 'JavaScript',
    ts: 'TypeScript', tsx: 'TypeScript (TSX)',
    py: 'Python', cpp: 'C++', c: 'C', java: 'Java',
    json: 'JSON', md: 'Markdown', txt: 'Plain Text',
  };
  return langMap[ext] || 'Plain Text';
}
