import React from 'react';
import { CollectionItem } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { useRouter } from '../../context/RouterContext';
import { ArrowUpRight } from 'lucide-react';

interface CollectionCardProps {
  collection: CollectionItem;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {
  const { navigate } = useRouter();

  const handleCardClick = () => {
    if (collection.status === 'Completed') {
      navigate(`/results/${collection.id}`);
    } else {
      navigate(`/collections/${collection.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-[#F7F8FA] rounded-[16px] p-5 shadow-[8px_8px_18px_rgba(163,170,181,0.28),-8px_-8px_18px_rgba(255,255,255,0.95)] hover:shadow-[10px_10px_22px_rgba(163,170,181,0.35),-10px_-10px_22px_rgba(255,255,255,0.98)] border border-[rgba(20,24,32,0.04)] hover:border-[#6D5DFB]/30 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-base text-[#17181C] group-hover:text-[#6D5DFB] transition-colors truncate">
            {collection.title}
          </h3>
          <span className="text-[#6D5DFB] p-0.5 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
            <ArrowUpRight size={16} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xl font-bold font-mono tabular-nums text-[#17181C]">
            {collection.recordCount}
          </span>
          <span className="text-xs text-[#646974]">records</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#E4E7EC] text-xs">
        <StatusBadge status={collection.status} />
        <span className="text-[#9297A1] font-mono tabular-nums text-[11px]">
          {collection.updatedAt}
        </span>
      </div>
    </div>
  );
};
