import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
  return (
    <div className="bg-[#F8F9FB] rounded-[16px] p-5 shadow-[8px_8px_18px_rgba(163,170,181,0.28),-8px_-8px_18px_rgba(255,255,255,0.95)] border border-[rgba(20,24,32,0.04)] transition-transform">
      <p className="text-xs font-semibold text-[#646974] tracking-wider uppercase mb-1.5">
        {label}
      </p>
      <p className="text-2xl md:text-3xl font-bold text-[#17181C] font-mono tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
};
