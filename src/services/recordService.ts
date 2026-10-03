/**
 * Records Data Access Layer for Seekora AI
 *
 * Connects collection dataset items to Supabase records table with source relations.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { GenericRecord } from '../types';

export const recordService = {
  /**
   * Fetch records belonging to a collection
   */
  async fetchRecordsByCollection(collectionId: string): Promise<GenericRecord[] | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('records')
        .select(`
          id,
          collection_id,
          data,
          status,
          validation_errors,
          collected_at,
          source_id,
          sources (
            id,
            name,
            type,
            url
          )
        `)
        .eq('collection_id', collectionId)
        .order('created_at', { ascending: false });

      if (error || !data) return null;

      return data.map((item: any) => ({
        id: item.id,
        collectionId: item.collection_id,
        fields: item.data || {},
        sourceId: item.source_id || 'src-demo-adapter',
        sourceName: item.sources?.name || 'Public Demo Registry (Development)',
        sourceUrl: item.sources?.url || 'https://api.seekora.demo/v1',
        sourceType: item.sources?.type || 'Demo Source',
        collectedAt: new Date(item.collected_at).toLocaleDateString(),
        status: item.status,
        validationNotes: item.validation_errors || undefined,
        isDemo: true,
      }));
    } catch {
      return null;
    }
  },

  /**
   * Persist collected records to Supabase
   */
  async saveRecords(
    collectionId: string,
    records: GenericRecord[],
    userId?: string
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      const recordsToInsert = records.map((rec) => ({
        collection_id: collectionId,
        data: rec.fields,
        status: rec.status,
        validation_errors: rec.validationNotes || null,
        collected_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('records').insert(recordsToInsert);

      // Log collection completed history event
      if (userId && !error) {
        await supabase.from('collection_history').insert({
          user_id: userId,
          collection_id: collectionId,
          action: 'completed',
          metadata: { record_count: records.length },
        });
      }

      return !error;
    } catch (err: any) {
      console.warn('saveRecords exception:', err?.message);
      return false;
    }
  },
};
