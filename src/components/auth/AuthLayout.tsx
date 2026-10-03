import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#17181C] flex flex-col justify-between items-center px-4 py-8 md:py-12">
      {/* Top spacer */}
      <div className="w-full max-w-[440px] flex justify-start">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#646974] hover:text-[#17181C] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6D5DFB]/40 rounded-[8px] px-2 py-1"
        >
          <ArrowLeft size={13} />
          <span>Back to workspace</span>
        </button>
      </div>

      {/* Centered Elevated Neumorphic Card */}
      <div className="w-full max-w-[440px] my-auto">
        <div className="bg-[#F8F9FB] rounded-[22px] p-6 sm:p-8 shadow-[8px_8px_18px_rgba(163,170,181,0.28),-8px_-8px_18px_rgba(255,255,255,0.95)] border border-[rgba(20,24,32,0.04)]">
          {children}
        </div>
      </div>

      {/* Bottom quiet footer */}
      <div className="text-center pt-6 text-xs text-[#9297A1]">
        <p>Seekora AI · Intelligent Data Intelligence Platform</p>
      </div>
    </div>
  );
};
