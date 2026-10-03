/**
 * History & Audit Log Data Access Layer for Seekora AI
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { HistoryItem } from '../types';

export const historyService = {
  async fetchUserHistory(userId?: string): Promise<HistoryItem[] | null> {
    if (!isSupabaseConfigured || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('collection_history')
        .select(`
          id,
          action,
          metadata,
          created_at,
          collection_id,
          collections (
            id,
            name,
            status,
            record_count
          )
        `)
        .order('created_at', { ascending: false })
        .limit(25);

      if (error || !data) return null;

      return data.map((item: any) => ({
        id: item.id,
        collectionTitle: item.collections?.name || item.metadata?.title || 'Collection Run',
        collectionId: item.collection_id,
        recordsExtracted: item.metadata?.record_count || item.collections?.record_count || 0,
        duration: '1.8s',
        status: (item.collections?.status
          ? item.collections.status.charAt(0).toUpperCase() + item.collections.status.slice(1)
          : 'Completed') as any,
        timestamp: new Date(item.created_at).toLocaleString(),
        sourceCount: 1,
      }));
    } catch {
      return null;
    }
  },

  async logHistory(
    userId: string,
    collectionId: string,
    action: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('collection_history').insert({
        user_id: userId,
        collection_id: collectionId,
        action,
        metadata,
      });
    } catch (err) {
      console.warn('logHistory error:', err);
    }
  },
};
