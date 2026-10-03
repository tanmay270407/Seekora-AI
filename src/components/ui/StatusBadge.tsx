import React from 'react';
import { CollectionStatus, RecordValidationStatus } from '../../types';

interface StatusBadgeProps {
  status:
    | CollectionStatus
    | RecordValidationStatus
    | 'Verified'
    | 'Pending'
    | 'Flagged'
    | 'Active'
    | 'Available'
    | 'Development'
    | 'Maintenance'
    | 'Paused';
  size?: 'sm' | 'md';
  isDemo?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', isDemo }) => {
  const config = {
    // Green
    Completed: {
      color: 'text-[#22A879]',
      dot: 'bg-[#22A879]',
      bg: 'bg-[#EEF0F3]',
      label: 'Completed',
    },
    valid: {
      color: 'text-[#22A879]',
      dot: 'bg-[#22A879]',
      bg: 'bg-[#EEF0F3]',
      label: 'Valid',
    },
    Verified: {
      color: 'text-[#22A879]',
      dot: 'bg-[#22A879]',
      bg: 'bg-[#EEF0F3]',
      label: 'Verified',
    },
    Active: {
      color: 'text-[#22A879]',
      dot: 'bg-[#22A879]',
      bg: 'bg-[#EEF0F3]',
      label: 'Active',
    },
    Available: {
      color: 'text-[#22A879]',
      dot: 'bg-[#22A879]',
      bg: 'bg-[#EEF0F3]',
      label: 'Available',
    },

    // Purple (Active / Processing)
    Running: {
      color: 'text-[#6D5DFB]',
      dot: 'bg-[#6D5DFB]',
      bg: 'bg-[#EEF0F3]',
      label: 'Running',
    },
    Processing: {
      color: 'text-[#6D5DFB]',
      dot: 'bg-[#6D5DFB]',
      bg: 'bg-[#EEF0F3]',
      label: 'Processing',
    },
    Ready: {
      color: 'text-[#6D5DFB]',
      dot: 'bg-[#6D5DFB]',
      bg: 'bg-[#EEF0F3]',
      label: 'Ready',
    },

    // Orange / Warning (Needs review / Pending / Development)
    invalid: {
      color: 'text-[#C98A25]',
      dot: 'bg-[#C98A25]',
      bg: 'bg-[#EEF0F3]',
      label: 'Needs Review',
    },
    Pending: {
      color: 'text-[#C98A25]',
      dot: 'bg-[#C98A25]',
      bg: 'bg-[#EEF0F3]',
      label: 'Pending',
    },
    Development: {
      color: 'text-[#C98A25]',
      dot: 'bg-[#C98A25]',
      bg: 'bg-[#EEF0F3]',
      label: 'Demo Source',
    },
    Paused: {
      color: 'text-[#C98A25]',
      dot: 'bg-[#C98A25]',
      bg: 'bg-[#EEF0F3]',
      label: 'Paused',
    },
    Maintenance: {
      color: 'text-[#C98A25]',
      dot: 'bg-[#C98A25]',
      bg: 'bg-[#EEF0F3]',
      label: 'Maintenance',
    },

    // Gray / Duplicate / Draft
    duplicate: {
      color: 'text-[#646974]',
      dot: 'bg-[#9297A1]',
      bg: 'bg-[#EEF0F3]',
      label: 'Duplicate',
    },
    Draft: {
      color: 'text-[#646974]',
      dot: 'bg-[#9297A1]',
      bg: 'bg-[#EEF0F3]',
      label: 'Draft',
    },

    // Red (Failed / Flagged)
    Failed: {
      color: 'text-[#D95C5C]',
      dot: 'bg-[#D95C5C]',
      bg: 'bg-[#EEF0F3]',
      label: 'Failed',
    },
    Flagged: {
      color: 'text-[#D95C5C]',
      dot: 'bg-[#D95C5C]',
      bg: 'bg-[#EEF0F3]',
      label: 'Flagged',
    },
  }[status] || {
    color: 'text-[#646974]',
    dot: 'bg-[#9297A1]',
    bg: 'bg-[#EEF0F3]',
    label: status,
  };

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.color} ${sizeClasses} shadow-[inset_2px_2px_5px_rgba(163,170,181,0.22),inset_-2px_-2px_5px_rgba(255,255,255,0.85)] border border-[rgba(20,24,32,0.03)] select-none`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
      {isDemo && (
        <span className="text-[10px] uppercase font-mono px-1 rounded bg-[#C98A25]/10 text-[#C98A25]">
          Demo
        </span>
      )}
    </span>
  );
};
