-- Add UPDATE policy for wishlist_items to support upsert operations
CREATE POLICY "Users can update their own wishlist" ON public.wishlist_items
  FOR UPDATE USING (auth.uid() = user_id); 