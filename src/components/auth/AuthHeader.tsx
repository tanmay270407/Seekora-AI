import React from 'react';
import { useRouter } from '../../context/RouterContext';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  const { navigate } = useRouter();

  return (
    <div className="text-center mb-6 space-y-2">
      {/* Seekora AI Brand Icon & Name */}
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-2.5 mx-auto group cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6D5DFB]/50 rounded-[12px] p-1"
      >
        <div className="w-9 h-9 rounded-[10px] bg-[#F8F9FB] flex items-center justify-center text-[#6D5DFB] shadow-[4px_4px_10px_rgba(163,170,181,0.25),-4px_-4px_10px_rgba(255,255,255,0.95)] border border-[rgba(20,24,32,0.04)] font-bold text-base group-hover:scale-105 transition-transform">
          ✦
        </div>
        <span className="font-bold text-base tracking-tight text-[#17181C]">
          Seekora AI
        </span>
      </button>

      {/* Page Title & Subtitle */}
      <div className="pt-2 space-y-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#17181C]">
          {title}
        </h1>
        <p className="text-xs md:text-sm text-[#646974] max-w-xs mx-auto">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
