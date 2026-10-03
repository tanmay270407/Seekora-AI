/**
 * Collection Data Access Layer for Seekora AI
 *
 * Interacts with Supabase collections and collection_workflows tables.
 * Includes fallback logic when Supabase is running in demo/offline mode.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CollectionItem, CollectionStatus } from '../types';

export const collectionService = {
  /**
   * Fetch collections owned by the authenticated user
   */
  async fetchUserCollections(userId?: string): Promise<CollectionItem[] | null> {
    if (!isSupabaseConfigured || !userId) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          id,
          name,
          request,
          requirements,
          status,
          record_count,
          source_count,
          created_at,
          updated_at
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetchUserCollections error:', error.message);
        return null;
      }

      if (!data) return [];

      return data.map((item) => ({
        id: item.id,
        title: item.name,
        prompt: item.request,
        requirements:
          typeof item.requirements === 'string'
            ? item.requirements
            : item.requirements?.summary || item.requirements?.text || undefined,
        fieldsList: item.requirements?.fields || undefined,
        recordCount: item.record_count,
        status: (item.status.charAt(0).toUpperCase() + item.status.slice(1)) as CollectionStatus,
        updatedAt: new Date(item.updated_at).toLocaleDateString(),
        createdAt: new Date(item.created_at).toLocaleDateString(),
        sources: ['Public Demo Registry (Development)'],
        isDemo: true,
      }));
    } catch (err: any) {
      console.warn('Collection fetch exception:', err?.message);
      return null;
    }
  },

  /**
   * Fetch a single collection by ID
   */
  async fetchCollectionById(id: string): Promise<CollectionItem | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        title: data.name,
        prompt: data.request,
        requirements:
          typeof data.requirements === 'string'
            ? data.requirements
            : data.requirements?.summary || undefined,
        fieldsList: data.requirements?.fields || undefined,
        recordCount: data.record_count,
        status: (data.status.charAt(0).toUpperCase() + data.status.slice(1)) as CollectionStatus,
        updatedAt: new Date(data.updated_at).toLocaleDateString(),
        createdAt: new Date(data.created_at).toLocaleDateString(),
        sources: ['Public Demo Registry (Development)'],
        isDemo: true,
      };
    } catch {
      return null;
    }
  },

  /**
   * Save a newly created collection to Supabase
   */
  async createCollection(
    userId: string,
    collection: {
      title: string;
      prompt: string;
      requirements?: string;
      fieldsList?: string[];
      status: CollectionStatus;
    }
  ): Promise<string | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const dbStatus = collection.status.toLowerCase();

      const { data, error } = await supabase
        .from('collections')
        .insert({
          user_id: userId,
          name: collection.title,
          request: collection.prompt?.trim() || 'Custom Data Extraction Request',
          requirements: {
            summary: collection.requirements || '',
            fields: collection.fieldsList || [],
          },
          status: dbStatus,
          record_count: 0,
          source_count: 1,
        })
        .select('id')
        .single();

      if (error) {
        console.warn('Failed to insert collection in Supabase:', error.message);
        return null;
      }

      const collectionId = data.id;

      // Also create corresponding workflow record
      await supabase.from('collection_workflows').insert({
        collection_id: collectionId,
        steps: [
          'Identify relevant sources',
          'Collect candidate records',
          'Extract requested fields',
          'Normalize records',
          'Validate records',
          'Remove duplicates',
          'Prepare dataset',
        ],
        current_step: 'Identify relevant sources',
        status: dbStatus,
      });

      // Log collection history
      await supabase.from('collection_history').insert({
        user_id: userId,
        collection_id: collectionId,
        action: 'created',
        metadata: { title: collection.title },
      });

      return collectionId;
    } catch (err: any) {
      console.warn('Create collection exception:', err?.message);
      return null;
    }
  },

  /**
   * Update existing collection
   */
  async updateCollection(
    id: string,
    updates: Partial<{
      title: string;
      requirements: string;
      status: CollectionStatus;
      recordCount: number;
    }>
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.title) payload.name = updates.title;
      if (updates.requirements) payload.requirements = { summary: updates.requirements };
      if (updates.status) payload.status = updates.status.toLowerCase();
      if (typeof updates.recordCount === 'number') payload.record_count = updates.recordCount;

      const { error } = await supabase.from('collections').update(payload).eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Delete existing collection and related child rows
   */
  async deleteCollection(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      await supabase.from('records').delete().eq('collection_id', id);
      await supabase.from('collection_workflows').delete().eq('collection_id', id);
      await supabase.from('collection_history').delete().eq('collection_id', id);
      const { error } = await supabase.from('collections').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },
};
