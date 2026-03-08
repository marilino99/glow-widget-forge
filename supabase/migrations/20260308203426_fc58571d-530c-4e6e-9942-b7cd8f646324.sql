
-- Enable pgvector in public schema so operators work naturally
CREATE EXTENSION IF NOT EXISTS vector SCHEMA public;
