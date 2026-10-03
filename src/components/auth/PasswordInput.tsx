import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[#646974] uppercase tracking-wider"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9297A1] pointer-events-none">
            <Lock size={15} />
          </div>

          <input
            id={inputId}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`w-full bg-[#EEF0F3] text-[#17181C] placeholder-[#9297A1] text-sm rounded-[13px] py-2.5 pl-10 pr-11 transition-all duration-200 shadow-[inset_5px_5px_12px_rgba(163,170,181,0.20),inset_-5px_-5px_12px_rgba(255,255,255,0.90)] focus:outline-none focus:ring-1 focus:ring-[#6D5DFB]/40 focus:border-[#6D5DFB]/40 border ${
              error ? 'border-[#D95C5C]/60' : 'border-[rgba(20,24,32,0.06)]'
            } ${className}`}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9297A1] hover:text-[#17181C] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6D5DFB]/40 rounded-[6px] p-1 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error ? (
          <p className="text-xs text-[#D95C5C] font-medium pt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#9297A1] pt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
