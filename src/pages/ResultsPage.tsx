import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useData } from '../context/DataContext';
import { GenericRecord, RecordValidationStatus } from '../types';
import { recordService } from '../services/recordService';
import { NeumorphicPanel } from '../components/ui/NeumorphicPanel';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import {
  Search,
  Download,
  ArrowLeft,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Info,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ResultsPageProps {
  id: string;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ id }) => {
  const { navigate } = useRouter();
  const { getCollection, getResultsByCollectionId, logExport } = useData();
  const col = getCollection(id);
  const rawRecords = getResultsByCollectionId(id);
  const [remoteRecords, setRemoteRecords] = useState<GenericRecord[] | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (rawRecords.length === 0 && id) {
      recordService.fetchRecordsByCollection(id).then((records) => {
        if (isMounted && records && records.length > 0) {
          setRemoteRecords(records);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [id, rawRecords.length]);

  const allRecords = remoteRecords && remoteRecords.length > 0 ? remoteRecords : rawRecords;

  // Search, filter, sort, pagination state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | RecordValidationStatus>('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Selected record for details & traceability side panel / modal
  const [selectedRecord, setSelectedRecord] = useState<GenericRecord | null>(null);

  // Dynamic Column Detection (Section 9)
  const dynamicColumns = useMemo(() => {
    if (col?.fieldsList && col.fieldsList.length > 0) {
      return col.fieldsList;
    }
    const columnSet = new Set<string>();
    allRecords.forEach((r) => {
      Object.keys(r.fields).forEach((k) => columnSet.add(k));
    });
    const detected = Array.from(columnSet);
    return detected.length > 0
      ? detected.slice(0, 5)
      : ['Company', 'Role', 'Location', 'Salary', 'Application Link'];
  }, [col, allRecords]);

  // Data Quality Summary counts (Section 22 & 23)
  const qualityStats = useMemo(() => {
    const total = allRecords.length;
    const valid = allRecords.filter((r) => r.status === 'valid').length;
    const duplicates = allRecords.filter((r) => r.status === 'duplicate').length;
    const needsReview = allRecords.filter((r) => r.status === 'invalid').length;
    return { total, valid, duplicates, needsReview };
  }, [allRecords]);

  // Filtered and Sorted Records
  const filteredRecords = useMemo(() => {
    return allRecords.filter((rec) => {
      // 1. Status filter
      if (statusFilter !== 'All' && rec.status !== statusFilter) {
        return false;
      }
      // 2. Source filter
      if (sourceFilter !== 'All' && rec.sourceName !== sourceFilter) {
        return false;
      }
      // 3. Search query across all dynamic fields & source name
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesField = Object.values(rec.fields).some((val) =>
          String(val || '').toLowerCase().includes(query)
        );
        const matchesSource = rec.sourceName.toLowerCase().includes(query);
        return matchesField || matchesSource;
      }
      return true;
    });
  }, [allRecords, statusFilter, sourceFilter, search]);

  const sortedRecords = useMemo(() => {
    if (!sortField) return filteredRecords;

    return [...filteredRecords].sort((a, b) => {
      const valA = a.fields[sortField] ?? '';
      const valB = b.fields[sortField] ?? '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredRecords, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, page, pageSize]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const availableSources = useMemo(() => {
    return Array.from(new Set(rawRecords.map((r) => r.sourceName)));
  }, [rawRecords]);

  // Export handlers (Section 27)
  const handleExport = (format: 'csv' | 'json') => {
    if (filteredRecords.length === 0) return;

    const fileName = `${(col?.title || 'collection').toLowerCase().replace(/\s+/g, '_')}_dataset.${format}`;

    if (format === 'json') {
      const exportData = filteredRecords.map((r) => ({
        id: r.id,
        ...r.fields,
        _provenance: {
          source: r.sourceName,
          sourceUrl: r.sourceUrl,
          collectedAt: r.collectedAt,
          status: r.status,
        },
      }));
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = [
        ...dynamicColumns.map((colName) => `"${colName.replace(/"/g, '""')}"`),
        '"Source"',
        '"Status"',
        '"Collected At"',
      ];
      const rows = filteredRecords.map((r) => [
        ...dynamicColumns.map((colName) => `"${String(r.fields[colName] ?? '').replace(/"/g, '""')}"`),
        `"${r.sourceName.replace(/"/g, '""')}"`,
        `"${r.status}"`,
        `"${r.collectedAt}"`,
      ]);
      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }

    logExport(id, format, filteredRecords.length);
    setExportNotice(`${filteredRecords.length} records exported as ${format.toUpperCase()}.`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {exportNotice && (
        <div className="p-3.5 rounded-[12px] bg-[#22A879]/10 border border-[#22A879]/25 text-xs text-[#22A879] flex items-center justify-between animate-fadeIn shadow-[inset_2px_2px_4px_rgba(34,168,121,0.10)]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span className="font-semibold">{exportNotice}</span>
          </div>
          <span className="text-[11px] font-mono opacity-80">Saved to export history</span>
        </div>
      )}
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(col ? `/collections/${col.id}` : '/collections')}
            className="w-8 h-8 rounded-[10px] bg-[#F8F9FB] flex items-center justify-center text-[#646974] hover:text-[#17181C] shadow-[3px_3px_8px_rgba(163,170,181,0.25),-3px_-3px_8px_rgba(255,255,255,0.90)] border border-[rgba(20,24,32,0.04)] cursor-pointer"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-bold text-[#17181C]">
                {col?.title || 'Collection Results'}
              </h1>
              {col?.status && <StatusBadge status={col.status} isDemo={col.isDemo} />}
              {allRecords.some((r) => r.isDemo) && (
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded-[6px] bg-[#C98A25]/15 text-[#C98A25] border border-[#C98A25]/30">
                  DEMO DATA
                </span>
              )}
            </div>
            <p className="text-xs text-[#646974] font-mono tabular-nums">
              {rawRecords.length} records collected · {col?.sources?.length || 1} sources
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<Download size={14} />}
            onClick={() => handleExport('csv')}
            disabled={filteredRecords.length === 0}
          >
            Export CSV
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleExport('json')}
            disabled={filteredRecords.length === 0}
          >
            JSON
          </Button>
        </div>
      </div>

      {/* Compact Data Quality Summary Bar (Section 23) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-[12px] bg-[#EEF0F3] shadow-[inset_3px_3px_7px_rgba(163,170,181,0.18)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#646974] uppercase tracking-wider block">
              Records
            </span>
            <span className="text-base font-bold font-mono text-[#17181C]">
              {qualityStats.total}
            </span>
          </div>
          <Layers size={18} className="text-[#6D5DFB]/70" />
        </div>

        <div className="p-3 rounded-[12px] bg-[#EEF0F3] shadow-[inset_3px_3px_7px_rgba(163,170,181,0.18)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#646974] uppercase tracking-wider block">
              Valid
            </span>
            <span className="text-base font-bold font-mono text-[#22A879]">
              {qualityStats.valid}
            </span>
          </div>
          <ShieldCheck size={18} className="text-[#22A879]" />
        </div>

        <div className="p-3 rounded-[12px] bg-[#EEF0F3] shadow-[inset_3px_3px_7px_rgba(163,170,181,0.18)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#646974] uppercase tracking-wider block">
              Duplicates
            </span>
            <span className="text-base font-bold font-mono text-[#646974]">
              {qualityStats.duplicates}
            </span>
          </div>
          <Copy size={18} className="text-[#9297A1]" />
        </div>

        <div className="p-3 rounded-[12px] bg-[#EEF0F3] shadow-[inset_3px_3px_7px_rgba(163,170,181,0.18)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#646974] uppercase tracking-wider block">
              Needs Review
            </span>
            <span className="text-base font-bold font-mono text-[#C98A25]">
              {qualityStats.needsReview}
            </span>
          </div>
          <AlertTriangle size={18} className="text-[#C98A25]" />
        </div>
      </div>

      {/* Main Results Table Container */}
      <NeumorphicPanel className="p-0 overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 md:p-5 border-b border-[#E4E7EC] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F8F9FB]">
          <div className="w-full md:w-80">
            <Input
              icon={<Search size={14} />}
              placeholder="Search across fields..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Validation Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#EEF0F3] p-1 rounded-[10px] shadow-[inset_2px_2px_4px_rgba(163,170,181,0.20)]">
              {(['All', 'valid', 'duplicate', 'invalid'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-[8px] text-xs font-semibold cursor-pointer transition-all ${
                    statusFilter === st
                      ? 'bg-[#F8F9FB] text-[#6D5DFB] shadow-[2px_2px_5px_rgba(163,170,181,0.20),-2px_-2px_5px_rgba(255,255,255,0.90)] font-bold'
                      : 'text-[#646974] hover:text-[#17181C]'
                  }`}
                >
                  {st === 'All'
                    ? 'All'
                    : st === 'valid'
                    ? 'Valid'
                    : st === 'duplicate'
                    ? 'Duplicates'
                    : 'Needs Review'}
                </button>
              ))}
            </div>

            {/* Source Filter Dropdown */}
            {availableSources.length > 1 && (
              <select
                value={sourceFilter}
                onChange={(e) => {
                  setSourceFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-[#EEF0F3] text-xs font-medium text-[#17181C] rounded-[10px] px-3 py-1.5 shadow-[inset_2px_2px_4px_rgba(163,170,181,0.20)] border border-[rgba(20,24,32,0.04)] focus:outline-none focus:ring-1 focus:ring-[#6D5DFB]/40"
              >
                <option value="All">All Sources</option>
                {availableSources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Dynamic Responsive Table View (Sections 9, 11, 12, 19) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E4E7EC] text-[#646974] uppercase font-mono tracking-wider bg-[#F4F5F7]">
                {dynamicColumns.map((colName) => (
                  <th
                    key={colName}
                    onClick={() => handleSort(colName)}
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-[#17181C] select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{colName}</span>
                      <ArrowUpDown size={11} className="text-[#9297A1]" />
                    </div>
                  </th>
                ))}
                <th className="py-3 px-4 font-semibold">Source</th>
                <th className="py-3 px-4 font-semibold">Validation</th>
                <th className="py-3 px-4 font-semibold text-right">Collected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {paginatedRecords.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedRecord(item)}
                  className="hover:bg-[#EEF0F3]/60 transition-colors cursor-pointer group"
                >
                  {dynamicColumns.map((colName, cIdx) => {
                    const val = item.fields[colName];
                    const isFirst = cIdx === 0;

                    return (
                      <td
                        key={colName}
                        className={`py-3 px-4 ${
                          isFirst ? 'font-semibold text-[#17181C] group-hover:text-[#6D5DFB]' : 'text-[#646974]'
                        } max-w-[220px] truncate`}
                      >
                        {val !== null && val !== undefined ? (
                          typeof val === 'string' && val.startsWith('http') ? (
                            <span className="text-[#6D5DFB] underline font-mono text-[11px] truncate block">
                              {val.replace(/^https?:\/\//, '')}
                            </span>
                          ) : (
                            String(val)
                          )
                        ) : (
                          <span className="text-[#9297A1] italic">—</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Source Column (Section 12) */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[#EEF0F3] text-[#6D5DFB] font-semibold text-[11px] shadow-[inset_1px_1px_3px_rgba(163,170,181,0.20)]">
                      {item.sourceName.replace(/ \(Development\)/, '')}
                    </span>
                  </td>

                  {/* Validation Status */}
                  <td className="py-3 px-4">
                    <StatusBadge status={item.status} />
                  </td>

                  {/* Collected At */}
                  <td className="py-3 px-4 text-right text-[#9297A1] font-mono tabular-nums whitespace-nowrap">
                    {item.collectedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State in Table */}
        {paginatedRecords.length === 0 && (
          <div className="py-12 text-center text-xs text-[#9297A1] space-y-2">
            <p className="font-semibold text-[#17181C]">No records found</p>
            <p className="max-w-xs mx-auto">
              {search || statusFilter !== 'All'
                ? 'Try adjusting your search criteria or validation filters.'
                : 'No results have been collected yet for this query.'}
            </p>
          </div>
        )}

        {/* Compact Pagination Bar (Section 20) */}
        {sortedRecords.length > 0 && (
          <div className="p-3.5 border-t border-[#E4E7EC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-[#F8F9FB]">
            <div className="flex items-center gap-2 text-[#646974]">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-[#EEF0F3] rounded-[6px] px-2 py-1 font-mono text-xs text-[#17181C] shadow-[inset_1px_1px_3px_rgba(163,170,181,0.20)] focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="font-mono tabular-nums">
                {Math.min((page - 1) * pageSize + 1, sortedRecords.length)}–
                {Math.min(page * pageSize, sortedRecords.length)} of {sortedRecords.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-[8px] bg-[#EEF0F3] text-[#17181C] disabled:opacity-40 disabled:cursor-not-allowed shadow-[inset_1px_1px_3px_rgba(163,170,181,0.20)] cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="font-mono text-xs px-2 text-[#646974]">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5 rounded-[8px] bg-[#EEF0F3] text-[#17181C] disabled:opacity-40 disabled:cursor-not-allowed shadow-[inset_1px_1px_3px_rgba(163,170,181,0.20)] cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </NeumorphicPanel>

      {/* Record Details & Source Traceability Modal (Section 13 & 14) */}
      <Modal
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title="Record Details & Traceability"
      >
        {selectedRecord && (
          <div className="space-y-5 text-xs">
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
              <div>
                <span className="text-[10px] uppercase font-mono font-semibold text-[#9297A1]">
                  Record ID
                </span>
                <p className="font-mono font-bold text-[#17181C]">{selectedRecord.id}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedRecord.isDemo && (
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded-[6px] bg-[#C98A25]/15 text-[#C98A25] border border-[#C98A25]/30">
                    DEMO DATA
                  </span>
                )}
                <StatusBadge status={selectedRecord.status} />
              </div>
            </div>

            {/* Validation notes if any */}
            {selectedRecord.validationNotes && selectedRecord.validationNotes.length > 0 && (
              <div className="p-3 rounded-[10px] bg-[#C98A25]/10 border border-[#C98A25]/25 text-[#C98A25] space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle size={13} /> Validation Findings:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {selectedRecord.validationNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Extracted Record Fields */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#646974] block">
                Extracted Record Fields
              </span>
              <div className="space-y-1.5 bg-[#EEF0F3] p-3 rounded-[12px] shadow-[inset_2px_2px_5px_rgba(163,170,181,0.18)]">
                {Object.entries(selectedRecord.fields).map(([k, v]) => (
                  <div key={k} className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-[#E4E7EC]/60 last:border-none gap-1">
                    <span className="font-semibold text-[#646974]">{k}:</span>
                    <span className="font-medium text-[#17181C] break-all">
                      {v !== null && v !== undefined ? String(v) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Traceability (Section 14) */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#646974] block">
                Source Traceability
              </span>
              <div className="space-y-2 p-3 rounded-[12px] bg-[#EEF0F3] shadow-[inset_2px_2px_5px_rgba(163,170,181,0.18)]">
                <div className="flex justify-between">
                  <span className="text-[#646974]">Source Provider:</span>
                  <span className="font-bold text-[#17181C]">{selectedRecord.sourceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#646974]">Source Type:</span>
                  <span className="font-mono text-[#17181C]">{selectedRecord.sourceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#646974]">Collection Time:</span>
                  <span className="font-mono text-[#17181C]">{selectedRecord.collectedAt}</span>
                </div>
                <div className="flex flex-col gap-0.5 pt-1 border-t border-[#E4E7EC]">
                  <span className="text-[#646974]">Source Reference URL:</span>
                  <span className="font-mono text-[11px] text-[#6D5DFB] break-all">
                    {selectedRecord.sourceUrl}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
