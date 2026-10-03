import React from 'react';
import { Button } from './Button';
import { ArrowRight, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No collections yet',
  description,
  actionLabel = 'Create Collection',
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`bg-[#F8F9FB] rounded-[18px] p-8 text-center flex flex-col items-center justify-center shadow-[inset_4px_4px_10px_rgba(163,170,181,0.20),inset_-4px_-4px_10px_rgba(255,255,255,0.90)] border border-[rgba(20,24,32,0.04)] ${className}`}
    >
      <h3 className="text-base font-bold text-[#17181C] mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-[#646974] max-w-sm mb-4">{description}</p>
      )}
      {onAction && (
        <Button
          size="sm"
          onClick={onAction}
          icon={<ArrowRight size={14} />}
          iconPosition="right"
          className="mt-1"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export const LoadingSkeleton: React.FC<{ rows?: number; className?: string }> = ({
  rows = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-10 w-full bg-[#EEF0F3] rounded-[10px] animate-pulse shadow-[inset_2px_2px_5px_rgba(163,170,181,0.15)]"
        />
      ))}
    </div>
  );
};

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={`${sizeClass} rounded-full border-2 border-[#E4E7EC] border-t-[#6D5DFB] animate-spin`}
      />
    </div>
  );
};
