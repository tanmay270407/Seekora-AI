-- ==============================================================================
-- DataPilot AI — Supabase Database Migration & Schema
-- ==============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. COLLECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  request TEXT NOT NULL,
  requirements JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('draft', 'ready', 'running', 'processing', 'completed', 'failed')),
  record_count INTEGER NOT NULL DEFAULT 0,
  source_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SOURCES TABLE
CREATE TABLE IF NOT EXISTS public.sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. COLLECTION SOURCES RELATIONSHIP TABLE
CREATE TABLE IF NOT EXISTS public.collection_sources (
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection_id, source_id)
);

-- 5. COLLECTION WORKFLOWS TABLE
CREATE TABLE IF NOT EXISTS public.collection_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_step TEXT NULL,
  status TEXT NOT NULL DEFAULT 'ready',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. RECORDS (DATASET ENTRIES) TABLE
CREATE TABLE IF NOT EXISTS public.records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  source_id UUID NULL REFERENCES public.sources(id) ON DELETE SET NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'invalid', 'duplicate', 'needs_review')),
  validation_errors JSONB NULL,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. EXPORT HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('csv', 'json')),
  record_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. COLLECTION HISTORY TABLE (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS public.collection_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_status ON public.collections(status);
CREATE INDEX IF NOT EXISTS idx_collections_updated_at ON public.collections(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_records_collection_id ON public.records(collection_id);
CREATE INDEX IF NOT EXISTS idx_records_source_id ON public.records(source_id);
CREATE INDEX IF NOT EXISTS idx_records_status ON public.records(status);

CREATE INDEX IF NOT EXISTS idx_export_history_user_id ON public.export_history(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_history_user_id ON public.collection_history(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

-- Profiles: users read and write their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Collections: users manage their own collections
CREATE POLICY "Users can view their own collections"
  ON public.collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections"
  ON public.collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON public.collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON public.collections FOR DELETE
  USING (auth.uid() = user_id);

-- Collection Workflows: access restricted to collection owner
CREATE POLICY "Users can view workflows for their own collections"
  ON public.collection_workflows FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_workflows.collection_id AND c.user_id = auth.uid()));

CREATE POLICY "Users can insert workflows for their own collections"
  ON public.collection_workflows FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_workflows.collection_id AND c.user_id = auth.uid()));

CREATE POLICY "Users can update workflows for their own collections"
  ON public.collection_workflows FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_workflows.collection_id AND c.user_id = auth.uid()));

-- Records: access restricted to collection owner
CREATE POLICY "Users can view records in their own collections"
  ON public.records FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = records.collection_id AND c.user_id = auth.uid()));

CREATE POLICY "Users can insert records in their own collections"
  ON public.records FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = records.collection_id AND c.user_id = auth.uid()));

CREATE POLICY "Users can update records in their own collections"
  ON public.records FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = records.collection_id AND c.user_id = auth.uid()));

CREATE POLICY "Users can delete records in their own collections"
  ON public.records FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = records.collection_id AND c.user_id = auth.uid()));

-- Collection Sources
CREATE POLICY "Users can view collection sources for their own collections"
  ON public.collection_sources FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_sources.collection_id AND c.user_id = auth.uid()));

CREATE POLICY "Users can insert collection sources for their own collections"
  ON public.collection_sources FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_sources.collection_id AND c.user_id = auth.uid()));

-- Sources: platform metadata readable by authenticated users
CREATE POLICY "Authenticated users can view platform sources"
  ON public.sources FOR SELECT
  TO authenticated
  USING (true);

-- Export History: users only view and add their own export records
CREATE POLICY "Users can view their own export history"
  ON public.export_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own export history"
  ON public.export_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Collection History: users only view and add their own activity audit records
CREATE POLICY "Users can view their own collection history"
  ON public.collection_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collection history"
  ON public.collection_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- DATABASE TRIGGER FOR AUTO PROFILE CREATION
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- SEED DEFAULT PLATFORM SOURCES
-- ==============================================================================

INSERT INTO public.sources (name, type, url, status)
VALUES
  ('Public Demo Data Registry', 'Demo Source', 'https://api.datapilot.demo/v1/registry', 'available'),
  ('Public Jobs API (Demo)', 'API', 'https://api.datapilot.demo/v1/jobs', 'available'),
  ('Open SaaS Directory', 'Public Dataset', 'https://datasets.datapilot.demo/saas-index', 'available'),
  ('Public Developer Registry', 'Public Dataset', 'https://datasets.datapilot.demo/dev-profiles', 'available')
ON CONFLICT DO NOTHING;
