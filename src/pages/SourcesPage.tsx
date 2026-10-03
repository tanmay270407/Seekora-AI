import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { NeumorphicCard } from '../components/ui/NeumorphicCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Layers, ShieldCheck, ExternalLink, Info, CheckCircle2, Clock } from 'lucide-react';
import { DataSource } from '../types';

export const SourcesPage: React.FC = () => {
  const { sources, toggleSource, collections } = useData();
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);

  const getCollectionsUsingSource = (sourceName: string) => {
    return collections.filter((c) =>
      c.sources.some(
        (s) =>
          s.toLowerCase().includes(sourceName.toLowerCase()) ||
          sourceName.toLowerCase().includes(s.toLowerCase())
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#17181C]">Data Sources</h1>
          <p className="text-xs text-[#646974] mt-0.5">
            Permitted extraction channels, rate limits, and source provenance
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#EEF0F3] text-xs text-[#646974] shadow-[inset_2px_2px_4px_rgba(163,170,181,0.18)]">
          <ShieldCheck size={14} className="text-[#22A879]" />
          <span>Strict Rate Limits & Permitted Datasets Only</span>
        </div>
      </div>

      {/* Development Environment Disclaimer Banner */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-[14px] bg-[#F8F9FB] shadow-[inset_3px_3px_7px_rgba(163,170,181,0.18)] border border-[#C98A25]/20 text-xs text-[#646974]">
        <Info size={16} className="text-[#C98A25] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#17181C]">Data Collection Policy:</span>{' '}
          Seekora AI strictly adheres to authorized access. We do not support unauthorized scraping, CAPTCHA bypass, or bypassing robots.txt. Development channels are clearly labeled as Demo / Mock Sources.
        </div>
      </div>

      {/* Sources Grid (Sections 15 & 16) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((src) => (
          <NeumorphicCard
            key={src.id}
            className="flex flex-col justify-between cursor-pointer hover:border-[#6D5DFB]/30 transition-all duration-200"
            onClick={() => setSelectedSource(src)}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[10px] bg-[#EEF0F3] flex items-center justify-center text-[#6D5DFB] shadow-[inset_2px_2px_4px_rgba(163,170,181,0.20)]">
                    <Layers size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#17181C] hover:text-[#6D5DFB] transition-colors">
                      {src.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#EEF0F3] text-[#646974]">
                        {src.type}
                      </span>
                      <span className="text-[11px] text-[#9297A1]">{src.category}</span>
                    </div>
                  </div>
                </div>

                {/* Tactile Light Toggle Switch (prevent modal on toggle) */}
                <div onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => toggleSource(src.id)}
                    aria-label={`Toggle ${src.name}`}
                    className="w-11 h-6 rounded-full p-1 transition-all duration-200 cursor-pointer bg-[#EEF0F3] shadow-[inset_2px_2px_5px_rgba(163,170,181,0.25)] border border-[rgba(20,24,32,0.04)]"
                  >
                    <div
                      className={`w-4 h-4 rounded-full transition-transform duration-200 ${
                        src.enabled
                          ? 'translate-x-5 bg-[#22A879] shadow-[1px_1px_3px_rgba(0,0,0,0.15)]'
                          : 'translate-x-0 bg-[#9297A1]'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Status and Last Used */}
              <div className="flex items-center justify-between text-xs py-2">
                <StatusBadge status={src.status} isDemo={src.isDemo} />
                <span className="text-[11px] font-mono text-[#9297A1]">
                  Last used: {src.lastUsed || 'Today'}
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E4E7EC] text-xs">
                <div>
                  <span className="text-[#9297A1] block mb-0.5">Rate Limit</span>
                  <span className="text-[#646974] font-mono tabular-nums">
                    {src.rateLimit}
                  </span>
                </div>
                <div>
                  <span className="text-[#9297A1] block mb-0.5">Records Indexed</span>
                  <span className="text-[#17181C] font-mono tabular-nums font-semibold">
                    {src.recordsIndexed}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-2 flex justify-end">
              <span className="text-xs font-semibold text-[#6D5DFB] hover:underline inline-flex items-center gap-1">
                View Details <ExternalLink size={11} />
              </span>
            </div>
          </NeumorphicCard>
        ))}
      </div>

      {/* Source Details Modal (Section 16) */}
      <Modal
        isOpen={Boolean(selectedSource)}
        onClose={() => setSelectedSource(null)}
        title="Source Details & Provenance"
      >
        {selectedSource && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
              <div>
                <h3 className="text-base font-bold text-[#17181C]">
                  {selectedSource.name}
                </h3>
                <span className="text-[11px] font-mono text-[#646974]">
                  Type: {selectedSource.type}
                </span>
              </div>
              <StatusBadge status={selectedSource.status} isDemo={selectedSource.isDemo} />
            </div>

            <div className="p-3.5 rounded-[12px] bg-[#EEF0F3] shadow-[inset_2px_2px_5px_rgba(163,170,181,0.18)] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#646974]">Endpoint / Dataset:</span>
                <span className="font-mono text-[#6D5DFB]">
                  {selectedSource.endpointUrl || 'https://api.seekora.demo/v1'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#646974]">Rate Limit Quota:</span>
                <span className="font-mono text-[#17181C]">{selectedSource.rateLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#646974]">Total Records Indexed:</span>
                <span className="font-mono font-bold text-[#17181C]">
                  {selectedSource.recordsIndexed}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#646974]">Last Extraction:</span>
                <span className="font-mono text-[#17181C]">
                  {selectedSource.lastUsed || 'Today'}
                </span>
              </div>
            </div>

            {/* Description */}
            {selectedSource.description && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-[#646974] uppercase tracking-wider block">
                  Description & Compliance
                </span>
                <p className="text-xs text-[#646974] bg-[#F8F9FB] p-3 rounded-[10px] border border-[rgba(20,24,32,0.04)]">
                  {selectedSource.description}
                </p>
              </div>
            )}

            {/* Collections Using this source */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#646974] uppercase tracking-wider block">
                Collections Using This Source
              </span>
              <div className="space-y-1.5">
                {getCollectionsUsingSource(selectedSource.name).length > 0 ? (
                  getCollectionsUsingSource(selectedSource.name).map((col) => (
                    <div
                      key={col.id}
                      className="flex items-center justify-between p-2 rounded-[8px] bg-[#EEF0F3] text-xs shadow-[inset_1px_1px_3px_rgba(163,170,181,0.18)]"
                    >
                      <span className="font-medium text-[#17181C]">{col.title}</span>
                      <span className="font-mono text-[#646974] text-[11px]">
                        {col.recordCount} records
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#9297A1] italic">
                    Currently configured across general collection templates.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => setSelectedSource(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
