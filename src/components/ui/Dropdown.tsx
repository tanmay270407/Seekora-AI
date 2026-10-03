import React, { useState, useRef, useEffect } from 'react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onClick: () => void;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 min-w-[170px] bg-[#F8F9FB] rounded-[14px] p-1.5 shadow-[8px_8px_20px_rgba(163,170,181,0.32),-8px_-8px_20px_rgba(255,255,255,0.95)] border border-[rgba(20,24,32,0.06)] ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-[10px] flex items-center gap-2 transition-colors cursor-pointer ${
                item.danger
                  ? 'text-[#D95C5C] hover:bg-[#FEE2E2]/50'
                  : 'text-[#646974] hover:text-[#17181C] hover:bg-[#EEF0F3]'
              }`}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Soft translucent backdrop */}
      <div
        className="fixed inset-0 bg-black/25 transition-opacity"
        onClick={onClose}
      />

      {/* Light Neumorphic Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#F8F9FB] rounded-[22px] p-6 shadow-[12px_12px_32px_rgba(163,170,181,0.40),-10px_-10px_28px_rgba(255,255,255,0.95)] z-10 border border-[rgba(20,24,32,0.06)]">
        <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC]">
          <h3 className="text-base font-semibold text-[#17181C]">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-[8px] bg-[#EEF0F3] text-[#646974] hover:text-[#17181C] shadow-[inset_2px_2px_5px_rgba(163,170,181,0.25)] cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="py-4">{children}</div>

        {footer && (
          <div className="pt-4 border-t border-[#E4E7EC] flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
