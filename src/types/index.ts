export const APP_NAME = 'Seekora AI';
export const BRAND_NAME = 'Seekora AI';

export type CollectionStatus =
  | 'Draft'
  | 'Ready'
  | 'Running'
  | 'Processing'
  | 'Completed'
  | 'Failed';

export interface CollectionItem {
  id: string;
  title: string;
  prompt: string;
  requirements?: string;
  recordCount: number;
  status: CollectionStatus;
  updatedAt: string;
  createdAt: string;
  sources: string[];
  fieldsList?: string[];
  isDemo?: boolean;
}

export type RecordValidationStatus = 'valid' | 'invalid' | 'duplicate';

export interface GenericRecord {
  id: string;
  collectionId: string;
  fields: Record<string, string | number | boolean | null>;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: string;
  collectedAt: string;
  status: RecordValidationStatus;
  validationNotes?: string[];
  duplicateOf?: string;
  isDemo?: boolean;
}

// Backwards-compatible alias for existing components
export type ResultRecord = GenericRecord;

export interface DataSource {
  id: string;
  name: string;
  category: string;
  type: 'API' | 'Public Dataset' | 'Web Directory' | 'Demo Source';
  status: 'Active' | 'Available' | 'Development' | 'Paused' | 'Maintenance';
  recordsIndexed: number;
  rateLimit: string;
  enabled: boolean;
  endpointUrl?: string;
  lastUsed?: string;
  description?: string;
  isDemo?: boolean;
}

export interface HistoryItem {
  id: string;
  collectionTitle: string;
  collectionId: string;
  recordsExtracted: number;
  duration: string;
  status: CollectionStatus;
  timestamp: string;
  sourceCount: number;
}
