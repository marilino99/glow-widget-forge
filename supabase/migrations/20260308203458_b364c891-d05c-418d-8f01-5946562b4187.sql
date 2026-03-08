
-- Drop the IVFFlat approach and use HNSW which works on empty tables
CREATE INDEX training_chunks_embedding_idx ON public.training_chunks 
USING hnsw (embedding vector_cosine_ops);
