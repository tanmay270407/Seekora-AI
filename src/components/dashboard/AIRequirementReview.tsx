import React, { useState } from 'react';
import { CollectionAnalysis, CollectionField } from '../../types/ai';
import { NeumorphicPanel } from '../ui/NeumorphicPanel';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Plus,
  X,
  ArrowRight,
  Layers,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

interface AIRequirementReviewProps {
  initialAnalysis: CollectionAnalysis;
  originalPrompt: string;
  onConfirm: (finalAnalysis: CollectionAnalysis) => void;
  onEditPrompt: () => void;
  onRetry: () => void;
}

export const AIRequirementReview: React.FC<AIRequirementReviewProps> = ({
  initialAnalysis,
  originalPrompt,
  onConfirm,
  onEditPrompt,
  onRetry,
}) => {
  const [analysis, setAnalysis] = useState<CollectionAnalysis>(initialAnalysis);

  // Inline edit states
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationValue, setLocationValue] = useState(analysis.location || '');

  const [editingTarget, setEditingTarget] = useState(false);
  const [targetValue, setTargetValue] = useState(analysis.target_count?.toString() || '100');

  const [newFieldName, setNewFieldName] = useState('');
  const [isAddingField, setIsAddingField] = useState(false);

  // Clarification state handling
  const [clarificationAnswer, setClarificationAnswer] = useState('');

  const handleSaveLocation = () => {
    setAnalysis((prev) => ({
      ...prev,
      location: locationValue.trim() || null,
    }));
    setEditingLocation(false);
  };

  const handleSaveTarget = () => {
    const num = parseInt(targetValue, 10);
    setAnalysis((prev) => ({
      ...prev,
      target_count: !isNaN(num) && num > 0 ? num : 100,
    }));
    setEditingTarget(false);
  };

  const handleRemoveField = (fieldName: string) => {
    if (analysis.fields.length <= 1) return;
    setAnalysis((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.name.toLowerCase() !== fieldName.toLowerCase()),
    }));
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;

    const newField: CollectionField = {
      name: newFieldName.trim(),
      description: `Custom requested field: ${newFieldName.trim()}`,
      required: true,
    };

    setAnalysis((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
    setNewFieldName('');
    setIsAddingField(false);
  };

  const handleClarificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarificationAnswer.trim()) return;

    // Apply clarification locally
    if (analysis.clarification_field === 'location') {
      setAnalysis((prev) => ({
        ...prev,
        location: clarificationAnswer.trim(),
        needs_clarification: false,
      }));
    } else if (analysis.clarification_field === 'target_count') {
      const num = parseInt(clarificationAnswer, 10);
      setAnalysis((prev) => ({
        ...prev,
        target_count: !isNaN(num) ? num : 100,
        needs_clarification: false,
      }));
    } else {
      setAnalysis((prev) => ({
        ...prev,
        entity: `${prev.entity} (${clarificationAnswer.trim()})`,
        needs_clarification: false,
      }));
    }
  };

  // 1. Clarification State (Section 7 & 8)
  if (analysis.needs_clarification && analysis.clarification_question) {
    return (
      <NeumorphicPanel className="space-y-5 animate-fadeIn">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E4E7EC]">
          <div className="w-8 h-8 rounded-[10px] bg-[#EEF0F3] text-[#6D5DFB] flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(163,170,181,0.20)]">
            <HelpCircle size={16} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#17181C]">
              I need a little more information
            </h3>
            <p className="text-xs text-[#646974]">
              Clarify a detail to build an optimal collection workflow.
            </p>
          </div>
        </div>

        <form onSubmit={handleClarificationSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#17181C] mb-2">
              {analysis.clarification_question}
            </label>
            <Input
              value={clarificationAnswer}
              onChange={(e) => setClarificationAnswer(e.target.value)}
              placeholder="e.g. Delhi NCR, 100, Senior level..."
              autoFocus
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={onEditPrompt}>
              Edit Request
            </Button>
            <Button type="submit" size="sm" icon={<ArrowRight size={14} />} iconPosition="right">
              Continue
            </Button>
          </div>
        </form>
      </NeumorphicPanel>
    );
  }

  // 2. Full Requirement Review Panel (Section 5, 6, 9, 10, 11, 12)
  const confidencePercent = Math.round((analysis.confidence || 0.94) * 100);

  return (
    <NeumorphicPanel className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E7EC]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-[#22A879]/15 text-[#22A879] flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-[#17181C]">
              Request understood
            </h3>
            <p className="text-xs text-[#646974]">
              Review and adjust the extracted specification before collection.
            </p>
          </div>
        </div>

        {/* Subtle AI Confidence */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#EEF0F3] text-xs font-mono text-[#646974] self-start sm:self-auto shadow-[inset_2px_2px_4px_rgba(163,170,181,0.20)]">
          <Sparkles size={13} className="text-[#6D5DFB]" />
          <span>AI confidence</span>
          <span className="font-bold text-[#17181C]">{confidencePercent}%</span>
        </div>
      </div>

      {/* Primary Spec Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Intent & Entity */}
        <div className="p-4 rounded-[14px] bg-[#EEF0F3] shadow-[inset_3px_3px_7px_rgba(163,170,181,0.18)] space-y-1">
          <span className="text-[11px] font-semibold text-[#9297A1] uppercase tracking-wider block">
            Intent
          </span>
          <p className="text-sm font-bold text-[#17181C]">{analysis.intent}</p>
          <span className="text-xs text-[#646974] block pt-1">
            Entity: <strong className="text-[#17181C] font-semibold">{analysis.entity}</strong>
          </span>
        </div>

        {/* Location (Editable) */}
        <div className="p-4 rounded-[14px] bg-[#EEF0F3] shadow-[inset_3px_3px_7px_rgba(163,170,181,0.18)] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#9297A1] uppercase tracking-wider">
              Location
            </span>
            {!editingLocation && (
              <button
                type="button"
                onClick={() => setEditingLocation(true)}
                className="text-xs font-medium text-[#6D5DFB] hover:text-[#5B4AE8] inline-flex items-center gap-1 cursor-pointer"
              >
                <Edit2 size={11} /> Edit
              </button>
            )}
          </div>

          {editingLocation ? (
            <div className="flex items-center gap-2 pt-1">
              <Input
                value={locationValue}
                onChange={(e) => setLocationValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveLocation();
                  }
                }}
                placeholder="e.g. Delhi NCR, Remote..."
                className="py-1.5 text-xs"
                autoFocus
              />
              <Button size="sm" onClick={handleSaveLocation}>
                Save
              </Button>
            </div>
          ) : (
            <p className="text-sm font-bold text-[#17181C]">
              {analysis.location || 'Any / Remote'}
            </p>
          )}
        </div>

        {/* Target Count (Editable) */}
        <div className="p-4 rounded-[14px] bg-[#EEF0F3] shadow-[inset_3px_3px_7px_rgba(163,170,181,0.18)] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#9297A1] uppercase tracking-wider">
              Target Records
            </span>
            {!editingTarget && (
              <button
                type="button"
                onClick={() => setEditingTarget(true)}
                className="text-xs font-medium text-[#6D5DFB] hover:text-[#5B4AE8] inline-flex items-center gap-1 cursor-pointer"
              >
                <Edit2 size={11} /> Edit
              </button>
            )}
          </div>

          {editingTarget ? (
            <div className="flex items-center gap-2 pt-1">
              <Input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveTarget();
                  }
                }}
                className="py-1.5 text-xs"
                autoFocus
              />
              <Button size="sm" onClick={handleSaveTarget}>
                Save
              </Button>
            </div>
          ) : (
            <p className="text-sm font-bold font-mono text-[#17181C]">
              {analysis.target_count || 100} records
            </p>
          )}
        </div>

        {/* Recommended Source Types */}
        <div className="p-4 rounded-[14px] bg-[#EEF0F3] shadow-[inset_3px_3px_7px_rgba(163,170,181,0.18)] space-y-1.5">
          <span className="text-[11px] font-semibold text-[#9297A1] uppercase tracking-wider block">
            Recommended Sources
          </span>
          <div className="flex flex-wrap gap-1.5">
            {analysis.source_types.map((src, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-[8px] bg-[#F8F9FB] text-xs font-medium text-[#17181C] shadow-[2px_2px_5px_rgba(163,170,181,0.20),-2px_-2px_5px_rgba(255,255,255,0.90)] border border-[rgba(20,24,32,0.03)]"
              >
                {src}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Required Fields (Editable Pill Badges) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#646974] uppercase tracking-wider">
            Extraction Fields ({analysis.fields.length})
          </span>
          {!isAddingField && (
            <button
              type="button"
              onClick={() => setIsAddingField(true)}
              className="text-xs font-semibold text-[#6D5DFB] hover:text-[#5B4AE8] inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus size={12} /> Add Field
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {analysis.fields.map((fld) => (
            <span
              key={fld.name}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#EEF0F3] text-xs font-medium text-[#17181C] shadow-[inset_2px_2px_5px_rgba(163,170,181,0.22),inset_-2px_-2px_5px_rgba(255,255,255,0.85)] border border-[rgba(20,24,32,0.03)]"
            >
              <span>{fld.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveField(fld.name)}
                className="text-[#9297A1] hover:text-[#D95C5C] p-0.5 rounded transition-colors cursor-pointer"
                title={`Remove ${fld.name}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}

          {isAddingField && (
            <form onSubmit={handleAddField} className="inline-flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Field name"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-[8px] bg-[#EEF0F3] shadow-[inset_2px_2px_5px_rgba(163,170,181,0.22)] focus:outline-none focus:ring-1 focus:ring-[#6D5DFB]/40 text-[#17181C] w-28"
                autoFocus
              />
              <button
                type="submit"
                className="px-2 py-1 text-xs rounded-[8px] bg-[#6D5DFB] text-white hover:bg-[#5B4AE8] font-medium cursor-pointer"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAddingField(false)}
                className="p-1 text-[#9297A1] hover:text-[#17181C] cursor-pointer"
              >
                <X size={13} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Proposed Collection Workflow (Section 9) */}
      <div className="space-y-2 pt-2">
        <span className="text-xs font-semibold text-[#646974] uppercase tracking-wider block">
          Proposed Collection Workflow
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {analysis.suggested_workflow.map((step, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-2 rounded-[10px] bg-[#F8F9FB] shadow-[3px_3px_8px_rgba(163,170,181,0.18),-3px_-3px_8px_rgba(255,255,255,0.90)] text-xs text-[#17181C] border border-[rgba(20,24,32,0.03)]"
            >
              <span className="w-5 h-5 rounded-[6px] bg-[#EEF0F3] flex items-center justify-center font-mono font-semibold text-[11px] text-[#6D5DFB] shrink-0 shadow-[inset_1px_1px_3px_rgba(163,170,181,0.20)]">
                {idx + 1}
              </span>
              <span className="truncate">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Actions (Section 11) */}
      <div className="pt-5 border-t border-[#E4E7EC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-[#646974]">
          <span className="font-semibold text-[#17181C]">Ready to collect?</span>{' '}
          Confirm the plan to stage the dataset pipeline.
        </div>

        <div className="flex items-center gap-2.5">
          <Button type="button" variant="ghost" size="sm" onClick={onEditPrompt}>
            Edit Request
          </Button>
          <Button
            type="button"
            size="md"
            icon={<ArrowRight size={15} />}
            iconPosition="right"
            onClick={() => onConfirm(analysis)}
          >
            Start Collection
          </Button>
        </div>
      </div>
    </NeumorphicPanel>
  );
};
