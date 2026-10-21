import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmDialog({
  open, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
  onConfirm, onCancel, danger,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <button onClick={onCancel} className="btn-secondary">{cancelLabel}</button>
          <button onClick={onConfirm} className={danger ? 'btn-danger' : 'btn-primary'}>{confirmLabel}</button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        {danger && (
          <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
        )}
        <p className="text-sm text-text-secondary">{message}</p>
      </div>
    </Modal>
  );
}

let confirmCallback: ((result: boolean) => void) | null = null;

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    danger: boolean;
  }>({ open: false, title: '', message: '', confirmLabel: 'Confirmar', danger: false });

  const confirm = (opts: {
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
  }): Promise<boolean> => {
    return new Promise(resolve => {
      confirmCallback = resolve;
      setState({
        open: true,
        title: opts.title,
        message: opts.message,
        confirmLabel: opts.confirmLabel || 'Confirmar',
        danger: opts.danger || false,
      });
    });
  };

  const dialog = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      danger={state.danger}
      onCancel={() => {
        setState(s => ({ ...s, open: false }));
        confirmCallback?.(false);
        confirmCallback = null;
      }}
      onConfirm={() => {
        setState(s => ({ ...s, open: false }));
        confirmCallback?.(true);
        confirmCallback = null;
      }}
    />
  );

  return { confirm, dialog };
}
