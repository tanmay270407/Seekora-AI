/**
 * Source Adapter Architecture for Seekora AI
 *
 * Provides a clean interface abstraction separating source querying, data normalization,
 * schema validation, and deduplication from UI presentation and future database persistence.
 */

import { GenericRecord } from '../../types';

export interface RawRecord {
  id?: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  data: Record<string, any>;
  timestamp?: string;
}

export interface CollectionExecutionResult {
  records: GenericRecord[];
  stats: {
    total: number;
    valid: number;
    duplicates: number;
    needsReview: number;
  };
  sourcesUsed: string[];
}

export interface SourceAdapter {
  id: string;
  name: string;
  type: 'API' | 'Public Dataset' | 'Web Directory' | 'Demo Source';
  baseUrl: string;
  status: 'Available' | 'Development' | 'Active';
  isDemo: boolean;

  search(query: string, count: number): Promise<RawRecord[]>;
  normalize(raw: RawRecord[], requestedFields: string[]): GenericRecord[];
  validate(records: GenericRecord[], requiredFields: string[]): GenericRecord[];
  deduplicate(records: GenericRecord[], keyFields: string[]): GenericRecord[];
  collect(
    collectionId: string,
    query: string,
    requestedFields: string[],
    count?: number
  ): Promise<CollectionExecutionResult>;
}
