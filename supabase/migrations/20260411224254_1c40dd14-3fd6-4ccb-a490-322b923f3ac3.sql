-- Fix: restrict training_chunks DELETE policy to authenticated role only
DROP POLICY IF EXISTS "Users can delete their own chunks" ON public.training_chunks;

CREATE POLICY "Users can delete their own chunks"
ON public.training_chunks
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);