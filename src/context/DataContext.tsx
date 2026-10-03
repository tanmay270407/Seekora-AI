import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CollectionItem, GenericRecord, DataSource, HistoryItem, CollectionStatus } from '../types';
import { defaultDemoSource } from '../services/dataSources/mockSource';
import { CollectionExecutionResult } from '../services/dataSources/sourceAdapter';
import { collectionService } from '../services/collectionService';
import { recordService } from '../services/recordService';
import { historyService } from '../services/historyService';
import { exportService } from '../services/exportService';
import { useAuth } from './AuthContext';

interface DataContextType {
  collections: CollectionItem[];
  recentCollections: CollectionItem[];
  stats: {
    tasks: number;
    records: string;
    sources: number;
  };
  sources: DataSource[];
  history: HistoryItem[];
  loadingCollections: boolean;
  getCollection: (id: string) => CollectionItem | undefined;
  getResultsByCollectionId: (id: string) => GenericRecord[];
  addCollection: (
    title?: string,
    prompt?: string,
    requirements?: string,
    status?: CollectionStatus,
    fieldsList?: string[]
  ) => Promise<CollectionItem>;
  updateCollectionStatus: (id: string, status: CollectionStatus) => Promise<void>;
  updateCollection: (id: string, updates: Partial<CollectionItem>) => Promise<void>;
  executeCollection: (id: string) => Promise<CollectionExecutionResult>;
  toggleSource: (id: string) => void;
  getSource: (id: string) => DataSource | undefined;
  logExport: (collectionId: string, format: 'csv' | 'json', count: number) => Promise<void>;
  deleteCollection: (id: string) => Promise<boolean>;
}

export function generateCollectionTitle(prompt: string): string {
  const clean = prompt.trim();
  if (!clean) return 'New Data Collection';

  let simplified = clean
    .replace(/^find\s+/i, '')
    .replace(/^get\s+/i, '')
    .replace(/^collect\s+/i, '')
    .replace(/^extract\s+/i, '')
    .replace(/^\d+\s+/, '')
    .replace(/\s+with\s+.*$/i, '');

  if (simplified.toLowerCase().includes('in delhi ncr')) {
    simplified = simplified.replace(/in\s+delhi\s+ncr/i, '').trim() + ' — Delhi NCR';
  } else if (simplified.toLowerCase().includes('in bangalore')) {
    simplified = simplified.replace(/in\s+bangalore/i, '').trim() + ' — Bangalore';
  } else if (simplified.toLowerCase().includes('in mumbai')) {
    simplified = simplified.replace(/in\s+mumbai/i, '').trim() + ' — Mumbai';
  }

  const words = simplified.split(/\s+/).map((w) => {
    if (w.startsWith('—')) return w;
    return w.charAt(0).toUpperCase() + w.slice(1);
  });

  const res = words.join(' ');
  return res.length > 40 ? res.slice(0, 38) + '...' : res;
}

const DEFAULT_DEMO_SOURCES: DataSource[] = [
  {
    id: 'src-demo-adapter',
    name: 'Public Demo Data Registry',
    category: 'Development Demo Dataset',
    type: 'Demo Source',
    status: 'Development',
    recordsIndexed: 240,
    rateLimit: '5,000 / hr',
    enabled: true,
    endpointUrl: 'https://api.seekora.demo/v1/registry',
    lastUsed: 'Just now',
    description: 'Clearly identified demo source adapter for development and pipeline testing before authorized live APIs are connected.',
    isDemo: true,
  },
  {
    id: 'src-1',
    name: 'Public Jobs API (Demo)',
    category: 'Job Aggregator API',
    type: 'API',
    status: 'Available',
    recordsIndexed: 540,
    rateLimit: '2,000 / hr',
    enabled: true,
    endpointUrl: 'https://api.seekora.demo/v1/jobs',
    lastUsed: 'Today',
    description: 'Public test API feed with strict rate limiting and schema normalization.',
    isDemo: true,
  },
  {
    id: 'src-2',
    name: 'Open SaaS Directory',
    category: 'B2B Software Index',
    type: 'Public Dataset',
    status: 'Available',
    recordsIndexed: 320,
    rateLimit: '1,500 / hr',
    enabled: true,
    endpointUrl: 'https://datasets.seekora.demo/saas-index',
    lastUsed: 'Yesterday',
    description: 'Permitted open dataset indexing active SaaS startups and company profiles.',
    isDemo: true,
  },
  {
    id: 'src-3',
    name: 'Public Developer Registry',
    category: 'Developer Profiles',
    type: 'Public Dataset',
    status: 'Available',
    recordsIndexed: 214,
    rateLimit: '5,000 / hr',
    enabled: true,
    endpointUrl: 'https://datasets.seekora.demo/dev-profiles',
    lastUsed: '2 days ago',
    description: 'Open public developer directory with open-source project attributions.',
    isDemo: true,
  },
];

const INITIAL_FALLBACK_COLLECTIONS: CollectionItem[] = [
  {
    id: 'col-1',
    title: 'Java Developer Jobs — Delhi NCR',
    prompt: 'Find 100 Java developer jobs in Delhi NCR with company, location, salary and application link.',
    requirements: 'At least 100 jobs · Delhi NCR · Include salary',
    recordCount: 24,
    status: 'Completed',
    updatedAt: '12m ago',
    createdAt: 'Today, 14:20',
    sources: ['Public Demo Registry (Development)'],
    fieldsList: ['Company', 'Role', 'Location', 'Salary', 'Application Link'],
    isDemo: true,
  },
  {
    id: 'col-2',
    title: 'Fintech Startup Companies',
    prompt: 'Extract series-A fintech startup founders and company profiles.',
    requirements: 'Fintech · Series A · Founder profiles',
    recordCount: 16,
    status: 'Completed',
    updatedAt: '2h ago',
    createdAt: 'Today, 11:45',
    sources: ['Public Demo Registry (Development)'],
    fieldsList: ['Company', 'Website', 'Industry', 'Employees', 'Location', 'Funding'],
    isDemo: true,
  },
];

const INITIAL_FALLBACK_RECORDS: GenericRecord[] = [
  {
    id: 'rec-1',
    collectionId: 'col-1',
    fields: {
      Company: 'Razorpay Technologies',
      Role: 'Senior Java Engineer',
      Location: 'Gurugram, HR',
      Salary: '₹28 - 38 LPA',
      'Application Link': 'https://careers.demo-portal.org/positions/razorpay-1',
    },
    sourceId: 'src-demo-adapter',
    sourceName: 'Public Demo Registry (Development)',
    sourceUrl: 'https://registry.demo.seekora.ai/record/1',
    sourceType: 'Demo Source',
    collectedAt: '12m ago',
    status: 'valid',
    isDemo: true,
  },
  {
    id: 'rec-2',
    collectionId: 'col-1',
    fields: {
      Company: 'Postman Labs',
      Role: 'Java Backend Architect',
      Location: 'Noida, UP',
      Salary: '₹35 - 50 LPA',
      'Application Link': 'https://careers.demo-portal.org/positions/postman-2',
    },
    sourceId: 'src-demo-adapter',
    sourceName: 'Public Demo Registry (Development)',
    sourceUrl: 'https://registry.demo.seekora.ai/record/2',
    sourceType: 'Demo Source',
    collectedAt: '15m ago',
    status: 'valid',
    isDemo: true,
  },
  {
    id: 'rec-3',
    collectionId: 'col-1',
    fields: {
      Company: 'Infosys BPM',
      Role: 'Spring Boot Specialist',
      Location: 'New Delhi, DL',
      Salary: null,
      'Application Link': 'https://careers.demo-portal.org/positions/infosys-3',
    },
    sourceId: 'src-demo-adapter',
    sourceName: 'Public Demo Registry (Development)',
    sourceUrl: 'https://registry.demo.seekora.ai/record/3',
    sourceType: 'Demo Source',
    collectedAt: '22m ago',
    status: 'invalid',
    validationNotes: ['Missing required field: "Salary"'],
    isDemo: true,
  },
];

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [results, setResults] = useState<GenericRecord[]>([]);
  const [sources, setSources] = useState<DataSource[]>(DEFAULT_DEMO_SOURCES);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);

  // Sync collections and history with Supabase when authenticated user changes
  useEffect(() => {
    let isMounted = true;

    async function loadUserData() {
      if (!user) {
        setCollections([]);
        setResults([]);
        setHistory([]);
        return;
      }

      setLoadingCollections(true);

      // Fetch user collections
      const remoteCols = await collectionService.fetchUserCollections(user.id);
      if (isMounted && remoteCols) {
        setCollections(remoteCols);
      }

      // Fetch user history
      const remoteHist = await historyService.fetchUserHistory(user.id);
      if (isMounted && remoteHist) {
        setHistory(remoteHist);
      }

      if (isMounted) {
        setLoadingCollections(false);
      }
    }

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Statistics per Section 26
  const totalUserRecords = collections.reduce((acc, c) => acc + (c.recordCount || 0), 0);
  const stats = {
    tasks: collections.length,
    records: totalUserRecords.toLocaleString(),
    sources: sources.filter((s) => s.enabled).length,
  };

  const recentCollections = collections.slice(0, 3);

  const getCollection = useCallback(
    (id: string) => collections.find((c) => c.id === id),
    [collections]
  );

  const getSource = useCallback(
    (id: string) => sources.find((s) => s.id === id),
    [sources]
  );

  const getResultsByCollectionId = useCallback(
    (id: string) => results.filter((r) => r.collectionId === id),
    [results]
  );

  const addCollection = useCallback(
    async (
      title?: string,
      prompt?: string,
      requirements?: string,
      status: CollectionStatus = 'Ready',
      fieldsList?: string[]
    ): Promise<CollectionItem> => {
      const p = prompt || 'Java Developer Jobs in Delhi NCR';
      const finalTitle = title?.trim() || generateCollectionTitle(p);
      const fields = fieldsList || ['Company', 'Role', 'Location', 'Salary', 'Application Link'];

      let newId = `col-${Date.now()}`;

      // Persist to Supabase if authenticated
      if (user) {
        const remoteId = await collectionService.createCollection(user.id, {
          title: finalTitle,
          prompt: p,
          requirements: requirements?.trim(),
          fieldsList: fields,
          status,
        });
        if (remoteId) {
          newId = remoteId;
        }
      }

      const newItem: CollectionItem = {
        id: newId,
        title: finalTitle,
        prompt: p,
        requirements: requirements?.trim() || 'Location: Delhi NCR · Verified sources',
        recordCount: 0,
        status,
        updatedAt: 'Just now',
        createdAt: 'Just now',
        sources: ['Public Demo Registry (Development)'],
        fieldsList: fields,
        isDemo: true,
      };

      setCollections((prev) => [newItem, ...prev.filter((c) => c.id !== newId)]);

      // Add to local audit history
      setHistory((prev) => [
        {
          id: `hist-${Date.now()}`,
          collectionTitle: finalTitle,
          collectionId: newId,
          recordsExtracted: 0,
          duration: '—',
          status,
          timestamp: 'Just now',
          sourceCount: 1,
        },
        ...prev,
      ]);

      return newItem;
    },
    [user]
  );

  const updateCollectionStatus = useCallback(
    async (id: string, status: CollectionStatus) => {
      setCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status, updatedAt: 'Just now' } : c))
      );
      await collectionService.updateCollection(id, { status });
    },
    []
  );

  const updateCollection = useCallback(
    async (id: string, updates: Partial<CollectionItem>) => {
      setCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: 'Just now' } : c))
      );
      await collectionService.updateCollection(id, {
        title: updates.title,
        requirements: updates.requirements,
        status: updates.status,
        recordCount: updates.recordCount,
      });
    },
    []
  );

  const executeCollection = useCallback(
    async (id: string): Promise<CollectionExecutionResult> => {
      const col = collections.find((c) => c.id === id);
      const promptToUse = col ? col.prompt : 'Java Developer Jobs in Delhi NCR';
      const fieldsToUse = col?.fieldsList || ['Company', 'Role', 'Location', 'Salary', 'Application Link'];

      // Execute through DemoSourceAdapter
      const res = await defaultDemoSource.collect(id, promptToUse, fieldsToUse, 24);

      // Save records to state
      setResults((prev) => [...res.records, ...prev.filter((r) => r.collectionId !== id)]);

      // Update collection status and record count
      setCollections((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: 'Completed',
                recordCount: res.records.length,
                updatedAt: 'Just now',
                sources: res.sourcesUsed,
              }
            : c
        )
      );

      // Persist to Supabase if authenticated
      if (user) {
        await recordService.saveRecords(id, res.records, user.id);
        await collectionService.updateCollection(id, {
          status: 'Completed',
          recordCount: res.records.length,
        });
      }

      // Add to history
      setHistory((prev) => [
        {
          id: `hist-${Date.now()}`,
          collectionTitle: col ? col.title : 'New Collection',
          collectionId: id,
          recordsExtracted: res.records.length,
          duration: '2.1s',
          status: 'Completed',
          timestamp: 'Just now',
          sourceCount: res.sourcesUsed.length,
        },
        ...prev,
      ]);

      return res;
    },
    [collections, user]
  );

  const logExport = useCallback(
    async (collectionId: string, format: 'csv' | 'json', count: number) => {
      if (user) {
        await exportService.recordExport(user.id, collectionId, format, count);
      }
    },
    [user]
  );

  const toggleSource = useCallback((id: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }, []);

  const deleteCollection = useCallback(
    async (id: string): Promise<boolean> => {
      setCollections((prev) => prev.filter((c) => c.id !== id));
      setResults((prev) => prev.filter((r) => r.collectionId !== id));
      setHistory((prev) => prev.filter((h) => h.collectionId !== id));
      return collectionService.deleteCollection(id);
    },
    []
  );

  return (
    <DataContext.Provider
      value={{
        collections,
        recentCollections,
        stats,
        sources,
        history,
        loadingCollections,
        getCollection,
        getResultsByCollectionId,
        addCollection,
        updateCollectionStatus,
        updateCollection,
        executeCollection,
        toggleSource,
        getSource,
        logExport,
        deleteCollection,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
