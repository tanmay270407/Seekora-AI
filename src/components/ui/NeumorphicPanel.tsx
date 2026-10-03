import React from 'react';

export interface NeumorphicPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
}

export const NeumorphicPanel: React.FC<NeumorphicPanelProps> = ({
  children,
  className = '',
  inset = false,
  ...props
}) => {
  const shadowClass = inset
    ? 'bg-[#EEF0F3] shadow-[inset_5px_5px_12px_rgba(163,170,181,0.20),inset_-5px_-5px_12px_rgba(255,255,255,0.90)]'
    : 'bg-[#F8F9FB] shadow-[8px_8px_18px_rgba(163,170,181,0.28),-8px_-8px_18px_rgba(255,255,255,0.95)] border border-[rgba(20,24,32,0.04)]';

  return (
    <div
      className={`rounded-[22px] p-5 md:p-6 transition-all duration-200 ${shadowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface NeumorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export const NeumorphicCard: React.FC<NeumorphicCardProps> = ({
  children,
  className = '',
  interactive = false,
  ...props
}) => {
  const interactiveClasses = interactive
    ? 'cursor-pointer hover:shadow-[10px_10px_22px_rgba(163,170,181,0.35),-10px_-10px_22px_rgba(255,255,255,0.98)] active:shadow-[inset_3px_3px_8px_rgba(163,170,181,0.30),inset_-2px_-2px_6px_rgba(255,255,255,0.90)]'
    : '';

  return (
    <div
      className={`bg-[#F7F8FA] rounded-[16px] p-4 transition-all duration-200 shadow-[8px_8px_18px_rgba(163,170,181,0.28),-8px_-8px_18px_rgba(255,255,255,0.95)] border border-[rgba(20,24,32,0.04)] ${interactiveClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
