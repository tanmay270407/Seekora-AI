/**
 * Export History Data Access Layer for Seekora AI
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface ExportHistoryRecord {
  id: string;
  collectionId: string;
  collectionName?: string;
  format: 'csv' | 'json';
  recordCount: number;
  createdAt: string;
}

export const exportService = {
  async recordExport(
    userId: string,
    collectionId: string,
    format: 'csv' | 'json',
    recordCount: number
  ): Promise<void> {
    if (!isSupabaseConfigured) return;

    try {
      await supabase.from('export_history').insert({
        user_id: userId,
        collection_id: collectionId,
        format,
        record_count: recordCount,
      });

      // Also log in general collection history
      await supabase.from('collection_history').insert({
        user_id: userId,
        collection_id: collectionId,
        action: 'exported',
        metadata: { format, record_count: recordCount },
      });
    } catch (err) {
      console.warn('recordExport error:', err);
    }
  },

  async fetchExportHistory(userId?: string): Promise<ExportHistoryRecord[] | null> {
    if (!isSupabaseConfigured || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('export_history')
        .select(`
          id,
          collection_id,
          format,
          record_count,
          created_at,
          collections ( name )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error || !data) return null;

      return data.map((item: any) => ({
        id: item.id,
        collectionId: item.collection_id,
        collectionName: item.collections?.name || 'Dataset Export',
        format: item.format,
        recordCount: item.record_count,
        createdAt: new Date(item.created_at).toLocaleString(),
      }));
    } catch {
      return null;
    }
  },
};
