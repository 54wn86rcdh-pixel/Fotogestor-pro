import { type ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-bg-hover flex items-center justify-center mb-4">
        {icon || <Inbox className="w-8 h-8 text-text-muted" />}
      </div>
      <h3 className="text-base font-semibold text-text-secondary mb-1">{title}</h3>
      {description && <p className="text-sm text-text-muted text-center max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
