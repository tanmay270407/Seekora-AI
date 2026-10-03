/**
 * Supabase Database Schema Models for Seekora AI
 */

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type DbCollectionStatus =
  | 'draft'
  | 'ready'
  | 'running'
  | 'processing'
  | 'completed'
  | 'failed';

export interface DbCollection {
  id: string;
  user_id: string;
  name: string;
  request: string;
  requirements: Record<string, any>;
  status: DbCollectionStatus;
  record_count: number;
  source_count: number;
  created_at: string;
  updated_at: string;
}

export interface DbCollectionWorkflow {
  id: string;
  collection_id: string;
  steps: string[];
  current_step: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DbSource {
  id: string;
  name: string;
  type: string;
  url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type DbRecordStatus = 'valid' | 'invalid' | 'duplicate' | 'needs_review';

export interface DbRecord {
  id: string;
  collection_id: string;
  source_id: string | null;
  data: Record<string, any>;
  status: DbRecordStatus;
  validation_errors: string[] | null;
  collected_at: string;
  created_at: string;
  updated_at: string;
}

export interface DbExportHistory {
  id: string;
  user_id: string;
  collection_id: string;
  format: 'csv' | 'json';
  record_count: number;
  created_at: string;
}

export interface DbCollectionHistory {
  id: string;
  user_id: string;
  collection_id: string;
  action: string;
  metadata: Record<string, any>;
  created_at: string;
}
