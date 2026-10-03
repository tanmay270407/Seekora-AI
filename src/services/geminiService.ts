/**
 * Client-Side Gemini Service Layer for Seekora AI
 *
 * Keeps Gemini interaction completely decoupled from React UI components.
 * Calls the secure backend proxy endpoint (/api/analyze-request) and strictly validates
 * the structured JSON response before UI consumption.
 */

import { CollectionAnalysis } from '../types/ai';

export const geminiService = {
  /**
   * Validate that the returned object conforms to CollectionAnalysis
   */
  validateAnalysis(data: any): data is CollectionAnalysis {
    if (!data || typeof data !== 'object') return false;

    const hasIntent = typeof data.intent === 'string' && data.intent.length > 0;
    const hasEntity = typeof data.entity === 'string' && data.entity.length > 0;
    const hasFields = Array.isArray(data.fields);
    const hasWorkflow = Array.isArray(data.suggested_workflow);
    const hasConfidence = typeof data.confidence === 'number';

    return hasIntent && hasEntity && hasFields && hasWorkflow && hasConfidence;
  },

  /**
   * Send natural-language request to Gemini Intelligence Layer
   */
  async analyzeRequest(
    prompt: string,
    clarificationValue?: string,
    clarificationField?: string
  ): Promise<CollectionAnalysis> {
    const trimmed = prompt.trim();
    if (!trimmed) {
      throw new Error('Please enter a request to analyze.');
    }

    try {
      const response = await fetch('/api/analyze-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: trimmed,
          clarificationValue,
          clarificationField,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Unable to analyze the request right now. Please try again.');
      }

      const data = await response.json();

      if (!this.validateAnalysis(data)) {
        throw new Error('Intelligence service returned an unrecognized structure. Please retry.');
      }

      return data;
    } catch (err: any) {
      console.warn('Gemini proxy request issue:', err?.message);
      throw err;
    }
  },
};
