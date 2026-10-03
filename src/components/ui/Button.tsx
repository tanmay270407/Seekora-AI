import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-[10px] gap-1.5',
    md: 'px-4 py-2 text-sm rounded-[11px] gap-2',
    lg: 'px-5 py-2.5 text-base rounded-[12px] gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#6D5DFB] text-white hover:bg-[#5B4AE8] shadow-[5px_5px_14px_rgba(109,93,251,0.32),-4px_-4px_10px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_16px_rgba(109,93,251,0.40),-5px_-5px_12px_rgba(255,255,255,0.95)] active:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.25)] active:translate-y-[1px]',
    secondary:
      'bg-[#F8F9FB] text-[#17181C] hover:text-[#17181C] shadow-[5px_5px_12px_rgba(163,170,181,0.25),-5px_-5px_12px_rgba(255,255,255,0.90)] hover:shadow-[6px_6px_14px_rgba(163,170,181,0.32),-6px_-6px_14px_rgba(255,255,255,0.98)] active:shadow-[inset_3px_3px_7px_rgba(163,170,181,0.30),inset_-2px_-2px_5px_rgba(255,255,255,0.90)] border border-[rgba(20,24,32,0.04)] active:translate-y-[1px]',
    ghost:
      'bg-transparent text-[#646974] hover:text-[#17181C] hover:bg-[#EEF0F3] active:shadow-[inset_2px_2px_5px_rgba(163,170,181,0.25)]',
    danger:
      'bg-[#F8F9FB] text-[#D95C5C] hover:text-red-700 shadow-[5px_5px_12px_rgba(163,170,181,0.25),-5px_-5px_12px_rgba(255,255,255,0.90)] border border-[#D95C5C]/20 active:shadow-[inset_3px_3px_7px_rgba(163,170,181,0.30)] active:translate-y-[1px]',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6D5DFB]/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
