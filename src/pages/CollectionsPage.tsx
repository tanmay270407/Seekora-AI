import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useRouter } from '../context/RouterContext';
import { CollectionCard } from '../components/dashboard/CollectionCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { Plus, Search } from 'lucide-react';
import { CollectionStatus } from '../types';

export const CollectionsPage: React.FC = () => {
  const { collections } = useData();
  const { navigate } = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | CollectionStatus>('All');

  const filtered = collections.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.prompt?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === 'All' || c.status === filter;
    return matchesSearch && matchesStatus;
  });

  const filterTabs: Array<'All' | CollectionStatus> = [
    'All',
    'Running',
    'Completed',
    'Draft',
    'Ready',
  ];

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all duration-180 cursor-pointer whitespace-nowrap ${
                filter === tab
                  ? 'bg-[#EEF0F3] text-[#6D5DFB] shadow-[inset_3px_3px_7px_rgba(163,170,181,0.25),inset_-2px_-2px_5px_rgba(255,255,255,0.90)] border border-[#6D5DFB]/25'
                  : 'bg-[#F8F9FB] text-[#646974] hover:text-[#17181C] shadow-[3px_3px_8px_rgba(163,170,181,0.22),-3px_-3px_8px_rgba(255,255,255,0.90)] border border-[rgba(20,24,32,0.04)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & New Collection Action */}
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-64">
            <Input
              icon={<Search size={14} />}
              placeholder="Search collections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/collections/new')}
            icon={<Plus size={14} />}
          >
            New Collection
          </Button>
        </div>
      </div>

      {/* Grid or Empty */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((col, idx) => (
            <CollectionCard key={col.id || `col-${idx}`} collection={col} />
          ))}
        </div>
      ) : collections.length > 0 ? (
        <EmptyState
          title="No matching collections found"
          description="Try adjusting your search terms or status filter to see other collections."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearch('');
            setFilter('All');
          }}
        />
      ) : (
        <EmptyState
          title="No collections yet"
          description="Create your first collection by describing the data you need."
          actionLabel="Create Collection"
          onAction={() => navigate('/collections/new')}
        />
      )}
    </div>
  );
};
