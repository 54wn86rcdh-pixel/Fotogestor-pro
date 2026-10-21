import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastData {
  id: string;
  type: ToastType;
  message: string;
}

let toastCallback: ((toast: ToastData) => void) | null = null;

export const showToast = (type: ToastType, message: string) => {
  if (toastCallback) {
    toastCallback({ id: Date.now().toString(), type, message });
  }
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    toastCallback = (toast: ToastData) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 4000);
    };
    return () => { toastCallback = null; };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'border-green-600/50 text-green-400',
    error: 'border-red-600/50 text-red-400',
    warning: 'border-amber-600/50 text-amber-400',
    info: 'border-blue-600/50 text-blue-400',
  };

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
      {toasts.map(toast => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 bg-bg-elevated border ${colors[toast.type]} rounded-lg px-4 py-3 shadow-2xl slide-up`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-text-primary flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-text-muted hover:text-text-secondary">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
