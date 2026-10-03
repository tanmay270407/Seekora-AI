import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  label,
  size = 'md',
  active = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs rounded-[9px]',
    md: 'w-9 h-9 text-sm rounded-[10px]',
    lg: 'w-11 h-11 text-base rounded-[12px]',
  }[size];

  const stateClass = active
    ? 'bg-[#EEF0F3] text-[#6D5DFB] shadow-[inset_3px_3px_7px_rgba(163,170,181,0.25),inset_-3px_-3px_7px_rgba(255,255,255,0.90)]'
    : 'bg-[#F8F9FB] text-[#646974] hover:text-[#17181C] shadow-[5px_5px_12px_rgba(163,170,181,0.25),-5px_-5px_12px_rgba(255,255,255,0.90)] hover:shadow-[6px_6px_14px_rgba(163,170,181,0.32),-6px_-6px_14px_rgba(255,255,255,0.98)] active:shadow-[inset_3px_3px_7px_rgba(163,170,181,0.30),inset_-2px_-2px_5px_rgba(255,255,255,0.90)] active:translate-y-[1px] border border-[rgba(20,24,32,0.04)]';

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6D5DFB]/50 disabled:opacity-40 disabled:cursor-not-allowed ${sizeClasses} ${stateClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
