import { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  if (!open) return null;

  const sizeClass = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  }[size];

  return (
    <div className="modal-overlay fade-in" onClick={onClose}>
      <div
        className={`modal-container ${sizeClass} w-full slide-up`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-hover sticky top-0 bg-bg-elevated z-10 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
        <div className="px-6 py-5">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-border-hover flex items-center justify-end gap-3 sticky bottom-0 bg-bg-elevated rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
