
-- Create training_chunks table for RAG
CREATE TABLE public.training_chunks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id uuid NOT NULL REFERENCES public.training_sources(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    content text NOT NULL DEFAULT '',
    chunk_index integer NOT NULL DEFAULT 0,
    embedding vector(768),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for filtering by user
CREATE INDEX training_chunks_user_id_idx ON public.training_chunks(user_id);
CREATE INDEX training_chunks_source_id_idx ON public.training_chunks(source_id);

-- Enable RLS
ALTER TABLE public.training_chunks ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own chunks"
    ON public.training_chunks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chunks"
    ON public.training_chunks FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert chunks"
    ON public.training_chunks FOR INSERT
    WITH CHECK (true);

-- Similarity search function
CREATE OR REPLACE FUNCTION public.match_training_chunks(
    query_embedding vector(768),
    match_user_id uuid,
    match_threshold float DEFAULT 0.3,
    match_count int DEFAULT 8
)
RETURNS TABLE (
    id uuid,
    source_id uuid,
    content text,
    chunk_index integer,
    similarity float
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        tc.id,
        tc.source_id,
        tc.content,
        tc.chunk_index,
        (1 - (tc.embedding <=> query_embedding))::float AS similarity
    FROM public.training_chunks tc
    WHERE tc.user_id = match_user_id
        AND tc.embedding IS NOT NULL
        AND (1 - (tc.embedding <=> query_embedding))::float > match_threshold
    ORDER BY tc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
