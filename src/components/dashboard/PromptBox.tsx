import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useRouter } from '../../context/RouterContext';
import { useData } from '../../context/DataContext';
import { geminiService } from '../../services/geminiService';
import { CollectionAnalysis } from '../../types/ai';
import { AIRequirementReview } from './AIRequirementReview';
import { Button } from '../ui/Button';

export const PromptBox: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('Understanding request...');
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CollectionAnalysis | null>(null);

  const { navigate } = useRouter();
  const { addCollection } = useData();

  const examples = [
    'Find Java developer jobs in Delhi NCR',
    'Find SaaS companies in Bangalore',
    'Find AI startups founded after 2020',
  ];

  // Cycling loading progress hints
  useEffect(() => {
    if (!loading) return;
    const phases = [
      'Understanding request...',
      'Reading your requirements...',
      'Structuring the request...',
      'Preparing the collection plan...',
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % phases.length;
      setLoadingPhase(phases[i]);
    }, 900);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSelectExample = (exampleText: string) => {
    setPrompt(exampleText);
    setError(null);
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;

    setError(null);
    setLoading(true);
    setLoadingPhase('Understanding request...');

    try {
      const result = await geminiService.analyzeRequest(prompt);
      setAnalysis(result);
    } catch (err: any) {
      console.error('Request analysis failed:', err);
      setError('Unable to analyze the request right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRequirement = async (finalAnalysis: CollectionAnalysis) => {
    const title = finalAnalysis.location
      ? `${finalAnalysis.entity} — ${finalAnalysis.location}`
      : finalAnalysis.entity;

    const reqSummary = `${finalAnalysis.target_count || 100} records · ${
      finalAnalysis.location || 'Remote/Any'
    } · ${finalAnalysis.fields.length} fields (${finalAnalysis.fields
      .slice(0, 3)
      .map((f) => f.name)
      .join(', ')})`;

    const fieldNames = finalAnalysis.fields.map((f) => f.name);

    const newCol = await addCollection(
      title,
      finalAnalysis.query || prompt,
      reqSummary,
      'Ready',
      fieldNames
    );

    // Reset prompt and analysis state, then navigate to collection ready
    setAnalysis(null);
    setPrompt('');
    navigate(`/collections/${newCol.id}`);
  };

  // If analysis is ready, render the AI Requirement Review panel
  if (analysis) {
    return (
      <div className="mb-8">
        <AIRequirementReview
          initialAnalysis={analysis}
          originalPrompt={prompt}
          onConfirm={handleConfirmRequirement}
          onEditPrompt={() => setAnalysis(null)}
          onRetry={() => handleAnalyze()}
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F8F9FB] rounded-[22px] p-6 md:p-8 shadow-[8px_8px_18px_rgba(163,170,181,0.28),-8px_-8px_18px_rgba(255,255,255,0.95)] border border-[rgba(20,24,32,0.04)] mb-8">
      {/* Heading & Supporting Text */}
      <div className="mb-4 space-y-1">
        <div className="flex items-center gap-2">
          <Sparkles size={17} className="text-[#6D5DFB]" />
          <h2 className="text-lg md:text-xl font-bold text-[#17181C] tracking-tight">
            What do you want to find?
          </h2>
        </div>
        <p className="text-xs md:text-sm text-[#646974]">
          Describe the data you need in natural language.
        </p>
      </div>

      {/* Main Request Form */}
      <form onSubmit={handleAnalyze} className="space-y-4">
        <div className="relative">
          <label htmlFor="dashboard-prompt-input" className="sr-only">
            Describe the data you need
          </label>
          <textarea
            id="dashboard-prompt-input"
            name="prompt"
            aria-label="Describe the data you need in natural language"
            rows={4}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                handleAnalyze();
              }
            }}
            disabled={loading}
            placeholder="Find 100 Java developer jobs in Delhi NCR with company, salary, location and application link..."
            className="w-full min-h-[125px] md:min-h-[140px] bg-[#EEF0F3] text-[#17181C] placeholder-[#9297A1] text-sm md:text-base rounded-[14px] p-4 md:p-5 shadow-[inset_5px_5px_12px_rgba(163,170,181,0.20),inset_-5px_-5px_12px_rgba(255,255,255,0.90)] focus:outline-none focus:ring-1 focus:ring-[#6D5DFB]/40 focus:border-[#6D5DFB]/40 border border-[rgba(20,24,32,0.05)] transition-all resize-y"
          />
        </div>

        {/* Error Feedback State with Safe Retry (Section 13 & 14) */}
        {error && (
          <div className="flex items-center justify-between p-3.5 rounded-[12px] bg-[#F8F9FB] shadow-[inset_2px_2px_5px_rgba(217,92,92,0.15)] border border-[#D95C5C]/25 text-xs text-[#D95C5C] animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<RefreshCw size={13} />}
              onClick={() => handleAnalyze()}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Examples Section & Run Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          {/* Try an Example Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#9297A1] uppercase tracking-wider block">
              Try an example
            </span>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectExample(ex)}
                  className="px-3 py-1.5 rounded-[9px] bg-[#F8F9FB] text-xs font-medium text-[#646974] hover:text-[#17181C] shadow-[3px_3px_8px_rgba(163,170,181,0.22),-3px_-3px_8px_rgba(255,255,255,0.90)] hover:shadow-[4px_4px_10px_rgba(163,170,181,0.28),-4px_-4px_10px_rgba(255,255,255,0.95)] active:shadow-[inset_2px_2px_5px_rgba(163,170,181,0.25)] border border-[rgba(20,24,32,0.04)] cursor-pointer transition-all duration-150 text-left"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Run Button */}
          <div className="sm:self-end shrink-0">
            <button
              type="submit"
              disabled={!prompt.trim() || loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[12px] bg-[#6D5DFB] text-white hover:bg-[#5B4AE8] font-semibold text-sm shadow-[4px_4px_14px_rgba(109,93,251,0.32),-3px_-3px_9px_rgba(255,255,255,0.90)] hover:shadow-[5px_5px_16px_rgba(109,93,251,0.40),-4px_-4px_11px_rgba(255,255,255,0.95)] active:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.25)] active:translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer transition-all duration-180"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span className="text-xs">{loadingPhase}</span>
                </span>
              ) : (
                <>
                  <span>Run</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
