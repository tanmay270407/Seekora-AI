import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon, iconPosition = 'left', error, className = '', ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9297A1] pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full bg-[#EEF0F3] text-[#17181C] placeholder-[#9297A1] text-sm rounded-[13px] py-2.5 px-4 transition-all duration-200 shadow-[inset_5px_5px_12px_rgba(163,170,181,0.20),inset_-5px_-5px_12px_rgba(255,255,255,0.90)] focus:outline-none focus:ring-1 focus:ring-[#6D5DFB]/40 focus:border-[#6D5DFB]/40 border border-[rgba(20,24,32,0.06)] ${
            icon && iconPosition === 'left' ? 'pl-10' : ''
          } ${icon && iconPosition === 'right' ? 'pr-10' : ''} ${
            error ? 'border-[#D95C5C]/50' : ''
          } ${className}`}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9297A1] pointer-events-none">
            {icon}
          </div>
        )}
        {error && <span className="text-xs text-[#D95C5C] mt-1 block">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          className={`w-full bg-[#EEF0F3] text-[#17181C] placeholder-[#9297A1] text-sm rounded-[13px] p-3.5 transition-all duration-200 shadow-[inset_5px_5px_12px_rgba(163,170,181,0.20),inset_-5px_-5px_12px_rgba(255,255,255,0.90)] focus:outline-none focus:ring-1 focus:ring-[#6D5DFB]/40 focus:border-[#6D5DFB]/40 border border-[rgba(20,24,32,0.06)] resize-none ${
            error ? 'border-[#D95C5C]/50' : ''
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-[#D95C5C] mt-1 block">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
