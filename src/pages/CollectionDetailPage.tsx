import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useData } from '../context/DataContext';
import { NeumorphicPanel } from '../components/ui/NeumorphicPanel';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import {
  ArrowLeft,
  FileSpreadsheet,
  Play,
  Layers,
  Edit,
  CheckCircle2,
  Sparkles,
  Info,
  Trash2,
} from 'lucide-react';

interface CollectionDetailPageProps {
  id: string;
}

export const CollectionDetailPage: React.FC<CollectionDetailPageProps> = ({ id }) => {
  const { navigate } = useRouter();
  const { getCollection, updateCollectionStatus, updateCollection, executeCollection, deleteCollection } = useData();
  const col = getCollection(id);

  const [isRunningWorkflow, setIsRunningWorkflow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(col?.title || '');
  const [editRequirements, setEditRequirements] = useState(col?.requirements || '');

  if (!col) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#646974]">Collection not found</p>
        <Button
          size="sm"
          className="mt-4"
          onClick={() => navigate('/collections')}
        >
          Return to Collections
        </Button>
      </div>
    );
  }

  // 7-Stage pipeline execution per Section 6 & 26
  const stages = [
    { label: 'Understanding request', desc: 'Validating collection parameters & schema' },
    { label: 'Preparing sources', desc: 'Connecting to permitted demo API feeds' },
    { label: 'Collecting records', desc: 'Fetching raw candidates from sources' },
    { label: 'Normalizing data', desc: 'Mapping fields to uniform data model' },
    { label: 'Validating records', desc: 'Checking field types and constraints' },
    { label: 'Removing duplicates', desc: 'Evaluating composite uniqueness signatures' },
    { label: 'Preparing results', desc: 'Attributing provenance and building dataset' },
  ];

  const handleRunCollection = async () => {
    setIsRunningWorkflow(true);
    setCurrentStep(0);
    updateCollectionStatus(col.id, 'Running');

    for (let i = 0; i < stages.length - 1; i++) {
      setCurrentStep(i);
      await new Promise((resolve) => setTimeout(resolve, 380));
      if (i === 2) {
        updateCollectionStatus(col.id, 'Processing');
      }
    }

    setCurrentStep(stages.length - 1);
    await executeCollection(col.id);
    await new Promise((resolve) => setTimeout(resolve, 400));

    setIsRunningWorkflow(false);
    navigate(`/results/${col.id}`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCollection(col.id, {
      title: editTitle.trim() || col.title,
      requirements: editRequirements.trim() || undefined,
    });
    setIsEditModalOpen(false);
  };

  const handleDelete = async () => {
    await deleteCollection(col.id);
    navigate('/collections');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation breadcrumb */}
      <div>
        <button
          onClick={() => navigate('/collections')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#646974] hover:text-[#17181C] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Collections</span>
        </button>
      </div>

      {/* Main Details Panel */}
      <NeumorphicPanel className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#E4E7EC]">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-[#17181C]">
                {col.title}
              </h1>
              <StatusBadge status={col.status} isDemo={col.isDemo} />
            </div>
            <p className="text-xs text-[#646974]">
              Created {col.createdAt} · Last updated {col.updatedAt}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={<Trash2 size={14} className="text-[#D95C5C]" />}
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-[#D95C5C] hover:text-[#D95C5C]"
            >
              Delete
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<Edit size={14} />}
              onClick={() => {
                setEditTitle(col.title);
                setEditRequirements(col.requirements || '');
                setIsEditModalOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              size="sm"
              disabled={isRunningWorkflow}
              icon={!isRunningWorkflow && <Play size={14} />}
              onClick={handleRunCollection}
            >
              {isRunningWorkflow ? 'Collecting...' : 'Run Collection'}
            </Button>
          </div>
        </div>

        {/* Demo source notice (Section 3, 5, 32) */}
        <div className="flex items-start gap-2.5 p-3 rounded-[12px] bg-[#F8F9FB] shadow-[inset_2px_2px_5px_rgba(163,170,181,0.18)] border border-[#C98A25]/20 text-xs text-[#646974]">
          <Info size={16} className="text-[#C98A25] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#17181C]">Development Environment:</span>{' '}
            Data is retrieved from authorized test datasets and demo source adapters. No unauthorized scraping is performed.
          </div>
        </div>

        {/* 7-Stage Collection Progress Pipeline (Section 6 & 26) */}
        {isRunningWorkflow && (
          <div className="p-5 rounded-[16px] bg-[#EEF0F3] shadow-[inset_4px_4px_10px_rgba(163,170,181,0.20),inset_-4px_-4px_10px_rgba(255,255,255,0.90)] space-y-4 border border-[rgba(20,24,32,0.04)] animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#6D5DFB] animate-pulse" />
                <h3 className="text-sm font-bold text-[#17181C]">
                  Collection Execution Pipeline
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#6D5DFB] font-semibold">
                Stage {currentStep + 1} of {stages.length}
              </span>
            </div>

            <div className="space-y-2">
              {stages.map((st, idx) => {
                const isCompleted = idx < currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-[10px] text-xs transition-all ${
                      isCurrent
                        ? 'bg-[#F8F9FB] shadow-[3px_3px_8px_rgba(163,170,181,0.20),-3px_-3px_8px_rgba(255,255,255,0.90)] font-semibold text-[#17181C]'
                        : isCompleted
                        ? 'text-[#22A879]'
                        : 'text-[#9297A1]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 flex justify-center">
                        {isCompleted ? (
                          <CheckCircle2 size={15} className="text-[#22A879]" />
                        ) : isCurrent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#6D5DFB] animate-ping" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[#9297A1]" />
                        )}
                      </span>
                      <span>{st.label}</span>
                    </div>
                    <span className="text-[11px] text-[#9297A1] hidden sm:inline font-mono">
                      {st.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Natural Language Request */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9297A1]">
            Natural-Language Request
          </p>
          <div className="p-4 rounded-[14px] bg-[#EEF0F3] text-sm text-[#17181C] shadow-[inset_4px_4px_10px_rgba(163,170,181,0.20),inset_-4px_-4px_10px_rgba(255,255,255,0.90)]">
            {col.prompt}
          </div>
        </div>

        {/* Requirements */}
        {col.requirements && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9297A1]">
              Requirements
            </p>
            <div className="p-3.5 rounded-[12px] bg-[#EEF0F3] text-xs text-[#646974] shadow-[inset_3px_3px_7px_rgba(163,170,181,0.18)]">
              {col.requirements}
            </div>
          </div>
        )}

        {/* Dynamic Fields List */}
        {col.fieldsList && col.fieldsList.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9297A1]">
              Target Fields ({col.fieldsList.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {col.fieldsList.map((fld, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-[8px] bg-[#EEF0F3] text-xs font-medium text-[#17181C] shadow-[inset_1px_1px_3px_rgba(163,170,181,0.20)]"
                >
                  {fld}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-[#EEF0F3] p-4 rounded-[14px] shadow-[inset_3px_3px_7px_rgba(163,170,181,0.18)]">
            <p className="text-xs text-[#646974] mb-1">Records</p>
            <p className="text-xl font-bold font-mono tabular-nums text-[#17181C]">
              {col.recordCount}
            </p>
          </div>
          <div className="bg-[#EEF0F3] p-4 rounded-[14px] shadow-[inset_3px_3px_7px_rgba(163,170,181,0.18)]">
            <p className="text-xs text-[#646974] mb-1">Sources</p>
            <p className="text-xl font-bold font-mono tabular-nums text-[#17181C]">
              {col.sources?.length || 1}
            </p>
          </div>
          <div className="bg-[#EEF0F3] p-4 rounded-[14px] shadow-[inset_3px_3px_7px_rgba(163,170,181,0.18)] col-span-2 sm:col-span-1">
            <p className="text-xs text-[#646974] mb-1">Status</p>
            <div className="mt-1">
              <StatusBadge status={col.status} />
            </div>
          </div>
        </div>

        {/* Sources list */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9297A1]">
            Target Data Sources
          </p>
          <div className="flex flex-wrap gap-2">
            {col.sources?.map((src, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#EEF0F3] text-xs font-medium text-[#17181C] shadow-[inset_2px_2px_4px_rgba(163,170,181,0.20)] border border-[rgba(20,24,32,0.03)]"
              >
                <Layers size={12} className="text-[#6D5DFB]" />
                {src}
              </span>
            ))}
          </div>
        </div>

        {/* View Results Link if completed */}
        {col.status === 'Completed' && (
          <div className="pt-2 flex justify-end">
            <Button
              size="sm"
              variant="secondary"
              icon={<FileSpreadsheet size={14} />}
              onClick={() => navigate(`/results/${col.id}`)}
            >
              View Results ({col.recordCount})
            </Button>
          </div>
        )}
      </NeumorphicPanel>

      {/* Edit Collection Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Collection"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#646974] mb-1.5 uppercase tracking-wider">
              Collection Name
            </label>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#646974] mb-1.5 uppercase tracking-wider">
              Additional Requirements
            </label>
            <Textarea
              rows={3}
              value={editRequirements}
              onChange={(e) => setEditRequirements(e.target.value)}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal (Section 11) */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Collection"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#646974]">
            Are you sure you want to delete <strong className="text-[#17181C]">&quot;{col.title}&quot;</strong> and its associated extraction data? This action cannot be undone.
          </p>
          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDelete}
              className="bg-[#D95C5C] hover:bg-[#c54f4f] text-white"
            >
              Delete Collection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
