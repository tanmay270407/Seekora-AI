import React from 'react';
import { useData } from '../context/DataContext';
import { useRouter } from '../context/RouterContext';
import { NeumorphicPanel } from '../components/ui/NeumorphicPanel';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { ArrowUpRight } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { history } = useData();
  const { navigate } = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#17181C]">Run History</h2>
          <p className="text-xs text-[#646974] mt-0.5">
            Audit log of executed collection tasks
          </p>
        </div>
      </div>

      <NeumorphicPanel className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E4E7EC] text-[#646974] uppercase font-mono tracking-wider bg-[#F4F5F7]">
                <th className="py-3 px-5 font-semibold">Task</th>
                <th className="py-3 px-5 font-semibold">Extracted</th>
                <th className="py-3 px-5 font-semibold">Duration</th>
                <th className="py-3 px-5 font-semibold">Sources</th>
                <th className="py-3 px-5 font-semibold">Status</th>
                <th className="py-3 px-5 font-semibold text-right">Timestamp</th>
                <th className="py-3 px-5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {history.map(item => (
                <tr key={item.id} className="hover:bg-[#EEF0F3]/50 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-[#17181C]">
                    {item.collectionTitle}
                  </td>
                  <td className="py-3.5 px-5 text-[#646974] font-mono tabular-nums">
                    {item.recordsExtracted}
                  </td>
                  <td className="py-3.5 px-5 text-[#646974] font-mono tabular-nums">
                    {item.duration}
                  </td>
                  <td className="py-3.5 px-5 text-[#646974]">
                    {item.sourceCount} channels
                  </td>
                  <td className="py-3.5 px-5">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3.5 px-5 text-right text-[#9297A1] font-mono tabular-nums">
                    {item.timestamp}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => {
                        if (item.collectionId) {
                          if (item.recordsExtracted > 0) {
                            navigate(`/results/${item.collectionId}`);
                          } else {
                            navigate(`/collections/${item.collectionId}`);
                          }
                        } else {
                          navigate('/collections');
                        }
                      }}
                      className="p-1.5 rounded-[8px] bg-[#EEF0F3] hover:text-[#6D5DFB] text-[#646974] inline-flex items-center cursor-pointer transition-all shadow-[inset_1px_1px_3px_rgba(163,170,181,0.20)]"
                      title="View Details"
                      aria-label={`View details for ${item.collectionTitle}`}
                    >
                      <ArrowUpRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {history.length === 0 && (
          <div className="py-12 text-center text-xs text-[#9297A1] space-y-2">
            <p className="font-semibold text-sm text-[#17181C]">No history yet</p>
            <p className="max-w-xs mx-auto">Your collection runs, executions, and export events will be automatically logged here.</p>
            <div className="pt-2">
              <Button size="sm" onClick={() => navigate('/collections/new')}>
                Create Collection
              </Button>
            </div>
          </div>
        )}
      </NeumorphicPanel>
    </div>
  );
};
