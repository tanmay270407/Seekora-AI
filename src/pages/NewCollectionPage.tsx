import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useData } from '../context/DataContext';
import { NeumorphicPanel } from '../components/ui/NeumorphicPanel';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { ArrowLeft, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { CollectionAnalysis } from '../types/ai';
import { AIRequirementReview } from '../components/dashboard/AIRequirementReview';

export const NewCollectionPage: React.FC = () => {
  const { navigate } = useRouter();
  const { addCollection } = useData();

  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [requirements, setRequirements] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittingPhase, setSubmittingPhase] = useState('Understanding request...');
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CollectionAnalysis | null>(null);

  // Cycling progress hints
  useEffect(() => {
    if (!submitting) return;
    const phases = [
      'Understanding request...',
      'Structuring requirements...',
      'Formulating collection plan...',
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % phases.length;
      setSubmittingPhase(phases[i]);
    }, 900);
    return () => clearInterval(interval);
  }, [submitting]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || submitting) return;

    setError(null);
    setSubmitting(true);
    setSubmittingPhase('Understanding request...');

    try {
      const fullPrompt = requirements.trim()
        ? `${prompt.trim()}\n[Additional Requirements: ${requirements.trim()}]`
        : prompt.trim();

      const result = await geminiService.analyzeRequest(fullPrompt);
      setAnalysis(result);
    } catch (err: any) {
      console.error('Gemini analysis failed in NewCollectionPage:', err);
      setError('Unable to analyze the request right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmRequirement = async (finalAnalysis: CollectionAnalysis) => {
    const finalTitle =
      title.trim() ||
      (finalAnalysis.location
        ? `${finalAnalysis.entity} — ${finalAnalysis.location}`
        : finalAnalysis.entity);

    const reqSummary = `${finalAnalysis.target_count || 100} records · ${
      finalAnalysis.location || 'Remote/Any'
    } · ${finalAnalysis.fields.length} fields (${finalAnalysis.fields
      .slice(0, 3)
      .map((f) => f.name)
      .join(', ')})`;

    const fieldNames = finalAnalysis.fields.map((f) => f.name);

    const newCol = await addCollection(
      finalTitle,
      finalAnalysis.query || prompt,
      reqSummary,
      'Ready',
      fieldNames
    );

    navigate(`/collections/${newCol.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/collections')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#646974] hover:text-[#17181C] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Collections</span>
        </button>
      </div>

      {analysis ? (
        /* AI Requirement Review & Confirmation */
        <AIRequirementReview
          initialAnalysis={analysis}
          originalPrompt={prompt}
          onConfirm={handleConfirmRequirement}
          onEditPrompt={() => setAnalysis(null)}
          onRetry={() => handleSubmit()}
        />
      ) : (
        /* New Collection Form */
        <NeumorphicPanel>
          <div className="mb-6 space-y-1">
            <h2 className="text-lg md:text-xl font-bold text-[#17181C]">
              New Collection
            </h2>
            <p className="text-xs md:text-sm text-[#646974]">
              Describe what you want Seekora AI to find.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Collection Name (Optional) */}
            <div>
              <label htmlFor="collection-title-input" className="block text-xs font-semibold text-[#646974] mb-2 uppercase tracking-wider">
                Collection Name <span className="text-[#9297A1] normal-case">(optional)</span>
              </label>
              <Input
                id="collection-title-input"
                placeholder="Optional collection name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* What do you want to find? */}
            <div>
              <label htmlFor="collection-prompt-input" className="block text-xs font-semibold text-[#646974] mb-2 uppercase tracking-wider">
                What do you want to find?
              </label>
              <textarea
                id="collection-prompt-input"
                name="prompt"
                rows={5}
                required
                placeholder="Describe the data you need in natural language (e.g. Find 100 Java developer jobs in Delhi NCR with company, salary, location)..."
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                className="w-full min-h-[130px] bg-[#EEF0F3] text-[#17181C] placeholder-[#9297A1] text-sm rounded-[13px] p-3.5 transition-all duration-200 shadow-[inset_5px_5px_12px_rgba(163,170,181,0.20),inset_-5px_-5px_12px_rgba(255,255,255,0.90)] focus:outline-none focus:ring-1 focus:ring-[#6D5DFB]/40 focus:border-[#6D5DFB]/40 border border-[rgba(20,24,32,0.06)] resize-y"
              />
            </div>

            {/* Additional requirements (Optional) */}
            <div>
              <label htmlFor="collection-requirements-input" className="block text-xs font-semibold text-[#646974] mb-2 uppercase tracking-wider">
                Additional requirements <span className="text-[#9297A1] normal-case">(optional)</span>
              </label>
              <Textarea
                id="collection-requirements-input"
                rows={3}
                placeholder="e.g. Only remote jobs, Include salary, Avoid duplicate companies, Return at least 100 results..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
            </div>

            {/* Error Message with Retry */}
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
                  onClick={() => handleSubmit()}
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-4 border-t border-[#E4E7EC] flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate('/collections')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="md"
                disabled={!prompt.trim() || submitting}
                icon={!submitting && <ArrowRight size={15} />}
                iconPosition="right"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>{submittingPhase}</span>
                  </span>
                ) : (
                  'Start Collection'
                )}
              </Button>
            </div>
          </form>
        </NeumorphicPanel>
      )}
    </div>
  );
};
