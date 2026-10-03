/**
 * AI Data Intelligence Specification Types for Seekora AI
 */

export interface CollectionField {
  name: string;
  description: string;
  required: boolean;
}

export interface CollectionFilter {
  field: string;
  operator: string;
  value: string;
}

export interface CollectionAnalysis {
  intent: string;
  query: string;
  entity: string;
  location: string | null;
  target_count: number | null;
  fields: CollectionField[];
  filters: CollectionFilter[];
  source_types: string[];
  constraints: string[];
  confidence: number;
  needs_clarification: boolean;
  clarification_question: string | null;
  clarification_field: string | null;
  suggested_workflow: string[];
}
