export const themes = {
  dark: {
    name: 'Dark',
    key: 'dark',
    monacoTheme: 'vs-dark',
    icon: '🌙',
    preview: { bg: '#0D1117', accent: '#58A6FF', surface: '#161B22' },
  },
  light: {
    name: 'Light',
    key: 'light',
    monacoTheme: 'vs',
    icon: '☀️',
    preview: { bg: '#FFFFFF', accent: '#0969DA', surface: '#F6F8FA' },
  },
  neon: {
    name: 'Neon',
    key: 'neon',
    monacoTheme: 'neon-dark',
    icon: '⚡',
    preview: { bg: '#020208', accent: '#00F0FF', surface: '#0A0A14' },
  },
  dracula: {
    name: 'Dracula',
    key: 'dracula',
    monacoTheme: 'dracula',
    icon: '🧛',
    preview: { bg: '#282A36', accent: '#BD93F9', surface: '#343746' },
  },
};

// Define custom Monaco themes
export function defineMonacoThemes(monaco) {
  monaco.editor.defineTheme('neon-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6B6B99', fontStyle: 'italic' },
      { token: 'keyword', foreground: '00F0FF' },
      { token: 'string', foreground: '00FF88' },
      { token: 'number', foreground: 'FFD600' },
      { token: 'type', foreground: 'BF00FF' },
      { token: 'function', foreground: '00F0FF' },
      { token: 'variable', foreground: 'E0E0FF' },
      { token: 'operator', foreground: 'FF00AA' },
    ],
    colors: {
      'editor.background': '#020208',
      'editor.foreground': '#E0E0FF',
      'editor.lineHighlightBackground': '#0A0A1A',
      'editor.selectionBackground': '#00F0FF22',
      'editorLineNumber.foreground': '#3A3A55',
      'editorLineNumber.activeForeground': '#00F0FF',
      'editor.inactiveSelectionBackground': '#00F0FF11',
      'editorCursor.foreground': '#00F0FF',
      'editorWhitespace.foreground': '#1A1A30',
      'editorIndentGuide.background': '#1A1A30',
      'editorIndentGuide.activeBackground': '#2A2A44',
      'minimap.background': '#020208',
      'scrollbar.shadow': '#00000000',
      'scrollbarSlider.background': '#2A2A4480',
      'scrollbarSlider.hoverBackground': '#3A3A55',
      'scrollbarSlider.activeBackground': '#00F0FF40',
    },
  });

  monaco.editor.defineTheme('dracula', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6272A4', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'FF79C6' },
      { token: 'string', foreground: 'F1FA8C' },
      { token: 'number', foreground: 'BD93F9' },
      { token: 'type', foreground: '8BE9FD', fontStyle: 'italic' },
      { token: 'function', foreground: '50FA7B' },
      { token: 'variable', foreground: 'F8F8F2' },
      { token: 'operator', foreground: 'FF79C6' },
    ],
    colors: {
      'editor.background': '#282A36',
      'editor.foreground': '#F8F8F2',
      'editor.lineHighlightBackground': '#343746',
      'editor.selectionBackground': '#44475A',
      'editorLineNumber.foreground': '#6272A4',
      'editorLineNumber.activeForeground': '#F8F8F2',
      'editor.inactiveSelectionBackground': '#44475A80',
      'editorCursor.foreground': '#F8F8F2',
      'editorWhitespace.foreground': '#44475A',
      'editorIndentGuide.background': '#44475A',
      'editorIndentGuide.activeBackground': '#6272A4',
      'minimap.background': '#282A36',
      'scrollbar.shadow': '#00000000',
      'scrollbarSlider.background': '#44475A80',
      'scrollbarSlider.hoverBackground': '#6272A4',
      'scrollbarSlider.activeBackground': '#BD93F940',
    },
  });
}
