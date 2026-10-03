import React from 'react';
import { PromptBox } from '../components/dashboard/PromptBox';
import { StatCard } from '../components/dashboard/StatCard';
import { CollectionCard } from '../components/dashboard/CollectionCard';
import { useData } from '../context/DataContext';
import { useRouter } from '../context/RouterContext';
import { ArrowRight } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { stats, recentCollections } = useData();
  const { navigate } = useRouter();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Visual Focus: AI Prompt Box */}
      <PromptBox />

      {/* ONLY Three Statistics per spec */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Tasks" value={stats.tasks} />
        <StatCard label="Records" value={stats.records} />
        <StatCard label="Sources" value={stats.sources} />
      </div>

      {/* Recent Collections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-semibold text-[#17181C]">
            Recent Collections
          </h2>
          <button
            onClick={() => navigate('/collections')}
            className="text-xs font-semibold text-[#6D5DFB] hover:text-[#5B4AE8] transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View all</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {recentCollections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentCollections.map((col, idx) => (
              <CollectionCard key={col.id || `rec-col-${idx}`} collection={col} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-[16px] bg-[#F8F9FB] shadow-[4px_4px_12px_rgba(163,170,181,0.22),-4px_-4px_12px_rgba(255,255,255,0.95)] border border-[rgba(20,24,32,0.04)] text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#EEF0F3] text-[#6D5DFB] flex items-center justify-center mx-auto shadow-[inset_2px_2px_4px_rgba(163,170,181,0.20)]">
              ✦
            </div>
            <div>
              <p className="text-sm font-semibold text-[#17181C]">No collections created yet</p>
              <p className="text-xs text-[#646974] mt-0.5">
                Type what data you need in the prompt box above or create a new collection to begin.
              </p>
            </div>
            <button
              onClick={() => navigate('/collections/new')}
              className="text-xs font-semibold text-[#6D5DFB] hover:text-[#5B4AE8] transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              Start a custom collection <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
