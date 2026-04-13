import useToastStore from '../../stores/useToastStore';

export default function Toast() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  const typeStyles = {
    success: 'border-l-4 border-l-success',
    error: 'border-l-4 border-l-error',
    info: 'border-l-4 border-l-accent',
    warning: 'border-l-4 border-l-warning',
  };

  const typeIcons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            ${toast.exiting ? 'toast-exit' : 'toast-enter'}
            ${typeStyles[toast.type] || typeStyles.info}
            bg-surface border border-border rounded-lg px-4 py-3
            shadow-lg shadow-black/20 flex items-center gap-3
            cursor-pointer hover:bg-surface-2 transition-colors
          `}
          onClick={() => removeToast(toast.id)}
        >
          <span className="text-sm font-medium opacity-80">
            {typeIcons[toast.type]}
          </span>
          <span className="text-sm text-text flex-1">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
